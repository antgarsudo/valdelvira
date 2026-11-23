import type { APIRoute } from 'astro';
import { getServicios, getArticulos, plain } from '../lib/content';

export const GET: APIRoute = async () => {
  const fijas = [
    { t: 'Pedir cita', u: '/solicitar-cita/', d: 'Formulario, teléfono, dirección y horario del despacho en Dos Hermanas.', k: 'cita contacto teléfono horario dirección' },
    { t: 'El despacho: Sonia Valdelvira', u: '/despacho/', d: 'Abogada especialista en tráfico en Dos Hermanas.', k: 'abogada despacho quiénes somos colegiada' },
    { t: 'Servicios jurídicos', u: '/servicios/', d: 'Todos los servicios del despacho.', k: 'servicios' },
    { t: 'Blog', u: '/blog/', d: 'Artículos sobre accidentes de tráfico, familia y herencias.', k: 'blog artículos' },
  ];
  const servicios = (await getServicios()).map((s) => ({ t: s.data.h1, u: s.data.url, d: s.data.description, k: `${s.data.navLabel} ${s.data.resumen} ${plain(s.body ?? '').slice(0, 4000)}` }));
  const blog = (await getArticulos()).map((a) => ({ t: a.data.h1, u: a.data.url, d: a.data.description, k: `${a.data.resumen} ${plain(a.body ?? '').slice(0, 4000)}` }));
  return new Response(JSON.stringify([...fijas, ...servicios, ...blog]), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
