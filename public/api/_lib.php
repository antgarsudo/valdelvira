<?php
declare(strict_types=1);
date_default_timezone_set('Europe/Madrid');

function pp_config(): array { return require __DIR__ . '/config.php'; }

function pp_json(int $status, array $body): never {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Robots-Tag: noindex');
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

function pp_data_dir(): string {
    $dir = getenv('PP_DATA_DIR') ?: __DIR__ . '/.data';
    if (!is_dir($dir)) { mkdir($dir, 0700, true); }
    $deny = $dir . '/.htaccess';
    if (!is_file($deny)) { file_put_contents($deny, "Require all denied\n"); }
    return $dir;
}

function pp_secret(): string {
    $path = pp_data_dir() . '/secret.key';
    $fh = fopen($path, 'c+');
    flock($fh, LOCK_EX);
    $key = stream_get_contents($fh);
    if (strlen((string) $key) < 32) {
        $key = bin2hex(random_bytes(32));
        ftruncate($fh, 0);
        rewind($fh);
        fwrite($fh, $key);
        chmod($path, 0600);
    }
    flock($fh, LOCK_UN);
    fclose($fh);
    return $key;
}

function pp_hash(string $value): string { return hash_hmac('sha256', $value, pp_secret()); }

/** Devuelve false si la clave ha superado $max usos en $window segundos. No guarda IP ni correos en claro. */
function pp_limit(string $key, int $max, int $window): bool {
    $dir = pp_data_dir() . '/limits';
    if (!is_dir($dir)) { mkdir($dir, 0700, true); }
    $fh = fopen($dir . '/' . pp_hash($key), 'c+');
    flock($fh, LOCK_EX);
    $now = time();
    $hits = array_filter(json_decode((string) stream_get_contents($fh), true) ?: [], fn ($t) => $t > $now - $window);
    $ok = count($hits) < $max;
    if ($ok) { $hits[] = $now; }
    ftruncate($fh, 0);
    rewind($fh);
    fwrite($fh, json_encode(array_values($hits)));
    flock($fh, LOCK_UN);
    fclose($fh);
    if (random_int(1, 50) === 1) {
        foreach (glob($dir . '/*') ?: [] as $f) { if (filemtime($f) < $now - 172800) { @unlink($f); } }
    }
    return $ok;
}

/** Registro técnico en api/.data/form.log, sin direcciones de correo ni contenido de los mensajes. */
function pp_log(string $event): void {
    $path = pp_data_dir() . '/form.log';
    if (is_file($path) && filesize($path) > 200000) { rename($path, $path . '.1'); }
    $clean = preg_replace('/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+/', '[correo]', $event);
    file_put_contents($path, date('c') . ' ' . str_replace(["\r", "\n"], ' ', (string) $clean) . "\n", FILE_APPEND | LOCK_EX);
}

/** Envío SMTP autenticado. Devuelve null si va bien, o el motivo del fallo. */
function pp_smtp(array $smtp, string $to, string $subject, string $encodedBody, array $headers, string $from): ?string {
    $secure = $smtp['secure'] ?? 'ssl';
    $host = (string) $smtp['host'];
    $target = ($secure === 'ssl' ? 'ssl://' : 'tcp://') . $host . ':' . (int) ($smtp['port'] ?? 465);
    $fh = @stream_socket_client($target, $errno, $errstr, 12);
    if (!$fh) { return "conexión a {$host}: {$errstr}"; }
    stream_set_timeout($fh, 12);
    $read = function () use ($fh): string {
        $out = '';
        while (($line = fgets($fh, 1024)) !== false) {
            $out .= $line;
            if (strlen($line) < 4 || $line[3] === ' ') { break; }
        }
        return $out;
    };
    $error = null;
    $step = function (?string $command, array $ok) use ($fh, $read, &$error): bool {
        if ($error !== null) { return false; }
        if ($command !== null) { fwrite($fh, $command . "\r\n"); }
        $reply = $read();
        if (!in_array((int) substr($reply, 0, 3), $ok, true)) {
            $error = 'respuesta SMTP: ' . trim($reply);
            return false;
        }
        return true;
    };
    $name = $_SERVER['SERVER_NAME'] ?? 'localhost';
    $step(null, [220]);
    $step("EHLO {$name}", [250]);
    if ($secure === 'tls' && $step('STARTTLS', [220])) {
        if (!stream_socket_enable_crypto($fh, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) { $error = 'no se pudo activar TLS'; }
        $step("EHLO {$name}", [250]);
    }
    if (($smtp['user'] ?? '') !== '') {
        $step('AUTH LOGIN', [334]);
        $step(base64_encode((string) $smtp['user']), [334]);
        $step(base64_encode((string) $smtp['pass']), [235]);
    }
    $step("MAIL FROM:<{$from}>", [250]);
    $step("RCPT TO:<{$to}>", [250, 251]);
    $step('DATA', [354]);
    $message = array_merge($headers, [
        'To: <' . $to . '>',
        'Subject: =?UTF-8?B?' . base64_encode($subject) . '?=',
        'Date: ' . date('r'),
        'Message-ID: <' . bin2hex(random_bytes(12)) . '@' . substr(strrchr($from, '@'), 1) . '>',
    ]);
    $step(implode("\r\n", $message) . "\r\n\r\n" . $encodedBody . "\r\n.", [250]);
    fwrite($fh, "QUIT\r\n");
    fclose($fh);
    return $error;
}

function pp_send(string $to, string $subject, string $body, array $cfg, ?string $replyTo = null): bool {
    $from = '=?UTF-8?B?' . base64_encode($cfg['from_name']) . '?= <' . $cfg['from'] . '>';
    $headers = [
        'From: ' . $from,
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: base64',
    ];
    $headers[] = $replyTo ? 'Reply-To: ' . $replyTo : 'Auto-Submitted: auto-replied';
    $kind = $replyTo ? 'notificación' : 'confirmación';
    $sink = getenv('PP_MAIL_SINK');
    if ($sink) {
        return file_put_contents($sink, json_encode(compact('to', 'subject', 'body', 'headers'), JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND) !== false;
    }
    // Opcional: si existe api/.data/smtp.php, se envía con SMTP. Sin ese archivo se usa mail() de PHP.
    $smtpFile = pp_data_dir() . '/smtp.php';
    if (is_file($smtpFile)) {
        $failure = pp_smtp(require $smtpFile, $to, $subject, chunk_split(base64_encode($body)), $headers, $cfg['from']);
        pp_log($failure === null ? "{$kind}: aceptada por SMTP" : "{$kind}: FALLO SMTP, {$failure}");
        return $failure === null;
    }
    // Envío directo por PHP, en el mismo formato que los demás formularios: texto en 8 bits, sin codificar el cuerpo.
    $plain = ['From: ' . $from, 'MIME-Version: 1.0', 'Content-Type: text/plain; charset=UTF-8', 'Content-Transfer-Encoding: 8bit'];
    if ($replyTo) { $plain[] = 'Reply-To: ' . $replyTo; }
    $ok = mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, implode("\r\n", $plain), '-f' . $cfg['from']);
    pp_log($kind . ($ok ? ': entregada a mail() de PHP (no garantiza la llegada)' : ': FALLO, mail() devolvió false'));
    return $ok;
}
