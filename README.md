# ARC Atlas — ARC Raiders Wiki

**Sitio publicado:** [Abrir ARC Atlas](https://monovs31.github.io/arc-raiders-wiki/).

Base inicial de una wiki comunitaria en español, preparada para el repositorio público nuevo **MonoVS31/arc-raiders-wiki**. No está afiliada a Embark Studios.

## Estado de esta entrega

**Fase 4 de mantenimiento:** textos de al menos 12 px, tokens de contraste corregidos, búsqueda accesible por teclado, tarjetas con enlaces, breadcrumb semántico y títulos dinámicos. 78 pruebas aprobadas. [Accesibilidad y ratios de contraste](docs/14-fase-4-accesibilidad.md).

**Fase 3 de mantenimiento:** CSS sin las 26 clases antiguas sin uso, tokens centralizados, capas explícitas, nesting nativo y reglas de portada y rutas consolidadas. Apariencia comparada en escritorio y celular; 54 pruebas aprobadas. [Arquitectura y comprobaciones del CSS](docs/13-fase-3-css.md).

**Fase 2 de mantenimiento:** código de `src/` formateado, vistas separadas y navegación centralizada en `useWikiNavigation`. ESLint revisa TypeScript, Hooks y accesibilidad en ambos workflows. El historial recupera la posición de scroll. 52 pruebas aprobadas. [Cambios y comprobaciones de la fase](docs/12-fase-2-legibilidad.md).

**Edición 2.0:** portada de enciclopedia con identidad propia, menú lateral, búsqueda global, galerías y animaciones CSS. La lectura de fichas, mapas, materiales, fabricación, reparaciones y objetivos ocurre dentro de ARC Atlas. Las fuentes originales son referencias opcionales. Incluye 123 expedientes de fabricación, seis guías de misión y 281 recursos del catálogo local; 47 pruebas aprobadas. [Diseño y navegación integrada](docs/11-wiki-integrada.md).

**Edición 1.0 lista para revisar:** zonas y condiciones interactivas para los 21 ARC, 83 rutas contrastadas con sus fichas y otro catálogo, etapas de nueve proyectos, recompensas de planos y enlaces directos entre materiales, enemigos y mapas. Cada ficha se puede compartir para señalar errores. [Alcance y revisión](docs/10-edicion-para-revision.md).

Investigación pública con corte **6 de octubre de 2026**, arquitectura documentada antes de la implementación y primera aplicación local con búsqueda, filtros y fichas con fuentes por campo. Las estadísticas comunitarias están clasificadas como probables; anuncios oficiales confirmados se separan del contenido disponible. Los desconocidos y conflictos son visibles.

Se inspeccionaron los tres repositorios públicos de MonoVS31 y no se modificó ninguno. La investigación, documentación, catálogo y base web están publicados en https://github.com/MonoVS31/arc-raiders-wiki. El contenido publicado coincide con la base revisada en la PC. El acceso de la conexión está limitado a este repositorio.

**Versión 0.2:** seis mapas interactivos con zoom, desplazamiento, pisos, filtros y lista accesible. Incluye 1.981 reportes comunitarios, entre ellos 201 reportes de cajas, y rutas documentadas para 83 planos. Siete rutas tienen corroboración específica; cuatro conservan campos desconocidos. Las posiciones de los reportes no garantizan aparición del botín. Al seleccionar un ARC se muestran sus datos de combate con fuentes.

**Versión 0.3:** comparador de armas con niveles y mejoras, panel de puntos débiles/blindaje/consejos y visualización geométrica de granadas con fuentes. Detalles en `docs/08-combat-tools.md`.

La versión 0.4 añadió referencias visuales ARC y publicación con GitHub Pages; la 1.0 añade esquemas orientativos y revisión de rutas por campo. Sigue pendiente corroborar dentro del juego los datos sin evidencia primaria. Los diagramas no representan zonas exactas de impacto. No se inventan tasas, curvas de daño ni posiciones de planos. Los objetivos de misión se distinguen de puntos de aparición del plano.

La entrega 0.4 pasó 29 pruebas, TypeScript y compilación en local y GitHub. La URL pública fue comprobada con el visor de Dam (48 reportes de cajas), carga de imagen ARC y consulta de blindaje. La guía PDF de 32 páginas se entrega por separado con el recorrido de construcción, instrucciones de uso, documentación de las fases y registro de 148 fuentes.

La edición 1.0 pasa 43 pruebas y conserva 159 fuentes. Su revisión cubre 112 páginas de objetos/ARC y nueve fichas de proyectos. Se corrigió la interpretación de una ruta de Aphelion: la ficha del arma no confirma dónde aparece el plano. Las recompensas por misión, proyectos y botín conservan evidencia y disponibilidad separadas.

## Ejecutar

Requiere Node 22.12+ (se validó con Node 24) y npm.

```sh
npm ci
npm run dev
```

La aplicación usa el catálogo versionado; no necesita cuenta, servidor de datos ni secretos. Opcionalmente copiar `.env.example` a `.env` para el nombre público del sitio. **VITE_* se publica en el navegador; nunca incluir credenciales.**

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run preview
```

`dist/` contiene el sitio estático. La base relativa permite servirlo en una subcarpeta. CI ejecuta lint, comprobación de tipos, pruebas y build. El workflow de Pages valida lint, pruebas y build antes de desplegar los cambios de main.

Para aplicar el formato del proyecto, ejecutá `npm run format`. ESLint usa configuración plana (`eslint.config.mjs`), Prettier usa `.prettierrc.json` y los tests de interfaz corren en jsdom. El modo estricto de TypeScript se conserva.

## Documentación

- [Investigación y política de evidencia](docs/01-investigacion.md)
- [Arquitectura e inventario técnico](docs/02-arquitectura.md)
- [Modelo de datos](docs/03-modelo-datos.md)
- [Fases y estrategia de commits](docs/04-fases-y-commits.md)
- [Cobertura](docs/05-cobertura.md)
- [Verificación ejecutada y límites](docs/06-verificacion.md)
- [Mapas, rutas y atribución](docs/07-mapas-y-rutas.md)

## Datos y actualización

`src/data/catalog.json` almacena entidades, afirmaciones y tareas de ubicación. `sources.json` conserva URLs, revisiones y hashes de consultas. `src/domain/schema.ts` valida procedencia, duplicados, unidades, posiciones e incertidumbre; la UI nunca consume HTML remoto. Cada edición debe conservar evidencia y pasar las pruebas. Después del 8 de octubre revisar Frozen Trail antes de cambiar disponibilidad o estadísticas.

La investigación inicial se preparó consultando fuentes públicas; los scripts y capturas de trabajo no forman parte de la aplicación. El catálogo es editable sin scraping automático: agregar la fuente, la entidad y los campos revisados; ejecutar las comprobaciones. Las rutas de obtención incompletas siguen marcadas como pendientes.

## Repositorio y trabajo local

Repositorio público: https://github.com/MonoVS31/arc-raiders-wiki.

La publicación separa investigación, arquitectura, catálogo y aplicación. No se reescribió historia de repositorios existentes.

La [verificación automática de la base](https://github.com/MonoVS31/arc-raiders-wiki/actions/runs/37518686760) aprobó instalación, TypeScript, tests y build. Este repositorio contiene la base del proyecto; la web todavía no se desplegó en una URL pública.

Para continuar, crear una rama de trabajo desde main y ejecutar las comprobaciones antes de publicar. No incluir credenciales en archivos.

## Actualizar mapas y rutas

Los marcadores se sirven desde cachés por mapa en public/data/maps; Leaflet y el visor se cargan por demanda. El navegador verifica SHA-256 de la caché contra el manifiesto antes de mostrar datos. Las imágenes se cargan desde MetaForge con atribución y enlace; no se copian sus tiles al repositorio. Esta integración usa las condiciones de su [API pública](https://metaforge.app/arc-raiders/api) para el proyecto gratuito actual. Un producto monetizado requiere contacto previo con el proveedor.

`npm run data:maps` solicita una nueva captura deliberadamente y exige revisar la configuración si cambia. `npm run data:blueprints` necesita las capturas de investigación conservadas en Arc/work/research; no es un comando de instalación para un clon nuevo. Los datos ya versionados permiten ejecutar la aplicación sin esas capturas. Revisar diferencias, fuentes y pruebas antes de publicar actualizaciones.

La captura original de catalog.json permanece como evidencia inicial. domain/catalog.ts compone los campos activos con la calibración de mapas y las rutas revisadas, para que los filtros no sigan usando pendientes sustituidos por nueva evidencia.

## Atribución y propiedad

ARC RAIDERS, nombres y material del juego pertenecen a Embark Studios. Las fuentes de la wiki señalan contenido comunitario CC BY-SA salvo excepciones; revisar la licencia de cada material antes de redistribuirlo. Este proyecto conserva enlaces y datos factuales, sin copiar artículos completos ni gráficos del juego. No se ha elegido una licencia abierta para el código. Convertir un repositorio público a privado no elimina las copias que otros hayan obtenido.
