// Única fuente de los datos del despacho: cabecera, pie, contacto, textos legales y schema.
// Si cambia algo (horario, dirección…), se cambia aquí y se propaga a toda la web.

export const SITE_URL = 'https://valdelvira-abogados.com';

export const NEGOCIO = {
  nombre: 'Valdelvira Abogados',
  abogada: 'Sonia Valdelvira Lobo',
  nif: '48883899K',
  colegiada: '11326',
  colegio: 'Ilustre Colegio de Abogados de Sevilla', // [PENDIENTE: confirmar colegio]
  colegioPendiente: true,
  lema: 'Abogada especialista en tráfico en Dos Hermanas',
  telefono: '954 72 52 12',
  telefonoIntl: '+34 954 72 52 12',
  tel: '+34954725212',
  // El correo nunca se escribe en claro en el HTML: se ofusca con <Email /> (ver src/lib/email.ts).
  email: { usuario: 'sonia', dominio: 'valdelvira-abogados.com' },
  direccion: {
    calle: 'Av. de España, 57',
    detalle: 'Edificio D. José, 1ª planta, oficina 25',
    cp: '41704',
    localidad: 'Dos Hermanas',
    provincia: 'Sevilla',
    pais: 'ES',
  },
  geo: { lat: 37.2937084, lng: -5.9217367 },
  mapsUrl: 'https://maps.app.goo.gl/QrJDUfFVpeaLws558',
  // Horario de la ficha de Google Business Profile (consultada el 22/11/2026).
  horario: [
    { dias: ['Monday', 'Tuesday', 'Wednesday', 'Friday'], etiqueta: 'Lunes, martes, miércoles y viernes', abre: '10:00', cierra: '14:30' },
    { dias: ['Thursday'], etiqueta: 'Jueves', abre: '10:30', cierra: '14:30' },
  ],
  horarioCorto: 'L, M, X y V 10:00–14:30 · J 10:30–14:30',
  zonas: ['Dos Hermanas', 'Montequinto', 'Alcalá de Guadaíra', 'Utrera', 'Los Palacios y Villafranca', 'Coria del Río', 'Sevilla'],
  valoracionGoogle: { nota: '5,0', opiniones: 4 },
} as const;

export const DIRECCION_LINEA = `${NEGOCIO.direccion.calle}, ${NEGOCIO.direccion.detalle}. ${NEGOCIO.direccion.cp} ${NEGOCIO.direccion.localidad} (${NEGOCIO.direccion.provincia})`;

export const MENU_TRAFICO = [
  { label: 'Accidentes de tráfico', href: '/abogados-accidentes-trafico/' },
  { label: 'Accidentes de moto', href: '/abogados-accidentes-trafico/accidente-moto/' },
  { label: 'Atropellos', href: '/abogados-accidentes-trafico/atropello/' },
  { label: 'Bicicleta y patinete', href: '/abogados-accidentes-trafico/bicicleta-patinete/' },
  { label: 'Lesiones y latigazo cervical', href: '/abogados-accidentes-trafico/latigazo-cervical/' },
  { label: 'Fallecimiento en accidente', href: '/abogados-accidentes-trafico/fallecimiento/' },
  { label: 'Reclamación a la aseguradora', href: '/abogados-accidentes-trafico/reclamacion-aseguradora/' },
  { label: 'Alcoholemia y delitos de tráfico', href: '/abogado-alcoholemia-delitos-trafico/' },
];

export const MENU_OTROS = [
  { label: 'Familia y divorcio', href: '/abogados-familia/' },
  { label: 'Herencias', href: '/abogados-herencias/' },
  { label: 'Desahucios', href: '/abogados-desahucios/' },
  { label: 'Derecho civil', href: '/derecho-civil/' },
];

export const LEGALES = [
  { label: 'Aviso legal', href: '/aviso-legal/' },
  { label: 'Política de privacidad', href: '/politica-de-privacidad/' },
  { label: 'Política de cookies', href: '/politica-de-cookies/' },
  { label: 'Accesibilidad', href: '/declaracion-de-accesibilidad/' },
];

/** Temas del desplegable del formulario (también los valida el PHP). */
export const TEMAS = [
  'Accidente de tráfico',
  'Lesiones o latigazo cervical',
  'Reclamación a la aseguradora',
  'Alcoholemia o delito de tráfico',
  'Multa o pérdida de puntos',
  'Familia o divorcio',
  'Herencia',
  'Desahucio',
  'Derecho civil o deudas',
  'Otro asunto',
];

export const fecha = (d: Date) =>
  d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Madrid' });
