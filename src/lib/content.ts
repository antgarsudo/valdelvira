import { getCollection, type CollectionEntry } from 'astro:content';
import type { ImageMetadata } from 'astro';

export type Servicio = CollectionEntry<'servicios'>;
export type Articulo = CollectionEntry<'blog'>;

export const getServicios = async () => (await getCollection('servicios')).sort((a, b) => a.data.orden - b.data.orden);
export const getArticulos = async () =>
  (await getCollection('blog')).sort((a, b) => b.data.updated.valueOf() - a.data.updated.valueOf() || a.data.title.localeCompare(b.data.title));

const imgs = import.meta.glob<{ default: ImageMetadata }>('../assets/*.{webp,jpg,png}', { eager: true });
export const imagen = (key: string): ImageMetadata => {
  const hit = Object.entries(imgs).find(([p]) => p.split('/').pop()!.replace(/\.\w+$/, '') === key);
  if (!hit) throw new Error(`Imagen no encontrada: ${key}`);
  return hit[1].default;
};

/** Cuenta palabras de un texto markdown (para el índice del buscador y las comprobaciones). */
export const plain = (md: string) =>
  md.replace(/```[\s\S]*?```/g, ' ').replace(/!\[[^\]]*\]\([^)]*\)/g, ' ').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[#>*_`|-]/g, ' ').replace(/\s+/g, ' ').trim();
