// Tras compilar: genera dist/.htaccess (CSP con hashes de lo que va en línea, redirecciones 301) y comprueba
// las reglas que no se pueden romper. Si algo grave falla, la compilación se para.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync, statSync, rmSync } from 'node:fs';
import { join, relative } from 'node:path';

const dist = 'dist';
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const files = walk(dist);
const html = files.filter((f) => f.endsWith('.html'));
const sha = (s) => `'sha256-${createHash('sha256').update(s).digest('base64')}'`;
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const scripts = new Set(), styles = new Set(), errors = [], warns = [];
const titles = new Map(), descs = new Map();
const emailRe = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/;
const LEGAL = ['/aviso-legal/', '/politica-de-privacidad/', '/politica-de-cookies/', '/declaracion-de-accesibilidad/'];
const VERIFY = /^\/google[0-9a-f]+\.html$/;
// demo = copia de revisión para la clienta en Cloudflare Pages (CF_PAGES lo define Cloudflare al compilar).
const demo = process.env.DEPLOY_TARGET === 'demo' || !!process.env.CF_PAGES;
const preview = process.env.DEPLOY_TARGET === 'preview' || demo;
let pendientes = 0, verificar = 0;

for (const f of html) {
  const route = '/' + relative(dist, f).replace(/index\.html$/, '');
  if (VERIFY.test(route)) continue;
  const s = readFileSync(f, 'utf8');
  for (const m of s.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) if (!/\bsrc=/.test(m[1]) && !/application\/ld\+json/.test(m[1])) scripts.add(sha(m[2]));
  for (const m of s.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)) styles.add(sha(m[1]));
  if (/\sstyle="/.test(s)) errors.push(`${f}: atributo style (lo bloquearía la CSP)`);
  if (/<img\b[^>]*\ssrc="https?:/.test(s)) errors.push(`${f}: imagen externa (la CSP solo permite imágenes propias)`);
  const robots = s.match(/<meta name="robots" content="([^"]+)"/)?.[1] ?? '';
  const noindex = robots.startsWith('noindex');
  if (LEGAL.includes(route) && !noindex) errors.push(`${f}: página legal sin noindex`);
  if (route === '/' && !preview && noindex) errors.push(`${f}: la portada no puede llevar noindex`);
  // Correos en claro: prohibidos en todo el HTML visible (se ofuscan con <Email />).
  const visible = s.replace(/<(script|style)\b[\s\S]*?<\/\1>/g, '');
  const em = visible.match(emailRe);
  if (em && !/\.(png|jpe?g|webp|avif|gif|svg)$/i.test(em[0])) errors.push(`${f}: correo en claro (${em[0]})`);
  if (route !== '/404.html' && !/<link rel="canonical"/.test(s)) errors.push(`${f}: sin canonical`);
  const h1 = (s.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) errors.push(`${f}: ${h1} <h1> (debe haber exactamente uno)`);
  if (!/<html lang="es"/.test(s)) errors.push(`${f}: falta lang="es"`);
  if (/<img\b(?![^>]*\balt\b)[^>]*>/.test(s)) errors.push(`${f}: imagen sin atributo alt`);
  if (!/href="tel:\+34954725212"/.test(s)) errors.push(`${f}: falta el teléfono pulsable`);
  if (/V &amp;amp; V|V &amp; V/.test(s)) errors.push(`${f}: el nombre aparece como «V & V»`);
  if (!noindex && route !== '/404.html') {
    const title = decode(s.match(/<title>([^<]*)<\/title>/)?.[1] ?? '');
    const desc = decode(s.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '');
    if (title.length > 60) warns.push(`title de ${title.length} caracteres en ${route}`);
    if (desc.length < 140 || desc.length > 160) warns.push(`description de ${desc.length} caracteres en ${route}`);
    if (titles.has(title)) warns.push(`title duplicado: ${route} y ${titles.get(title)}`);
    if (descs.has(desc)) warns.push(`description duplicada: ${route} y ${descs.get(desc)}`);
    titles.set(title, route); descs.set(desc, route);
    const body = visible;
    pendientes += (body.match(/\[PENDIENTE/g) || []).length;
    verificar += (body.match(/\[VERIFICAR/g) || []).length;
  }
}
for (const f of files.filter((x) => /\.(js|json|xml|txt)$/.test(x))) {
  const m = readFileSync(f, 'utf8').match(emailRe);
  if (m && !/\.(png|jpe?g|webp|avif|gif|svg)$/i.test(m[0])) errors.push(`${f}: correo en claro (${m[0]})`);
}
if (errors.length) { console.error('postbuild: ERRORES\n' + errors.join('\n')); process.exit(1); }
for (const w of warns) console.warn(`postbuild: aviso: ${w}`);

const robots = preview
  ? 'Header always set X-Robots-Tag "noindex, nofollow"'
  : `<If "%{REQUEST_URI} =~ m#^/(aviso-legal|politica-de-privacidad|politica-de-cookies|declaracion-de-accesibilidad|mapa-del-sitio|buscar|gracias|api)/#">\n    Header always set X-Robots-Tag "noindex, follow"\n  </If>`;
const tpl = readFileSync('scripts/htaccess.tpl', 'utf8')
  .replace('__SCRIPT_HASHES__', [...scripts].join(' '))
  .replace('__STYLE_HASHES__', [...styles].join(' '))
  .replace('__ROBOTS_RULE__', robots);
writeFileSync(join(dist, '.htaccess'), tpl);
if (preview) writeFileSync(join(dist, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
console.log(`postbuild: ${html.length} páginas; ${scripts.size} scripts y ${styles.size} estilos en línea con hash; ${preview ? 'PREVIEW (noindex)' : 'producción'}; ${pendientes} [PENDIENTE] y ${verificar} [VERIFICAR] en páginas indexables.`);
if (!preview && (pendientes || verificar)) console.warn('postbuild: quedan marcadores [PENDIENTE]/[VERIFICAR]: revisa PENDIENTES.md antes de publicar en producción.');

// ---------- Demo en Cloudflare Pages: sin PHP ni .htaccess; cabeceras y 301 en _headers / _redirects ----------
if (demo) {
  const csp = tpl.match(/Content-Security-Policy "([^"]+)"/)[1];
  writeFileSync(join(dist, '_headers'), `/*
  X-Robots-Tag: noindex, nofollow
  Content-Security-Policy: ${csp}
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=(), browsing-topics=()
  Cross-Origin-Opener-Policy: same-origin
/_astro/*
  Cache-Control: public, max-age=31536000, immutable
/fonts/*
  Cache-Control: public, max-age=31536000, immutable
`);
  const redirects = [...tpl.matchAll(/^RewriteRule \^([a-z0-9-]+)\/\?\$ https:\/\/valdelvira-abogados\.com(\/[^\s]*) \[R=301,L\]$/gm)]
    .map(([, from, to]) => `/${from}/ ${to} 301\n/${from} ${to} 301`);
  writeFileSync(join(dist, '_redirects'), redirects.join('\n') + '\n');
  rmSync(join(dist, '.htaccess'), { force: true });
  rmSync(join(dist, 'api'), { recursive: true, force: true });
  const banner = '<div class="demo-banner" role="note"><strong>Versión de prueba para revisión.</strong> No es la web publicada: los textos en amarillo están pendientes y el formulario no envía mensajes. Para cita, llame al 954 72 52 12.</div>';
  for (const f of html) writeFileSync(f, readFileSync(f, 'utf8').replace(/<body([^>]*)>/, `<body$1>${banner}`));
  console.log(`postbuild: DEMO Cloudflare: _headers, _redirects (${redirects.length} reglas), aviso de versión de prueba, sin api/ ni .htaccess.`);
}
