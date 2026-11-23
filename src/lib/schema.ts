import { NEGOCIO, SITE_URL } from '../data/negocio';

export const ORG_ID = `${SITE_URL}/#organization`;
export const WEB_ID = `${SITE_URL}/#website`;
export const PERSON_ID = `${SITE_URL}/despacho/#sonia-valdelvira`;
const abs = (p: string) => new URL(p, SITE_URL).href;

export const organization = (logo: string, image: string) => ({
  '@type': 'LegalService',
  '@id': ORG_ID,
  name: NEGOCIO.nombre,
  alternateName: 'V&V Abogados',
  url: `${SITE_URL}/`,
  logo: abs(logo),
  image: abs(image),
  telephone: NEGOCIO.tel,
  address: {
    '@type': 'PostalAddress',
    streetAddress: `${NEGOCIO.direccion.calle}, ${NEGOCIO.direccion.detalle}`,
    addressLocality: NEGOCIO.direccion.localidad,
    addressRegion: NEGOCIO.direccion.provincia,
    postalCode: NEGOCIO.direccion.cp,
    addressCountry: NEGOCIO.direccion.pais,
  },
  geo: { '@type': 'GeoCoordinates', latitude: NEGOCIO.geo.lat, longitude: NEGOCIO.geo.lng },
  hasMap: NEGOCIO.mapsUrl,
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: NEGOCIO.tel,
    contactType: 'customer service',
    areaServed: 'ES',
    availableLanguage: ['es'],
  },
  openingHoursSpecification: NEGOCIO.horario.map((h) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: h.dias,
    opens: h.abre,
    closes: h.cierra,
  })),
  areaServed: [
    { '@type': 'City', name: 'Dos Hermanas' },
    { '@type': 'City', name: 'Alcalá de Guadaíra' },
    { '@type': 'City', name: 'Utrera' },
    { '@type': 'City', name: 'Los Palacios y Villafranca' },
    { '@type': 'City', name: 'Coria del Río' },
    { '@type': 'City', name: 'Sevilla' },
  ],
  founder: { '@id': PERSON_ID },
  knowsAbout: ['Derecho de tráfico', 'Accidentes de tráfico', 'Indemnizaciones por accidente de tráfico', 'Baremo de tráfico', 'Derecho de familia', 'Herencias'],
  sameAs: [NEGOCIO.mapsUrl],
});

export const website = () => ({
  '@type': 'WebSite',
  '@id': WEB_ID,
  url: `${SITE_URL}/`,
  name: NEGOCIO.nombre,
  inLanguage: 'es-ES',
  publisher: { '@id': ORG_ID },
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/buscar/?s={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
});

export type Crumb = { name: string; path: string };
export const breadcrumbs = (items: Crumb[]) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: abs(c.path) })),
});

export const person = () => ({
  '@type': 'Person',
  '@id': PERSON_ID,
  name: NEGOCIO.abogada,
  jobTitle: 'Abogada especialista en tráfico',
  url: `${SITE_URL}/despacho/`,
  worksFor: { '@id': ORG_ID },
  knowsAbout: ['Derecho de tráfico', 'Accidentes de tráfico', 'Baremo de tráfico (Ley 35/2015)', 'Multas y pérdida de puntos', 'Delitos contra la seguridad vial', 'Derecho de familia', 'Herencias', 'Desahucios', 'Derecho civil'],
  memberOf: { '@type': 'Organization', name: NEGOCIO.colegio },
  hasCredential: {
    '@type': 'EducationalOccupationalCredential',
    credentialCategory: 'Colegiación profesional',
    name: `Abogada colegiada nº ${NEGOCIO.colegiada}`,
    recognizedBy: { '@type': 'Organization', name: NEGOCIO.colegio },
  },
});

export const service = (o: { name: string; serviceType: string; path: string; description: string; trafico: boolean }) => ({
  '@type': 'Service',
  '@id': `${abs(o.path)}#servicio`,
  name: o.name,
  serviceType: o.serviceType,
  description: o.description,
  url: abs(o.path),
  provider: { '@id': ORG_ID },
  areaServed: [{ '@type': 'City', name: 'Dos Hermanas' }, { '@type': 'City', name: 'Sevilla' }, { '@type': 'Country', name: 'España' }],
  ...(o.trafico ? { author: { '@id': PERSON_ID }, reviewedBy: { '@id': PERSON_ID } } : {}),
});

export const blogPosting = (o: { title: string; description: string; path: string; image: string; published: Date; modified: Date }) => ({
  '@type': 'BlogPosting',
  '@id': `${abs(o.path)}#articulo`,
  headline: o.title,
  description: o.description,
  url: abs(o.path),
  mainEntityOfPage: abs(o.path),
  image: abs(o.image),
  datePublished: o.published.toISOString(),
  dateModified: o.modified.toISOString(),
  inLanguage: 'es-ES',
  author: { '@id': PERSON_ID, '@type': 'Person', name: NEGOCIO.abogada, url: `${SITE_URL}/despacho/` },
  publisher: { '@id': ORG_ID },
});
