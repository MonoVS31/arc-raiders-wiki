# ARC Atlas - Edición 2.1

Wiki comunitaria independiente de ARC Raiders en español rioplatense. Mapas, armas, ARC, granadas, planos, proyectos, recetas, materiales y fuentes se consultan dentro del sitio. No está afiliada a Embark Studios.

**URL pública:** [Abrir ARC Atlas](https://monovs31.github.io/arc-raiders-wiki/). La edición 2.1 se publica mediante GitHub Actions: lint, tipos, datos, tests y build deben pasar antes del despliegue.

## Cambios de las siete fases

| Fase | Resultado | Documentación |
|---|---|---|
| 1 | AGENTS.md con reglas del proyecto, contadores derivados de entidades disponibles y numeración por categorías | Reglas en la raíz del repositorio |
| 2 | Prettier, ESLint, lint en CI, componentes separados, navegación en hook, búsqueda memoizada y scroll conservado en el historial | [Legibilidad](docs/12-fase-2-legibilidad.md) |
| 3 | 26 clases sin uso retiradas, tokens semánticos, @layer, nesting y consolidación de reglas | [CSS](docs/13-fase-3-css.md) |
| 4 | Texto mínimo de 12 px, contrastes corregidos, combobox de teclado, enlaces reales, breadcrumb y títulos por vista | [Accesibilidad](docs/14-fase-4-accesibilidad.md) |
| 5 | JSON públicos con fetch y caché, reintento, validación antes de build, marcadores Canvas incrementales e imágenes/animaciones optimizadas | [Rendimiento](docs/15-fase-5-rendimiento.md) |
| 6 | View Transitions, entradas por scroll, transiciones discretas, radar y bordes CSS, Motion cargado solo para galería y modales | [Animaciones](docs/12-animaciones.md) |
| 7 | Favicon SVG propio, tarjeta social original, Open Graph/Twitter/canonical, plan de prerender y riesgos de assets remotos | [SEO](docs/16-seo-y-prerender.md), [publicación y riesgos](docs/09-publicacion-y-mantenimiento.md) |

Datos, fuentes, notas, disponibilidad y niveles de evidencia conservados. Los contenidos anunciados siguen separados de los disponibles. Se conserva la base relativa de Vite y las URLs con ?category, ?entity, ?blueprint y ?arc.

## Ejecutar y comprobar

Requiere Node 22.12+; CI usa Node 24.

```sh
npm ci
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
npm run preview
```

La edición 2.1 pasó **96 tests**, lint, TypeScript, validación de datos y build.

`npm run build` ejecuta TypeScript, la validación de datos y el build de Vite. Un presupuesto impide que el chunk de entrada alcance 200.000 bytes. `npm run format` aplica el formato compartido. TypeScript sigue estricto; la rama 6.0 permite usar typescript-eslint sin forzar dependencias incompatibles.

La aplicación no necesita secretos. `.env.example` permite ajustar el rótulo público; VITE_* se incluye en el navegador. El nombre público no cambia automáticamente las URLs SEO absolutas: si se cambia el dominio, revisar index.html y las propuestas de canonicals.

## Bundle y carga

Referencia original solicitada: **725 KB / 132 KB gzip**. El arranque actual está alrededor de **4,06 KB / 1,94 KB gzip**, medido con npm run build. El archivo principal cumple el objetivo de menos de 200 KB.

Esta cifra no representa toda la aplicación: React, la wiki y Zod se cargan después de los datos. Los mapas, recetas y Motion tienen chunks por demanda. Los 15 JSON propios suman 670.605 bytes sin comprimir y se transfieren aparte; las imágenes externas tampoco forman parte del bundle. [Mediciones detalladas](docs/15-bundle-mediciones.json) y [dependencias de animaciones](docs/12-animaciones-mediciones.json).

## Datos y cobertura

La investigación tiene corte al 6 de octubre de 2026. El catálogo y sus fuentes se sirven desde `public/data/atlas/`; los marcadores desde `public/data/maps/` y los expedientes desde `public/data/dossiers/`. El catálogo efectivo conserva la composición revisada y se valida en tests/build. Los archivos trasladados conservaron sus bytes.

El inventario documenta 83 planos, 123 expedientes de fabricación, seis guías de misión, 281 recursos y 166 fuentes. Las ubicaciones comunitarias son reportes posibles y no garantizan aparición. Los diagramas ARC son orientativos; no se inventan porcentajes, curvas de daño ni geometrías precisas. Después del 8 de octubre, revisar el parche oficial antes de cambiar Frozen Trail.

Los comandos data:maps, data:blueprints, data:audit y data:arc-links actualizan capturas deliberadamente. Algunas rutas requieren las capturas de investigación conservadas en Arc/work/research; no son pasos de instalación de un clon nuevo. Revisar cambios y fuentes antes de integrar.

## SEO y preview al compartir

index.html contiene favicon, canonical, og:title, og:description, og:image y Twitter Card. La imagen social de 1200 x 630 y el favicon son originales del símbolo de tres barras; no usan gráficos copiados del juego.

La preview actual es general. Las URLs por query sirven el mismo HTML y no producen previews diferentes por ficha para bots sin JavaScript. Se propone un piloto estático con Astro/islas React o SSG compatible con React, conservando los enlaces existentes. **No se implementó prerender ni migración de framework.** [Ventajas, costos y decisiones](docs/16-seo-y-prerender.md).

## Publicación y mantenimiento

Repositorio: [MonoVS31/arc-raiders-wiki](https://github.com/MonoVS31/arc-raiders-wiki). Las siete fases se guardan en commits separados. GitHub Actions ejecuta lint, pruebas, tipos, validación y build; Pages publica dist cuando se integra main. No se reescribió la historia ni se modificaron otros repositorios.

La edición 2.1 debe publicarse y comprobarse en la URL pública; después verificar favicon, tarjeta PNG, HTML con metadatos, rutas, carga/reintento y funcionamiento de mapas. Los ZIP y bundles de Git se guardan fuera del árbol del repo, dentro de Arc.

## Riesgos y decisiones pendientes

- Las 142 referencias visuales (117 URLs únicas) y los tiles dependen de MetaForge/Supabase. Pueden cambiar, fallar o limitar solicitudes. Los datos textuales siguen siendo propios y accesibles. [Riesgos y alternativas](docs/09-publicacion-y-mantenimiento.md).
- Confirmar las licencias de cada archivo antes de copiar imágenes externas. No se descargaron ni copiaron imágenes del juego o tiles en estas fases. Elegir entre imágenes autorizadas en el repo, proxy/caché o continuar con referencias remotas.
- Elegir y aprobar el piloto de prerender por ficha. No se agregó Astro ni un plugin SSG.
- Publicar la edición 2.1. La URL pública anterior no demuestra que esta edición esté desplegada.
- Corroborar datos pendientes dentro del juego y revisar Frozen Trail después de su lanzamiento.
- GSAP/ScrollTrigger y un ARC 3D quedan como propuestas futuras para escritorio, no como dependencias instaladas.

## Documentación e historial

[Investigación](docs/01-investigacion.md), [arquitectura](docs/02-arquitectura.md), [modelo de datos](docs/03-modelo-datos.md), [fases iniciales](docs/04-fases-y-commits.md), [cobertura](docs/05-cobertura.md), [mapas](docs/07-mapas-y-rutas.md), [combate](docs/08-combat-tools.md) y [diseño de edición 2.0](docs/11-wiki-integrada.md). La guía PDF de la edición 2.1 reúne las siete fases y las fuentes, y se entrega en Arc/outputs fuera del repo. La guía 2.0 se conserva como respaldo histórico.

| Fase | Commit |
|---|---|
| 1 | 8535b95 |
| 2 | bbf5911 |
| 3 | fbb6ac9 |
| 4 | 54ccff6 |
| 5 | dbe1f54 |
| 6 | b306a15 |
| 7 | Commit final de esta entrega; ver git log -1 |

## Atribución y propiedad

ARC Raiders y los assets del juego pertenecen a Embark Studios y sus titulares correspondientes. Las referencias comunitarias conservan procedencia y atribución. Una URL pública no autoriza redistribución; los permisos de imágenes y tiles deben revisarse por separado. No se eligió una licencia abierta para el código. Hacer privado un repo no elimina copias ya obtenidas ni garantiza mantener el mismo alojamiento de Pages.
