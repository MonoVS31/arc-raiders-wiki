# Verificación de la base

Fecha: 6 de octubre de 2026. Incluye evidencia de la base local y de la ejecución de CI en GitHub. No se ha desplegado la web.

## Resultados ejecutados

- Instalación de dependencias completada; versiones exactas y package-lock.json.
- TypeScript estricto: sin errores, con noUncheckedIndexedAccess y exactOptionalPropertyTypes.
- Vitest: **13 pruebas aprobadas**, en dos archivos. Casos positivos y negativos de procedencia, referencias, duplicados, null, incertidumbre, anuncios y coordenadas, más filtros y render de todas las fichas.
- Compilación Vite: completada. Salida estática generada en dist, con base relativa.
- Navegador: página local abierta correctamente, categoría Armas mostró 24 fichas; búsqueda APHELION produjo un resultado con estimaciones no confirmadas; filtro anunciado mostró Stiletto y Bantam y la advertencia de disponibilidad futura.
- Layout observado en el ancho normal del panel: texto legible, tarjetas apiladas y controles accesibles. No se realizó una auditoría completa de accesibilidad ni de todos los tamaños de pantalla.

## Versiones instaladas

Node 24.19.0; npm 11.17.0; React/React DOM 19.3.0; TypeScript 7.0.2; Vite 8.3.3; Vitest 5.0.3; Zod 4.6.5. package.json fija estas versiones y el lockfile fija la resolución.

## Límites observados

Bundle JS inicial: aproximadamente 568 kB minificado / 125 kB gzip. Vite advierte un chunk superior a 500 kB. La siguiente fase debería dividir catálogo por categoría y cargar validación/datos por demanda; el aviso no impide compilar. No se verificaron imágenes base ni posiciones: los seis registros de ubicación son tareas sin coordenadas. Los POIs reportados son afirmaciones posibles separadas de marcadores.

## Publicación verificada

Repositorio público: https://github.com/MonoVS31/arc-raiders-wiki. El usuario autorizó ChatGPT Codex Connector para un único repositorio en MonoVS31. Se publicaron primero investigación y arquitectura, después catálogo y base web. Los 27 archivos versionados quedaron publicados; no se incluyeron dependencias instaladas, capturas de trabajo o credenciales.

El árbol publicado de la base es `7fa00bd593d05595e7a5c7afb1f74c05beac1af8`, idéntico al árbol de contenido de la copia local revisada. Commit de aplicación: `5173f6eb7bd84f51e723e0f9c49b20d1eb3d08ac`. La [ejecución 37518686760](https://github.com/MonoVS31/arc-raiders-wiki/actions/runs/37518686760) terminó con success: npm ci, comprobación de tipos, pruebas y build aprobados. Esta comprobación corresponde al código de la base; la presente actualización modifica solo documentación.

La copia local está en `C:\Users\Matia\OneDrive\Escritorio\Arc\outputs\arc-raiders-wiki`. main sigue origin/main; la historia local anterior está preservada en local-original-history. La publicación mediante la conexión genera identificadores propios de commits. La renovación de la sesión de GitHub CLI fue rechazada por la revisión automática de permisos; no se configuraron credenciales nuevas de la terminal. No se modificó ningún repositorio existente y la web aún no está desplegada.

## Secretos y publicación

El proyecto no necesita secretos. Solo se incluye .env.example con etiqueta pública; .env y variantes locales están ignorados. No se copia configuración personal ni credenciales. CI tiene permiso de lectura y no incluye deploy. El ZIP de entrega contiene documentación y fuente, excluyendo node_modules, .git y dist. Antes de publicar una revisión posterior, ejecutar nuevamente pruebas y revisar el contenido que se incorporará.
