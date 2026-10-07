# Edición 1.0 para revisión

La aplicación está lista para que el usuario evalúe contenido, diseño e interacciones en [ARC Atlas](https://monovs31.github.io/arc-raiders-wiki/). La entrega funcional conserva los datos sin confirmar: no declara verificadas todas las apariciones de botín ni agotada la información pública del juego.

## Revisión de rutas

Se contrastaron las revisiones de las 83 fichas de objetos vinculados a planos, el índice, los 21 ARC y siete armas adicionales: 112 páginas. La redirección Surveyor a ARC Surveyor se resolvió antes de comparar revisiones. Se cotejó además un catálogo secundario de 83 planos de MetaForge: coincide en los nombres, pero sus campos de ubicaciones y obtención están vacíos. No se empleó esa coincidencia para confirmar rutas.

La ficha de Aphelion contiene una frase sobre encontrar el arma en Stella Montis. Su cercanía textual a “Requires a learned Blueprint” no demuestra que describa el plano. Se corrigió el extractor y esa ruta volvió a posible. Seis fichas mencionan explícitamente recompensas de planos por misión; Angled Grip II enumera contenedores específicos. La evidencia de cada campo y los nueve registros con campos desconocidos, incluidos Trials, se muestran al abrir la revisión.

`npm run data:audit` genera el informe desde capturas locales. Las entradas necesarias son `Blueprints.json`, las fichas enlazadas, `phase5-revision-check.json` y `phase5-blueprints-provider.json`. El script admite un directorio de investigación como argumento. Una revisión modificada exige renovar la captura antes de generar. Las capturas originales se conservan fuera del repositorio.

## Combate y diagramas

Los 21 ARC tienen 50 zonas o condiciones documentadas. Los esquemas de cuatro propulsores y carcasa/núcleo permiten elegir piezas con ratón o teclado. Las otras máquinas utilizan una lista interactiva de componentes, evitando inventar una anatomía. Cada zona conserva condición de exposición, fuente y confianza. Cuando no hay punto específico en la ficha, se indica sin confirmar.

Las fichas también incluyen vida, ataque y habilidades ARC, además de seis campos adicionales de armas. Las cifras de vida aproximadas y los campos ausentes permanecen sin confirmar. El comparador selecciona cargador y durabilidad de la serie I–IV publicada, sin calcular mejoras acumulativas.

Los dibujos son orientativos. No representan posiciones exactas de impacto, proporciones reales ni multiplicadores. La tabla de anatomía de Leaper publica resistencias como datos comunitarios no corroborados; no se usan para calcular daño. Las animaciones respetan movimiento reducido.

## Proyectos y materiales

Se capturaron las fichas actuales de los nueve proyectos y sus 64 paneles de etapas, incluidas las ediciones históricas de Expedition. Se separaron requisitos y recompensas por sus encabezados y tablas. Los objetivos de actividad sin una lista de materiales remiten al detalle de la fuente.

Las recompensas que terminan explícitamente en Blueprint se enlazan con su plano. Un arma fabricada, como Aphelion en Trophy Display, no se transforma en un plano por semejanza de nombre. Se conservan los estados histórico y desconocido al presentar rutas de proyectos. Las pistas de materiales enlazan un ARC cuyo botín contiene ese objeto; son reportes posibles, no garantía de obtención.

La ficha actual de Ascending The Mountain coincide con el índice en el 7 de octubre; la hora de cierre sigue sin especificar, por lo que su disponibilidad permanece desconocida. Avian Alarm mantiene un conflicto entre el cierre del índice y la ficha actual. Las fuentes anteriores se conservan y los campos efectivos muestran la corrección o el conflicto.

## Enlaces de revisión y mapas

Cada ficha ofrece un enlace directo y un botón para copiarlo. Los enlaces usan parámetros, conservan la subcarpeta de GitHub Pages y validan entidades conocidas. Un enlace a una ficha anunciada mantiene su disponibilidad anunciada.

Desde un ARC se accede a los mapas con reportes de esa máquina, filtrados por piso y tipo. El índice reproduce los conteos de las seis cachés; la ausencia de un reporte no demuestra ausencia del enemigo. Los focos de planos por misión y de ARC se distinguen. Cambiar de ficha limpia el foco anterior.

## Validación y límites de la entrega

43 pruebas cubren integridad, procedencia, clasificación, separación de objetos/planos, disponibilidad, datos de proyectos, reportes de mapas y enlaces. TypeScript estricto y compilación de producción pasaron. La revisión en navegador comprueba controles de zonas, navegación Hornet a sus seis reportes en Dam, cambio de etapas y enlace Bobcat desde su recompensa de proyecto.

La entrega termina las funciones de esta edición. La corroboración primaria de posiciones, porcentajes, tasas y datos todavía desconocidos requiere evidencia adicional; permanecerán marcados con su alcance real. Los diagramas anatómicos exactos no se sustituyen con marcas inventadas sobre una imagen. La actualización de contenido tras nuevos parches constituye mantenimiento posterior.
