import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import { rehypePending } from './src/integrations/rehype-pending.mjs';

// Páginas que no se indexan: fuera del sitemap (y con noindex en la propia página y en X-Robots-Tag).
const EXCLUDED = ['/aviso-legal/', '/politica-de-privacidad/', '/politica-de-cookies/', '/declaracion-de-accesibilidad/', '/mapa-del-sitio/', '/buscar/', '/gracias/', '/404'];

export default defineConfig({
  site: 'https://valdelvira-abogados.com',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'always' },
  compressHTML: true,
  devToolbar: { enabled: false },
  image: { responsiveStyles: false },
  vite: { build: { assetsInlineLimit: 0 } },
  markdown: { syntaxHighlight: false, processor: unified({ rehypePlugins: [rehypePending] }) },
  integrations: [
    sitemap({ filter: (page) => !EXCLUDED.some((p) => page.endsWith(p) || page.includes(p)) }),
  ],
});
