<?php
declare(strict_types=1);
require __DIR__ . '/_lib.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') { pp_json(405, ['ok' => false]); }
$payload = time() . '.' . bin2hex(random_bytes(12));
pp_json(200, ['token' => $payload . '.' . pp_hash($payload)]);
