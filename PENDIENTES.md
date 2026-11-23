# Pendientes antes de publicar

Los marcadores se ven resaltados en amarillo en la web y `npm run build` los cuenta (hoy: 43 `[PENDIENTE]` y 357 `[VERIFICAR]` en páginas indexables; 25 de los `[PENDIENTE]` son la firma de revisión de la abogada en el bloque de autoría de cada servicio y artículo, en `src/components/Author.astro`). **No publicar en producción con marcadores visibles.**

## 1. Datos que debe dar la abogada

1. **Colegio** de la colegiación nº 11326 (se ha puesto «Ilustre Colegio de Abogados de Sevilla» provisionalmente; cambiar en `src/data/negocio.ts`).
2. **Biografía**, años de ejercicio, formación específica en tráfico / responsabilidad civil / valoración del daño corporal y tipos de casos llevados (portada, `/despacho/`, `/abogados-accidentes-trafico/`). Casos anonimizados solo con autorización.
3. **Foto profesional** de la abogada (y, si se quiere, de la fachada). Hoy no existe ninguna; se usan fotos del interior del despacho.
4. **Honorarios**: ¿cobro a éxito en accidentes? La web no dice que la primera consulta sea gratuita (se retiró a petición del cliente, 23/11/2026). Honorarios de multas, divorcio y familia.
5. **Defensa penal en tráfico** (alcoholemia, juicios rápidos, guardias). Se han creado `/abogado-alcoholemia-delitos-trafico/` y el artículo del juicio rápido: si no la lleva, eliminar ambos archivos y quitar los enlaces del menú (`src/data/negocio.ts`).
6. **Desahucios**: ¿defiende también a inquilinos?
7. **Cláusula suelo**: ¿se siguen llevando? (`/reclame-clausula-suelo/` redirige a `/derecho-civil/`).
8. **Peritos médicos** con los que trabaja (para la página de latigazo).
9. **Cómo llegar y aparcamiento** (`/solicitar-cita/`).
10. **Equipo**, si hay más personas.
11. **Reseñas**: hay 4 opiniones de 5,0 en Google; se muestra solo la nota con enlace a la ficha. Publicar textos solo con permiso de sus autores.
12. **Zona**: confirmar municipios (Dos Hermanas, Montequinto, Alcalá de Guadaíra, Utrera, Los Palacios y Villafranca, Coria del Río, Sevilla). No se ha creado `/abogados-sevilla/` por falta de contenido propio.
13. **Seguro de responsabilidad civil profesional** (opcional, para `/despacho/`).

## 2. Revisión jurídica `[VERIFICAR]`

Todas las cifras legales (plazos, tasas, puntos, multas, artículos, reformas de 2025) llevan `[VERIFICAR]`. Para revisarlas: `grep -rn "VERIFICAR" src/content src/pages`. Por archivo: recuperar-puntos 24, multas 22, herencias 21, tráfico 18, aceptar-herencia 18, plazo-reclamar 17, patinete-seguro 17, alcoholemia 16, juicio-rapido 15, fallecimiento 15, desahucios 15, coste-divorcio 15, consorcio 14, civil 14, bicicleta-patinete 13, aseguradora 12, oferta-motivada 12, familia 12, latigazo 11, latigazo-baremo 11, in-itinere 11, atropello 10, moto 10, qué-hacer 7, parte-amistoso 6. Puntos sensibles: la reforma de 2025 de la Ley 35/2015 (72 h de asistencia médica), el seguro obligatorio de patinetes (Ley 5/2025), las tasas de alcoholemia, la bonificación andaluza de Sucesiones y los plazos de prescripción.

Al revisar, borre el marcador del texto (o corríjalo) y cambie `updated:` en el frontmatter.

## 3. Decisiones tomadas sin el cliente (revisables)

- Horario y coordenadas: de la ficha de Google (consultada el 22/11/2026). Horario: L, M, X y V 10:00–14:30; J 10:30–14:30.
- Sin banner de cookies: la web no instala ninguna. El mapa de Google solo se carga si el visitante pulsa «Cargar mapa» (consentimiento en el momento).
- Remitente de los correos del formulario: no-responder@valdelvira-abogados.com (crear el buzón o alias si el hosting lo exige; revisar SPF/DKIM).
- H1 de las subpáginas de tráfico y de multas con «en Dos Hermanas», según la estrategia geográfica del brief (la tabla del brief los daba sin localidad).
- Descripciones del brief para `/abogados-accidentes-trafico/` y `/abogados-familia/` acortadas a ≤160 caracteres.
- Nueva URL de privacidad: `/politica-de-privacidad/` (la antigua `/privacidad/` redirige con 301). Se añaden aviso legal (no existía), cookies y accesibilidad.
- La exportación de Search Console y las capturas que menciona `instrucciones.md` **no estaban en la carpeta**; los metatítulos y descripciones siguen el brief. Si se aportan, se pueden ajustar.

## 4. Técnico y Search Console (tras publicar)

- [ ] Primera publicación: `sh scripts/deploy.sh production --primera-vez` (o subir el ZIP de `npm run paquete`) tras copiar la base de datos de WordPress.
- [ ] Probar el formulario real y que llegan los dos correos (a sonia@ y la confirmación). Si `mail()` falla, crear `api/.data/smtp.php`.
- [ ] `curl -sI https://valdelvira-abogados.com/derecho-familia/ | grep -iE "^(HTTP|location)"` y el resto de 301 de `scripts/htaccess.tpl`: un solo salto a un destino 200. http y www → https sin www.
- [ ] Search Console: enviar `sitemap-index.xml` y **eliminar** el antiguo `sitemap_index.xml`. Inspección de URL de la portada (diseño completo, sin recursos bloqueados).
- [ ] Validar el JSON-LD en la Prueba de resultados enriquecidos y en validator.schema.org.
- [ ] PageSpeed Insights móvil de portada y `/abogados-accidentes-trafico/` (Lighthouse no se pudo ejecutar en local durante la construcción).
- [ ] Mantener los archivos de verificación `googlefa2d078407f13711.html` y `BingSiteAuth.xml` (ya incluidos).

## 5. Ficha de Google Business Profile (fuera de la web)

- Nombre: la ficha se llama «V & V Abogados» y su categoría principal es «Abogado de Derecho de familia». El brief pide nombre «Valdelvira Abogados» y categoría principal cercana a tráfico (p. ej. «Abogado de lesiones personales»), con secundarias «Bufete de abogados» y «Abogado de familia».
- Descripción que empiece por la especialización en tráfico, mismo horario y teléfono que la web, enlace con UTM, fotos reales, servicios dados de alta y publicaciones periódicas de tráfico.
- Mismos datos (NAP) en Colegio de Abogados, Páginas Amarillas, Infobel, Apple Maps y Bing Places.
