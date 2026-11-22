<?php
// Solo para `npm run preview`: emula direcciones de Apache con el servidor de PHP.
$root = $_SERVER['DOCUMENT_ROOT'];
$path = rawurldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
if (str_starts_with($path, '/api/')) {
    $file = $root . $path;
    if (is_file($file) && !preg_match('~/(_lib|config)\.php$~', $path)) { chdir(dirname($file)); require $file; return; }
    http_response_code(404); return;
}
if (is_file($root . $path)) { return false; }
if (is_file($root . rtrim($path, '/') . '/index.xml')) { header('Content-Type: application/rss+xml; charset=utf-8'); readfile($root . rtrim($path, '/') . '/index.xml'); return; }
if (is_file($root . rtrim($path, '/') . '/index.html')) { header('Content-Type: text/html; charset=utf-8'); readfile($root . rtrim($path, '/') . '/index.html'); return; }
http_response_code(404); header('Content-Type: text/html; charset=utf-8'); readfile($root . '/404.html');
