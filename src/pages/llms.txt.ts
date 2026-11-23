// /llms.txt: resumen del sitio para asistentes de IA (formato llmstxt.org), generado desde el contenido.
import type { APIRoute } from 'astro';
import { getServicios, getArticulos } from '../lib/content';
import { NEGOCIO, SITE_URL, DIRECCION_LINEA } from '../data/negocio';

const abs = (p: string) => new URL(p, SITE_URL).href;
const clean = (s: string) =>
  s.replace(/\s*\[(PENDIENTE|VERIFICAR)[^\]]*\]/g, '').replace(/\s*(Llame|Llámenos|Consulte|Pida|Contacte|Solicite|Le atendemos)[^.]*\.?$/i, '').replace(/\s+/g, ' ').trim();

export const GET: APIRoute = async () => {
  const servicios = await getServicios();
  const articulos = await getArticulos();
  const linea = (t: string, u: string, d: string) => `- [${t}](${abs(u)}): ${clean(d)}`;
  const horario = NEGOCIO.horario.map((h) => `${h.etiqueta} de ${h.abre} a ${h.cierra}`).join('; ');
  const txt = `# ${NEGOCIO.nombre}

> Despacho de la abogada ${NEGOCIO.abogada} en Dos Hermanas (Sevilla), especializado en derecho de tráfico: reclamación de indemnizaciones por accidente, lesiones y latigazo cervical, reclamaciones a aseguradoras, y alcoholemia y delitos de tráfico. También atiende derecho de familia, herencias, desahucios y derecho civil.

- Dirección: ${DIRECCION_LINEA}
- Teléfono: ${NEGOCIO.telefonoIntl}
- Horario: ${horario}; sábados y domingos cerrado
- Zona: ${NEGOCIO.zonas.join(', ')}; servicio en toda España
- Abogada colegiada nº ${NEGOCIO.colegiada}
- Idioma: español

Los contenidos son información general y no sustituyen el asesoramiento sobre un caso concreto. Para una consulta: ${abs('/solicitar-cita/')}

## Derecho de tráfico

${servicios.filter((s) => s.data.bloque === 'trafico').map((s) => linea(s.data.h1, s.data.url, s.data.description)).join('\n')}

## Otros servicios

${servicios.filter((s) => s.data.bloque === 'otros').map((s) => linea(s.data.h1, s.data.url, s.data.description)).join('\n')}

## Guías del blog

${articulos.map((a) => linea(a.data.h1, a.data.url, a.data.resumen)).join('\n')}

## Despacho y contacto

- [Sonia Valdelvira, abogada especialista en tráfico](${abs('/despacho/')}): quién es y cómo trabaja el despacho.
- [Pedir cita](${abs('/solicitar-cita/')}): formulario, teléfono, dirección, horario y documentos para la primera consulta.
- [Todos los servicios](${abs('/servicios/')})

## Optional

- [Aviso legal](${abs('/aviso-legal/')})
- [Política de privacidad](${abs('/politica-de-privacidad/')})
- [Declaración de accesibilidad](${abs('/declaracion-de-accesibilidad/')})
- [Mapa del sitio](${abs('/mapa-del-sitio/')})
`;
  return new Response(txt, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
