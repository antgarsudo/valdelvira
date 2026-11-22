<?php
declare(strict_types=1);
require __DIR__ . '/_lib.php';

$cfg = pp_config();
$fail = fn (int $code, string $msg) => pp_json($code, ['ok' => false, 'error' => $msg]);
$generic = 'No se ha podido enviar el mensaje. Recargue la página e inténtelo de nuevo, o llame al 954 72 52 12.';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') { $fail(405, $generic); }

// Origen: solo desde este sitio
$origin = parse_url($_SERVER['HTTP_ORIGIN'] ?? '', PHP_URL_HOST);
$allowed = getenv('PP_MAIL_SINK') ? array_merge($cfg['hosts'], ['localhost', '127.0.0.1']) : $cfg['hosts'];
if (!$origin || !in_array($origin, $allowed, true)) { $fail(403, $generic); }

$ip = $_SERVER['REMOTE_ADDR'] ?? '0';
if (!pp_limit('ip:' . $ip, 5, 3600) || !pp_limit('global', 60, 86400)) {
    $fail(429, 'Ha enviado varios mensajes seguidos. Inténtelo de nuevo dentro de un rato o llame al 954 72 52 12.');
}

// Trampa para bots: se responde como si todo hubiera ido bien
if (trim((string) ($_POST['campo_c7'] ?? '')) !== '') {
    pp_log('descartado: campo trampa relleno');
    pp_json(200, ['ok' => true]);
}

// Token firmado, de un solo uso, con tiempo mínimo y máximo
$parts = explode('.', (string) ($_POST['token'] ?? ''));
if (count($parts) !== 3 || !ctype_digit($parts[0]) || !hash_equals(pp_hash($parts[0] . '.' . $parts[1]), $parts[2])) { $fail(400, $generic); }
$age = time() - (int) $parts[0];
if ($age < 3 || $age > 7200) { $fail(400, $generic); }
if (!pp_limit('token:' . $parts[1], 1, 7200)) { $fail(400, $generic); }

// Validación
$clean = fn (string $k, int $max) => mb_substr(trim(str_replace("\0", '', (string) ($_POST[$k] ?? ''))), 0, $max);
$name = preg_replace('/[\r\n\t]+/', ' ', $clean('nombre', 120));
$phone = preg_replace('/[^0-9+() .-]/', '', $clean('telefono', 20));
$email = $clean('correo', 190);
$message = $clean('mensaje', 4000);
$temas = ['Accidente de tráfico', 'Lesiones o latigazo cervical', 'Reclamación a la aseguradora', 'Alcoholemia o delito de tráfico', 'Multa o pérdida de puntos', 'Familia o divorcio', 'Herencia', 'Desahucio', 'Derecho civil o deudas', 'Otro asunto'];
$tema = in_array($_POST['tema'] ?? '', $temas, true) ? $_POST['tema'] : 'Otro asunto';

if ($name === '' || strlen(preg_replace('/\D/', '', $phone)) < 9 || mb_strlen($message) < 10 || ($_POST['acepta'] ?? '') !== '1' || !filter_var($email, FILTER_VALIDATE_EMAIL) || preg_match('/[\r\n]/', $email)) {
    $fail(422, 'Revise los campos del formulario: nombre, teléfono, correo, mensaje y aceptación de la política de privacidad.');
}
if (preg_match_all('~https?://|www\.~i', $message) > 2) {
    $fail(422, 'El mensaje contiene demasiados enlaces. Quite alguno e inténtelo de nuevo.');
}
// Evita usar el formulario para enviar muchos correos a una misma dirección
if (!pp_limit('mail:' . strtolower($email), 2, 3600)) {
    $fail(429, 'Ya hemos recibido varios mensajes desde este correo. Inténtelo de nuevo más tarde o llame al 954 72 52 12.');
}

$notice = "Nueva solicitud de cita desde valdelvira-abogados.com\n\nNombre: {$name}\nTeléfono: {$phone}\nCorreo: {$email}\nTema: {$tema}\n\nMensaje:\n{$message}\n\nEnviado: " . date('d/m/Y H:i') . "\n";
if (!pp_send($cfg['to'], 'Cita web: ' . $tema . ' (' . $name . ')', $notice, $cfg, $email)) {
    error_log('Formulario: fallo al enviar la notificación');
    $fail(502, 'No se ha podido enviar la solicitud. Inténtelo de nuevo en unos minutos o llame al 954 72 52 12.');
}

// La respuesta automática no repite nada escrito en el formulario, para que no sirva para enviar spam a terceros.
$thanks = "Gracias por contactar con Valdelvira Abogados.\n\n"
    . "Hemos recibido su solicitud y le llamaremos en horario de despacho (lunes a viernes por la mañana).\n"
    . "Si su asunto es urgente, llámenos al 954 72 52 12.\n\n"
    . "Por favor, no responda a este correo: se envía desde un buzón no atendido.\n\n"
    . "Sus datos solo se usarán para atender su consulta. Más información en nuestra política de privacidad:\n"
    . $cfg['privacy'] . "\n\n"
    . "Valdelvira Abogados\nAv. de España, 57, Edificio D. José, 1ª planta, oficina 25. 41704 Dos Hermanas (Sevilla)\n";
if (!pp_send($email, 'Hemos recibido su solicitud de cita', $thanks, $cfg)) {
    error_log('Formulario: fallo al enviar la confirmación');
}

pp_json(200, ['ok' => true]);
