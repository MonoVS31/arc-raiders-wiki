# Plan por fases y estrategia de commits

## Fase 0 — investigación y decisiones

Inventario remoto, elección de repo independiente, investigación con URL/revisión, conflictos, cobertura, diseño y modelo. Documentar antes de escribir la aplicación. Commit: `docs: document research, evidence policy and architecture`.

## Fase 1 — base del proyecto (esta entrega)

React/Vite/TypeScript estricto, README, .gitignore, .env.example, fuentes y catálogo validado; búsqueda por nombre, categorías, disponibilidad y fichas con confianza por campo. Tests de casos inválidos y CI. Sin posiciones falsas, API privada, secretos ni despliegue automático. Commit de datos: `data: add sourced initial ARC Raiders catalog`. Commit de base: `feat: scaffold strict typed research browser`. Commit de verificación: `test: validate provenance and document baseline checks`.

Criterio de salida: instalación reproducible con lockfile, tipos y tests pasando, build producido, alcance y limitaciones visibles. Crear repo público nuevo y subir commits solo con conexión válida. No reportar subida o URL del repositorio como logradas si no se verificaron.

## Fase 2 — completar y validar datos

Contrastar rutas de los 83 planos, niveles de armas, fechas de proyectos y cambios oficiales. Cajas: revisión por mapa con evidencia de piso/condición y comparación de capturas. Resolver permisos de assets y calibración de mapas. Cada PR contiene cambios de datos más pruebas de integridad; no cuenta un relato sin coordenadas como marcador verificado.

## Fase 3 — visor de mapas

Zoom y desplazamiento, pisos, condiciones, cajas/planos/ARC, filtros y lista accesible alternativa. Publicar marcadores solo con asset y coordenadas calibradas. Evidencia y fecha en cada interacción. Pruebas de transformación de coordenadas, filtro por piso, teclado y movimiento reducido.

## Fase 4 — combate y comparadores

Diagramas de puntos débiles/resistentes con evidencia individual; selector de tier por arma. Granadas con diferencia explícita entre radio de daño, búsqueda, humo, gas y aturdimiento. No simular daño exacto sin curva corroborada. Pruebas de unidades y ámbitos ARC/Raider.

## Fase 5 — publicación y documentación final

Revisión visual en móvil/escritorio, accesibilidad, rendimiento, atribución, seguridad, rutas estáticas SEO y publicación revisable. Manual detallado y PDF final del procedimiento al completar la web. Revisión de cambios de Frozen Trail antes de publicar información como vigente en ese parche.

## Git y colaboración

Commits pequeños, legibles y agrupados por propósito. Esta carpeta tiene historia nueva: no se reescribe ninguna historia existente. Rama main local inicial; luego ramas feat/maps, feat/weapons, data/patch-version con PRs. Sin force-push. README y documentación explican qué quedó probado y qué sigue pendiente. No agregar identidad Git inventada si falta una configuración válida. No agregar tokens a comandos, archivos, ejemplos o commits. La conexión remota se realiza sin pegar secretos en el chat.
