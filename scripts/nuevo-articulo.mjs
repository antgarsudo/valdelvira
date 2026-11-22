// Crea un borrador de artículo del blog con el frontmatter correcto.
// Uso: npm run nuevo-articulo -- "Título del artículo" [trafico|otros] [/url-del-servicio/]
import { writeFileSync, existsSync } from 'node:fs';
const [title, categoria = 'trafico', servicio = '/abogados-accidentes-trafico/'] = process.argv.slice(2);
if (!title) { console.error('Uso: npm run nuevo-articulo -- "Título" [trafico|otros] [/servicio/]'); process.exit(1); }
const slug = title.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70);
const file = `src/content/blog/${slug}.md`;
if (existsSync(file)) { console.error(`Ya existe ${file}`); process.exit(1); }
const today = new Date().toISOString().slice(0, 10);
writeFileSync(file, `---
url: /blog/${slug}/
title: "${title.slice(0, 60)}"
description: "[Entre 140 y 160 caracteres, termina con llamada a la acción y el 954 72 52 12.]"
h1: "${title}"
resumen: "[Resumen de 80 a 300 caracteres para los listados.]"
categoria: ${categoria}
servicio: ${servicio}
datePublished: ${today}
updated: ${today}
faqs:
  - q: "[Pregunta real 1]"
    a: "[Respuesta de 40 a 80 palabras con un dato concreto.]"
  - q: "[Pregunta real 2]"
    a: "[Respuesta de 40 a 80 palabras con un dato concreto.]"
  - q: "[Pregunta real 3]"
    a: "[Respuesta de 40 a 80 palabras con un dato concreto.]"
  - q: "[Pregunta real 4]"
    a: "[Respuesta de 40 a 80 palabras con un dato concreto.]"
---

## [Primer apartado: la primera frase responde al título]

Texto. Enlaza a [la página del servicio](${servicio}) y a otro artículo.
`);
console.log(`Creado ${file}. Rellénalo y ejecuta npm run build: el build avisa si algo no cumple.`);
