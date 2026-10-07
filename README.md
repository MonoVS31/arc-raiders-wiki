> Rama de revisión visual: **feat/rediseno-visual**. La fase 9 sigue pendiente de aprobación y no reemplaza la edición publicada en main. Ver [diseño y cómo probarlo](docs/19-rediseno-visual.md).

# ARC Atlas - Edición 2.2

Wiki comunitaria independiente de ARC Raiders en español rioplatense. Mapas, armas, ARC, granadas, planos, proyectos, recetas, materiales y fuentes se consultan dentro del sitio. No está afiliada a Embark Studios.

**URL pública:** [Abrir ARC Atlas](https://monovs31.github.io/arc-raiders-wiki/). La edición 2.2 se publica mediante GitHub Actions: lint, tipos, datos, tests y build deben pasar antes del despliegue.

## Cambios por fase

| Fase | Resultado | Documentación |
|---|---|---|
| 1 | AGENTS.md con reglas del proyecto, contadores derivados de entidades disponibles y numeración por categorías | Reglas en la raíz del repositorio |
| 2 | Prettier, ESLint, lint en CI, componentes separados, navegación en hook, búsqueda memoizada y scroll conservado en el historial | [Legibilidad](docs/12-fase-2-legibilidad.md) |
| 3 | 26 clases sin uso retiradas, tokens semánticos, @layer, nesting y consolidación de reglas | [CSS](docs/13-fase-3-css.md) |
| 4 | Texto mínimo de 12 px, contrastes corregidos, combobox de teclado, enlaces reales, breadcrumb y títulos por vista | [Accesibilidad](docs/14-fase-4-accesibilidad.md) |
| 5 | JSON públicos con fetch y caché, reintento, validación antes de build, marcadores Canvas incrementales e imágenes/animaciones optimizadas | [Rendimiento](docs/15-fase-5-rendimiento.md) |
| 6 | View Transitions, entradas por scroll, transiciones discretas, radar y bordes CSS, Motion cargado solo para galería y modales | [Animaciones](docs/12-animaciones.md) |
| 7 | Favicon SVG propio, tarjeta social original, Open Graph/Twitter/canonical, plan de prerender y riesgos de assets remotos | [SEO](docs/16-seo-y-prerender.md), [publicación y riesgos](docs/09-publicacion-y-mantenimiento.md) |
| 8 | 167 fichas estáticas con metadatos y tarjetas propias, sitemap, enlaces de compartir y 381 imágenes servidas localmente | [Fichas estáticas](docs/18-fichas-estaticas.md) |

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

La edición 2.2 pasó **103 tests**, lint, TypeScript, validación de datos y build.

`npm run build` ejecuta TypeScript, la validación de datos, la recuperación/verificación del snapshot de imágenes, Vite y el prerender. `npm run dev` recupera las imágenes antes de iniciar. Un presupuesto impide que el chunk de entrada alcance 200.000 bytes. `npm run format` aplica el formato compartido. TypeScript sigue estricto; la rama 6.0 permite usar typescript-eslint sin forzar dependencias incompatibles.

La aplicación no necesita secretos. `.env.example` permite ajustar el rótulo público; VITE_* se incluye en el navegador. El nombre público no cambia automáticamente las URLs SEO absolutas: si se cambia el dominio, revisar index.html y las propuestas de canonicals.

## Bundle y carga

Referencia original solicitada: **725 KB / 132 KB gzip**. El arranque actual está alrededor de **4,34 KB / 2,07 KB gzip**, medido con npm run build. El archivo principal cumple el objetivo de menos de 200 KB.

Esta cifra no representa toda la aplicación: React, la wiki y Zod se cargan después de los datos. Los mapas, recetas y Motion tienen chunks por demanda. Los JSON propios se transfieren aparte, incluido el manifiesto de imágenes. Las 381 imágenes locales (54,7 MB) no forman parte del JavaScript y se solicitan según la vista. [Mediciones detalladas](docs/15-bundle-mediciones.json) y [dependencias de animaciones](docs/12-animaciones-mediciones.json).

## Datos y cobertura

La investigación tiene corte al 6 de octubre de 2026. El catálogo y sus fuentes se sirven desde `public/data/atlas/`; los marcadores desde `public/data/maps/` y los expedientes desde `public/data/dossiers/`. El catálogo efectivo conserva la composición revisada y se valida en tests/build. Los archivos trasladados conservaron sus bytes.

El inventario documenta 83 planos, 123 expedientes de fabricación, seis guías de misión, 281 recursos y 166 fuentes. Las ubicaciones comunitarias son reportes posibles y no garantizan aparición. Los diagramas ARC son orientativos; no se inventan porcentajes, curvas de daño ni geometrías precisas. Después del 8 de octubre, revisar el parche oficial antes de cambiar Frozen Trail.

Los comandos data:maps, data:blueprints, data:audit y data:arc-links actualizan capturas deliberadamente. Algunas rutas requieren las capturas de investigación conservadas en Arc/work/research; no son pasos de instalación de un clon nuevo. Revisar cambios y fuentes antes de integrar.

## SEO y preview al compartir

index.html contiene favicon, canonical, og:title, og:description, og:image y Twitter Card. La imagen social de 1200 x 630 y el favicon son originales del símbolo de tres barras; no usan gráficos copiados del juego.

Cada URL `/fichas/<id>/` recibe HTML y metadatos propios durante el build. Las tarjetas PNG se generan con el nombre, categoría, estado y símbolo original. Enlace permanente y Copiar enlace usan estas rutas, conservando el foco de mapa cuando corresponde. El HTML conserva datos y fuentes sin JavaScript; el cliente carga la ficha interactiva habitual. Los enlaces por query anteriores siguen funcionando con preview general. No se migró de framework. [Ventajas, costos y decisiones](docs/16-seo-y-prerender.md).

## Publicación y mantenimiento

Repositorio: [MonoVS31/arc-raiders-wiki](https://github.com/MonoVS31/arc-raiders-wiki). Cada fase se guarda en un commit separado. GitHub Actions ejecuta lint, pruebas, tipos, validación y build; Pages publica dist cuando se integra main. No se reescribió la historia ni se modificaron otros repositorios.

La edición 2.2 se verifica antes de publicar: rutas profundas, metadatos, PNG, HTML factual, carga/reintento y mapas. Los ZIP y bundles de Git se guardan fuera del árbol del repo, dentro de Arc.

## Riesgos y decisiones pendientes

- Las 381 imágenes de fichas, ARC y materiales se guardan en Arc y se sirven desde Pages. Su caché está excluido de Git; CI recupera el snapshot desde los proveedores y verifica hashes antes de publicar. Si una imagen cambia o falla, se bloquea el nuevo build y el despliegue anterior permanece.
- El usuario solicitó la descarga sin disponer de permisos. Las licencias siguen no confirmadas; descargar o atribuir no concede derechos de redistribución. Ante un reclamo, retirar o sustituir los archivos afectados.
- Los tiles del mapa siguen dependiendo de MetaForge. No se descargó un atlas completo de tiles ni se contrató un proxy.
- Corroborar datos pendientes dentro del juego y revisar Frozen Trail después de su lanzamiento.
- GSAP/ScrollTrigger y un ARC 3D quedan como propuestas futuras para escritorio, no como dependencias instaladas.

## Documentación e historial

[Investigación](docs/01-investigacion.md), [arquitectura](docs/02-arquitectura.md), [modelo de datos](docs/03-modelo-datos.md), [fases iniciales](docs/04-fases-y-commits.md), [cobertura](docs/05-cobertura.md), [mapas](docs/07-mapas-y-rutas.md), [combate](docs/08-combat-tools.md) y [diseño de edición 2.0](docs/11-wiki-integrada.md). La guía PDF reúne las fases y las fuentes, y se entrega en Arc/outputs fuera del repo. La guía 2.0 se conserva como respaldo histórico.

| Fase | Commit |
|---|---|
| 1 | 0bc4ec3 |
| 2 | 7af79c5 |
| 3 | 6e2d198 |
| 4 | 4bd2dd4 |
| 5 | 24270be |
| 6 | a2820d4 |
| 7 | 1fe64f3 |
| 8 | Ver git log: Fase 8 |

## Atribución y propiedad

ARC Raiders y los assets del juego pertenecen a Embark Studios y sus titulares correspondientes. Las referencias comunitarias conservan procedencia y atribución. Una URL pública no autoriza redistribución; los permisos de imágenes y tiles deben revisarse por separado. No se eligió una licencia abierta para el código. Hacer privado un repo no elimina copias ya obtenidas ni garantiza mantener el mismo alojamiento de Pages.
