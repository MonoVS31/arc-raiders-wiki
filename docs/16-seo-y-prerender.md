# Actualización de la edición 2.2

El prerender fue autorizado después de la entrega 2.1 y ya está implementado mediante un generador de HTML adicional con Vite. Se generan 167 rutas /fichas/<id>/, con campos efectivos, fuentes y notas legibles sin JavaScript, canonical y metadatos exclusivos, tarjetas PNG originales y sitemap. No se migró a Astro. Ver [implementación y riesgos de la fase 8](18-fichas-estaticas.md). Los enlaces por query anteriores siguen funcionando; para una preview por ficha se usa el nuevo enlace permanente o Copiar enlace. Discord puede mantener previews en caché.

Los apartados siguientes conservan la evaluación y propuesta de la entrega 2.1 como registro histórico.

# SEO y previews compartidas: edición 2.1

## Implementado

index.html tiene favicon SVG, canonical, Open Graph y Twitter Card. og:image y twitter:image apuntan a social-card.png, una tarjeta original de 1200 x 630 hecha con las tres barras del atlas y texto. Los metadatos usan URLs HTTPS absolutas del sitio publicado; el favicon usa BASE_URL para conservar la subcarpeta y base relativa de Vite. La versión se identifica como 2.1.

La tarjeta es general de la wiki. Los cambios en document.title de la SPA ayudan al usuario, pero no generan un HTML diferente por ficha en el servidor. GitHub Pages sirve el mismo index.html para sus parámetros de búsqueda; por eso ?entity=weapon-kettle no puede obtener un head exclusivo mediante un build de un solo archivo. No se garantiza una preview particular en Discord con la arquitectura actual. La nueva tarjeta estará disponible en el dominio público después de desplegar esta edición.

Referencia del formato: [Open Graph](https://ogp.me/).

## Propuesta de prerender estático por ficha, sin implementar

Recomendación: probar Astro con @astrojs/react para producir /fichas/<id>/index.html desde el catálogo validado. Cada ruta tendrá title, description, og:title, og:description, og:image, canonical y contenido factual propios en el HTML inicial. Las descripciones respetarán disponibilidad, evidencia y notas; una entidad anunciada no se describirá como disponible.

Mantener todos los enlaces actuales con ?category, ?entity, ?blueprint y ?arc. La SPA seguirá entendiéndolos; las nuevas URLs serán adicionales. Los enlaces de compartir usarían las nuevas rutas al aprobar la migración. Un redirect hecho solamente en JavaScript no convierte la URL vieja en un HTML distinto para los bots: sus previews pueden seguir siendo generales. Definir canonical por ficha y conservar los parámetros de contexto de mapa sin crear copias indexables de cada combinación de filtros.

En build, separar la composición pura del catálogo de la lectura de caché del navegador. Renderizar fichas, fuentes, notas y recetas sin window; los mapas, comparadores, búsqueda y animaciones se hidratan como islas React solo cuando se necesitan. Reservar imagen/espacio y usar fallback HTML para que la ficha siga siendo legible sin ejecutar JavaScript. Generar una lista de rutas y sitemap como parte de esa fase posterior, no de esta entrega.

Astro admite rutas estáticas generadas y puede integrar componentes React. [Rutas de Astro](https://docs.astro.build/en/guides/routing/) y [migración de una aplicación React](https://docs.astro.build/en/guides/migrate-to-astro/from-create-react-app/).

## Comparación y costo de migración

| Estrategia | Ventajas | Desventajas | Estimación de trabajo |
|---|---|---|---|
| Astro + islas React (recomendada) | HTML y metadatos propios por ficha, buena separación de contenido/interacción, posibilidad de menos JS por artículo | Reorganiza routing, build, carga de datos y accesos a window; hay que verificar hidratación, base de Pages y transiciones | Piloto de 3 fichas: 1-2 días; migración y revisión completa: 4-7 días |
| Vite + SSG compatible con React | Reutiliza más componentes y conserva Vite; genera HTML por ruta | La SPA actual no usa el router esperado por algunas herramientas; necesita rutas nuevas y código seguro para render de servidor. Revisar compatibilidad con Vite 8 y React 19 | Piloto: 1-2 días; integración y revisión: 3-6 días |
| Generador de HTML estático adicional, manteniendo la SPA | Menor cambio inicial y permite empezar por metadatos de unas pocas fichas | Riesgo de duplicar plantillas y desincronizar artículos; hay que mantener dos representaciones y enlaces canónicos | Piloto: 0,5-1 día; versión robusta: 2-4 días |

Son estimaciones de implementación y revisión, no presupuestos ni compromisos. El alcance incluye URLs antiguas, imágenes propias/autorizadas, metadatos, hidratación y pruebas. El costo de alojamiento puede seguir siendo el de Pages para una salida totalmente estática; no incluye dominio, proxy ni servicios de terceros.

No elegir un plugin únicamente por su nombre: vite-ssg está orientado a Vue. [vite-react-ssg](https://github.com/Daydreamer-riri/vite-react-ssg) es una alternativa de React, pero su documentación recomienda las capacidades SSG oficiales de React Router 7 para proyectos que usen ese router. ARC Atlas hoy tiene navegación propia; antes de adoptar cualquiera hay que hacer el piloto y validar su compatibilidad. No se agregó Astro, router ni plugin SSG en esta fase.

## Preview propia por ficha

Empezar con Kettle, Hornet y un plano. Generar metadatos factuales y una tarjeta propia con símbolo, nombre, categoría y estado, sin imágenes del juego mientras no estén autorizadas. Verificar el HTML servido directamente y que og:image sea un PNG público accesible. Después del despliegue, revisar la preview real; Discord puede conservar previews en caché y no se promete una actualización instantánea. No se envió ningún mensaje a Discord como prueba.

## Decisiones pendientes

1. Aprobar el piloto y elegir Astro o una estrategia SSG con Vite.
2. Mantener el dominio de Pages actual o elegir un dominio propio antes de cambiar canonicals.
3. Confirmar licencias antes de usar imágenes externas en tarjetas o alojamiento propio.
4. Publicar la edición 2.1 y comprobar HTTP 200 para favicon, PNG social y HTML con metadatos.
