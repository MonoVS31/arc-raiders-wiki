# ARC Atlas — ARC Raiders Wiki

Base inicial de una wiki comunitaria en español, preparada para el repositorio público nuevo **MonoVS31/arc-raiders-wiki**. No está afiliada a Embark Studios.

## Estado de esta entrega

Investigación pública con corte **6 de octubre de 2026**, arquitectura documentada antes de la implementación y primera aplicación local con búsqueda, filtros y fichas con fuentes por campo. Las estadísticas comunitarias están clasificadas como probables; anuncios oficiales confirmados se separan del contenido disponible. Los desconocidos y conflictos son visibles.

Se inspeccionaron los tres repositorios públicos de MonoVS31. Ninguno correspondía al proyecto y no se modificó ninguno. El repositorio público nuevo https://github.com/MonoVS31/arc-raiders-wiki ya está creado. La subida aún está pendiente: el perfil de la conexión confirma MonoVS31, pero la instalación de acceso a repositorios pertenece a otra cuenta accesible. Se preparó una instalación limitada a arc-raiders-wiki, pendiente de autorización del propietario. La sesión de la terminal continúa inválida. Los commits locales permanecen intactos en Arc.

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

## Crear el remoto sin tocar otros proyectos

Los commits locales ya separan documentación, datos y base web. Para subir esa historia, una vez restablecida la sesión de GitHub CLI:

```sh
gh auth login --hostname github.com --git-protocol https --web
gh repo create MonoVS31/arc-raiders-wiki --public --source . --remote origin --push
```

Si el repositorio ya existe al retomar, inspeccionarlo primero: no ejecutar creación, force-push, borrado ni sobrescribir su historia. Estos comandos son instrucciones pendientes, no evidencia de publicación. No pegar tokens en archivos o en el chat.

## Atribución y propiedad

ARC RAIDERS, nombres y material del juego pertenecen a Embark Studios. Las fuentes de la wiki señalan contenido comunitario CC BY-SA salvo excepciones; revisar la licencia de cada material antes de redistribuirlo. Este proyecto conserva enlaces y datos factuales, sin copiar artículos completos ni gráficos del juego. No se ha elegido una licencia abierta para el código. Convertir un repositorio público a privado no elimina las copias que otros hayan obtenido.
