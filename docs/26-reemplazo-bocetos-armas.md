# Reemplazo de bocetos de armas

Las 24 tarjetas de armas y sus fichas muestran imágenes generadas a partir de la geometría original de `armas-3d.html`, en lugar de los estudios anteriores. El generador editorial `scripts/build-original-weapon-sketches.mjs` lee el HTML sin modificarlo y produce PNG estáticos: no hay 24 visores corriendo a la vez.

La ficha presenta el mismo boceto y permite abrir el visor completo en esa arma. El visor suministrado, sus valores de ejemplo y sus controles conservan todos sus bytes. Los datos factuales, filtros y URLs de la wiki no cambian. Las armas anunciadas sin modelo mantienen su presentación existente.

