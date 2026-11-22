import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const faq = z.object({ q: z.string().min(10), a: z.string().min(40) });
const url = z.string().regex(/^\/[a-z0-9/-]*\/$/, 'URL con barra inicial y final');

/** Imágenes disponibles en src/assets/ (sin extensión). */
export const IMAGENES = [
  'accidente', 'familia', 'herencias', 'desahucios', 'civil', 'deudas',
  'despacho-mesa', 'despacho-sala', 'despacho-carpetas', 'despacho-rotulo', 'despacho-reuniones', 'despacho-trabajo', 'articulo-accidente',
] as const;

const servicios = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/servicios' }),
  schema: z.object({
    url,
    title: z.string().max(60),
    description: z.string().min(140).max(160),
    h1: z.string(),
    navLabel: z.string(),
    resumen: z.string().min(200).max(600),
    bloque: z.enum(['trafico', 'otros']),
    padre: url.optional(),
    orden: z.number(),
    serviceType: z.string(),
    lead: z.string().max(110),
    intro: z.string().min(80),
    imagen: z.enum(IMAGENES),
    imagenAlt: z.string().min(15),
    relacionados: z.array(url).min(2),
    updated: z.coerce.date(),
    faqs: z.array(faq).min(4).max(8),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/blog' }),
  schema: z.object({
    url,
    title: z.string().max(60),
    description: z.string().min(140).max(160),
    h1: z.string(),
    resumen: z.string().min(80).max(300),
    categoria: z.enum(['trafico', 'otros']),
    servicio: url,
    imagen: z.enum(IMAGENES).optional(),
    imagenAlt: z.string().optional(),
    datePublished: z.coerce.date(),
    updated: z.coerce.date(),
    faqs: z.array(faq).min(4).max(6),
  }),
});

export const collections = { servicios, blog };
