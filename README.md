# ARC Atlas — ARC Raiders Wiki

Base inicial de una wiki comunitaria en español, preparada para el repositorio público nuevo **MonoVS31/arc-raiders-wiki**. No está afiliada a Embark Studios.

## Estado de esta entrega

Investigación pública con corte **6 de octubre de 2026**, arquitectura documentada antes de la implementación y primera aplicación local con búsqueda, filtros y fichas con fuentes por campo. Las estadísticas comunitarias están clasificadas como probables; anuncios oficiales confirmados se separan del contenido disponible. Los desconocidos y conflictos son visibles.

Se inspeccionaron los tres repositorios públicos de MonoVS31 y no se modificó ninguno. La investigación, documentación, catálogo y base web están publicados en https://github.com/MonoVS31/arc-raiders-wiki. El contenido publicado coincide con la base revisada en la PC. La copia de trabajo permanece en C:\Users\Matia\OneDrive\Escritorio\Arc\outputs\arc-raiders-wiki. La rama main sigue la publicación; la historia previa de trabajo se conserva en local-original-history. El acceso de la conexión está limitado a este repositorio.

**No es todavía la wiki completa:** mapas interactivos con assets autorizados, coordenadas de cajas, revisión completa de obtención de planos, diagramas ARC, comparadores y simulaciones pertenecen a las siguientes fases. No hay marcadores inventados, tasas supuestas ni curvas de daño calculadas sin evidencia. No se reutilizan imágenes o datasets de terceros sin revisar permisos.

## Ejecutar

Requiere Node 22.12+ (se validó con Node 24) y npm.

```sh
npm ci
npm run dev
```

La aplicación usa el catálogo versionado; no necesita cuenta, servidor de datos ni secretos. Opcionalmente copiar `.env.example` a `.env` para el nombre público del sitio. **VITE_* se publica en el navegador; nunca incluir credenciales.**

```sh
npm run typecheck
npm test
npm run build
npm run preview
```

`dist/` contiene el sitio estático. La base relativa permite servirlo en una subcarpeta. CI ejecuta comprobación de tipos, pruebas y build; no despliega automáticamente.

## Documentación

- [Investigación y política de evidencia](docs/01-investigacion.md)
- [Arquitectura e inventario técnico](docs/02-arquitectura.md)
- [Modelo de datos](docs/03-modelo-datos.md)
- [Fases y estrategia de commits](docs/04-fases-y-commits.md)
- [Cobertura](docs/05-cobertura.md)
- [Verificación ejecutada y límites](docs/06-verificacion.md)

## Datos y actualización

`src/data/catalog.json` almacena entidades, afirmaciones y tareas de ubicación. `sources.json` conserva URLs, revisiones y hashes de consultas. `src/domain/schema.ts` valida procedencia, duplicados, unidades, posiciones e incertidumbre; la UI nunca consume HTML remoto. Cada edición debe conservar evidencia y pasar las pruebas. Después del 8 de octubre revisar Frozen Trail antes de cambiar disponibilidad o estadísticas.

La investigación inicial se preparó consultando fuentes públicas; los scripts y capturas de trabajo no forman parte de la aplicación. El catálogo es editable sin scraping automático: agregar la fuente, la entidad y los campos revisados; ejecutar las comprobaciones. Las rutas de obtención incompletas siguen marcadas como pendientes.

## Repositorio y trabajo local

Repositorio público: https://github.com/MonoVS31/arc-raiders-wiki.

La publicación separa investigación, arquitectura, catálogo y aplicación. Los archivos fueron enviados mediante la conexión de GitHub y se verificó que su árbol de contenido coincide con el commit local. La historia local anterior permanece en la rama local-original-history. No se reescribió historia de repositorios existentes.

La [verificación automática de la base](https://github.com/MonoVS31/arc-raiders-wiki/actions/runs/37518686760) aprobó instalación, TypeScript, tests y build. Este repositorio contiene la base del proyecto; la web todavía no se desplegó en una URL pública.

Para continuar, crear una rama de trabajo desde main. La sesión de GitHub CLI es independiente de la conexión de la aplicación; no se renovó durante esta entrega. No pegar credenciales en archivos o en el chat.

## Atribución y propiedad

ARC RAIDERS, nombres y material del juego pertenecen a Embark Studios. Las fuentes de la wiki señalan contenido comunitario CC BY-SA salvo excepciones; revisar la licencia de cada material antes de redistribuirlo. Este proyecto conserva enlaces y datos factuales, sin copiar artículos completos ni gráficos del juego. No se ha elegido una licencia abierta para el código. Convertir un repositorio público a privado no elimina las copias que otros hayan obtenido.
