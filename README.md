# valdelvira-abogados.com

Web estática en Astro del despacho Valdelvira Abogados (Dos Hermanas). Sustituye al WordPress anterior (copia en `wordpress/`).

## Trabajar en la web

```bash
npm install          # una vez
npm run dev          # http://localhost:4321 (sin formulario PHP)
npm run preview      # compila y sirve dist/ con PHP en http://localhost:4321 (formulario incluido)
npm run build        # compila y comprueba: falla si hay correos en claro, páginas legales sin noindex,
                     # más de un <h1>, imágenes sin alt, estilos en línea, falta el teléfono pulsable…
```

- **Datos del despacho** (teléfono, dirección, horario, colegiada, zonas): solo en `src/data/negocio.ts`. Cambian en cabecera, pie, contacto, textos legales y schema a la vez.
- **Servicios**: `src/content/servicios/*.md`. **Blog**: `src/content/blog/*.md`. El esquema (`src/content.config.ts`) exige `title` ≤ 60, `description` 140–160, `h1`, `updated` y de 4 a 8 `faqs`; si no se cumple, el build se para.
- **Nuevo artículo**: `npm run nuevo-articulo -- "Título" trafico /abogados-accidentes-trafico/` crea el borrador.
- **Imágenes**: déjelas en `src/assets/` (JPG o WebP grande). Astro genera AVIF y WebP a varios tamaños.
- **Marcadores**: `[PENDIENTE: …]` y `[VERIFICAR …]` se ven resaltados en amarillo. El build los cuenta. Ver `PENDIENTES.md`.

## Formulario de cita

`public/api/contact.php` envía la solicitud a sonia@ y una confirmación al cliente (con `mail()` de PHP; si se crea `api/.data/smtp.php`, usa SMTP autenticado). Antibots sin captcha: campo trampa, token firmado de un solo uso con tiempo mínimo de 3 s, comprobación de origen y límite de envíos por IP y por correo. Tras enviar, redirige a `/gracias/` (noindex). `api/.data/` (secreto y límites) no se publica ni se sobrescribe al desplegar.

## Seguridad y rendimiento

`scripts/postbuild.mjs` genera `dist/.htaccess` a partir de `scripts/htaccess.tpl`: 301 de las URLs antiguas en un solo salto, http/www → https sin www, CSP estricta con hashes, HSTS, `X-Robots-Tag: noindex` en legales, caché inmutable para `/_astro/` y fuentes. CSS crítico en línea, cero JavaScript salvo menú, formulario, buscador, mapa y correo ofuscado. Los correos nunca aparecen en claro en el HTML.

## Publicar, previsualizar y volver atrás

1. Copie `.env.deploy.example` a `.env.deploy` y rellénelo (alias SSH del hosting y rutas).
2. `npm run deploy:preview` → publica en la carpeta de pruebas con `noindex` y `robots.txt` cerrado.
3. `npm run deploy` → pide escribir `SI`, guarda una copia `.tgz` del servidor en `BACKUP_DIR` (conserva las 10 últimas) y publica. La primera vez, como hay WordPress, exige `sh scripts/deploy.sh production --primera-vez` (haga antes copia de la base de datos).
4. `npm run rollback` lista las copias; `npm run rollback -- production-AAAAMMDD-HHMMSS.tgz` restaura una.

Sin SSH: `npm run paquete` crea `entregas/valdelvira-production-FECHA.zip`; súbalo y descomprímalo en la raíz de la web (incluye el `.htaccess` oculto). Conserve los ZIP anteriores como copia para volver atrás.

Recomendado: `git init` y un commit tras cada cambio, para tener historial además de las copias del servidor.

## Tras publicar

Ver la lista de comprobación de `PENDIENTES.md` (Search Console, sitemap, 301, PageSpeed, schema).

## Demo para la clienta (Cloudflare Pages)

Cloudflare Pages se usa solo como copia de revisión, no como web definitiva. Al compilar allí (Cloudflare define `CF_PAGES` o `WORKERS_CI`), el build:

- pone `noindex` en todas las páginas y cierra el `robots.txt`;
- genera `_headers` (CSP y cabeceras de seguridad) y `_redirects` con las 301;
- quita el `.htaccess` y la carpeta `api/` (Cloudflare no ejecuta PHP);
- añade arriba un aviso: «Versión de prueba para revisión».

El formulario no envía mensajes en la demo. En local se prueba con `npm run build:demo`.

Configuración en Cloudflare (Workers o Pages, conectado a Git). `wrangler.jsonc` sirve `dist/` como sitio estático, sin adaptador. Datos:

- Repositorio: `antgarsudo/valdelvira`.
- Framework preset: Astro.
- Build command: `npm run build`.
- Output: `dist`.

La versión de Node la toma de `.node-version`. Cada push a `main` vuelve a publicar la demo.
