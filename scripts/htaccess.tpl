# Generado por scripts/postbuild.mjs en cada compilación: no editar dist/.htaccess a mano (edita scripts/htaccess.tpl).
Options -Indexes -MultiViews
DirectorySlash On
DirectoryIndex index.html
AddDefaultCharset UTF-8
ErrorDocument 404 /404.html
AddType font/woff2 .woff2
AddType image/webp .webp
AddType image/avif .avif

RewriteEngine On
RewriteBase /
# HTTPS y dominio sin www, con 301 en un solo salto
RewriteCond %{HTTP_HOST} ^www\.(.+)$ [NC]
RewriteRule ^ https://%1%{REQUEST_URI} [L,R=301]
RewriteCond %{HTTP_HOST} !^(localhost|127\.0\.0\.1)
RewriteCond %{HTTPS} !=on
RewriteCond %{HTTP:X-Forwarded-Proto} !=https
RewriteCond %{REQUEST_URI} !^/\.well-known/
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Archivos internos
RewriteRule (^|/)\.(?!well-known/) - [R=404,L]
<FilesMatch "^(_lib|config)\.php$">
  Require all denied
</FilesMatch>

# URLs de la web anterior (WordPress) → nuevas, 301 en un solo salto
RewriteRule ^derecho-familia/?$ https://valdelvira-abogados.com/abogados-accidentes-trafico/ [R=301,L]
RewriteRule ^abogados-matrimoniales-sevilla/?$ https://valdelvira-abogados.com/abogados-familia/ [R=301,L]
RewriteRule ^divorcio-y-separaciones/?$ https://valdelvira-abogados.com/abogados-familia/ [R=301,L]
RewriteRule ^contratos-civiles/?$ https://valdelvira-abogados.com/derecho-civil/ [R=301,L]
RewriteRule ^abogados-en-sevilla/?$ https://valdelvira-abogados.com/despacho/ [R=301,L]
RewriteRule ^reclame-clausula-suelo/?$ https://valdelvira-abogados.com/derecho-civil/ [R=301,L]
RewriteRule ^category/(consejos|slider)(/.*)?$ https://valdelvira-abogados.com/blog/ [R=301,L]
RewriteRule ^category/ https://valdelvira-abogados.com/blog/ [R=301,L]
RewriteRule ^privacidad/?$ https://valdelvira-abogados.com/politica-de-privacidad/ [R=301,L]
RewriteRule ^inicio/?$ https://valdelvira-abogados.com/ [R=301,L]
RewriteRule ^footer/?$ https://valdelvira-abogados.com/ [R=301,L]
RewriteRule ^(tag|author)/ https://valdelvira-abogados.com/ [R=301,L]
RewriteRule ^(.+)/feed/?$ https://valdelvira-abogados.com/$1/ [R=301,L]
RewriteRule ^(feed|comments/feed)/?$ https://valdelvira-abogados.com/ [R=301,L]
RewriteRule ^(sitemap_index|page-sitemap|post-sitemap|category-sitemap|local-sitemap)\.xml$ https://valdelvira-abogados.com/sitemap-index.xml [R=301,L]
RewriteRule ^wp-content/uploads/2016/12/sentencia-clausulas-suelo\.(pdf|jpg)$ https://valdelvira-abogados.com/derecho-civil/ [R=301,L]
RewriteRule ^wp-content/uploads/ https://valdelvira-abogados.com/ [R=301,L]

# WordPress ya no existe
RewriteRule ^(wp-login\.php|wp-admin|wp-includes|wp-content|xmlrpc\.php|wp-json|wp-cron\.php|wp-comments-post\.php|wp-signup\.php|wp-activate\.php|wp-trackback\.php)(/.*)?$ - [G,L]
RewriteCond %{QUERY_STRING} (^|&)p=156(&|$) [NC]
RewriteRule ^$ https://valdelvira-abogados.com/que-debo-hacer-en-caso-de-tener-un-accidente-de-trafico/? [R=301,L]
RewriteCond %{QUERY_STRING} (^|&)(p|page_id)=\d+ [NC]
RewriteRule ^$ https://valdelvira-abogados.com/? [R=301,L]
RewriteCond %{QUERY_STRING} (^|&)s=([^&]*) [NC]
RewriteRule ^$ https://valdelvira-abogados.com/buscar/?s=%2 [R=301,L,NE]

# Paginación y AMP que ya no existen
RewriteRule ^(.+/)?(amp|embed|trackback)/?$ https://valdelvira-abogados.com/$1 [R=301,L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*/)?page/\d+/?$ https://valdelvira-abogados.com/$1 [R=301,L]

<IfModule mod_headers.c>
  Header always set Content-Security-Policy "default-src 'none'; script-src 'self' __SCRIPT_HASHES__; style-src 'self' __STYLE_HASHES__; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-src https://www.google.com https://maps.google.com; manifest-src 'self'; form-action 'self'; base-uri 'self'; frame-ancestors 'none'; object-src 'none'; upgrade-insecure-requests"
  Header always set X-Content-Type-Options "nosniff"
  Header always set X-Frame-Options "DENY"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=(), browsing-topics=()"
  Header always set Cross-Origin-Opener-Policy "same-origin"
  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains" "expr=%{HTTPS} == 'on'"
  Header unset X-Powered-By
  __ROBOTS_RULE__
  <FilesMatch "\.(html)$">
    Header set Cache-Control "public, max-age=0, must-revalidate"
  </FilesMatch>
  <If "%{REQUEST_URI} =~ m#^/_astro/#">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </If>
  <FilesMatch "\.(woff2)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  <FilesMatch "\.(png|ico|svg|webp|avif|jpg)$">
    Header set Cache-Control "public, max-age=2592000"
  </FilesMatch>
  <FilesMatch "\.(txt|json|xml)$">
    Header set Cache-Control "public, max-age=3600"
  </FilesMatch>
</IfModule>

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css text/plain text/xml application/xml application/javascript text/javascript application/json image/svg+xml
</IfModule>
<IfModule mod_brotli.c>
  AddOutputFilterByType BROTLI_COMPRESS text/html text/css text/plain text/xml application/xml application/javascript text/javascript application/json image/svg+xml
</IfModule>
