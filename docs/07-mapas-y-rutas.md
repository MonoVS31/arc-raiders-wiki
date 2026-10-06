# Mapas y rutas de obtención — fase 2/3

Corte: 6 de octubre de 2026. Se utiliza la API pública de MetaForge con atribución, caché local y revisión de la configuración de coordenadas de su visor público. Los datos son comunitarios y no provienen de Embark.

Esta integración es para el proyecto público gratuito actual. Los términos de la API requieren atribución y contacto previo para un producto monetizado: https://metaforge.app/arc-raiders/api. Los materiales del juego conservan los derechos de sus propietarios. Las imágenes del mapa se solicitan al proveedor; no se incluye una copia de sus tiles en el repositorio.

Las coordenadas se transforman con dos pares de anclajes de la configuración pública: worldExtent y tileExtent. La transformación es afín por eje. No se infiere una escala en metros. Las capas se filtran por el índice de piso y su máscara de bits; los registros con todos los pisos habilitados se etiquetan sin un piso exclusivo. Los eventos usan sus índices de bits, distintos de la máscara del marcador.

El visor utiliza solamente el conjunto comunitario que muestra la página pública de MetaForge. Los registros heredados community=false quedan fuera; la comparación en Dam produce 48 reportes de cajas, que coincide con el contador visible de la fuente. Ese número no representa cajas garantizadas por partida. Los marcadores se clasifican como posibles, con URL, fecha de actualización y advertencia de aparición aleatoria.

Los planos de fabricación y los objetivos de misiones son conceptos distintos. Un marcador de una misión que recompensa un plano no es la posición de aparición del plano. Las rutas de los 83 planos se separan del catálogo de objetos; los datos del índice que no coinciden con la ficha individual conservan su incertidumbre. Se comprueba explícitamente el texto de recompensa de plano y no se confunde con una recompensa del arma o granada ya fabricada.

Las capturas originales y respuestas completas se guardan en Arc/work/research. La aplicación incluye solo campos de mapa necesarios, sin perfiles de contribuidores. scripts/refresh-map-snapshot.mjs permite actualizar la caché deliberadamente; no consulta la API cada vez que un usuario abre una ficha.

## Cobertura

| Mapa | Reportes publicados | Cajas |
| --- | ---: | ---: |
| Dam Battlegrounds | 464 | 48 |
| Spaceport | 382 | 34 |
| Buried City | 389 | 38 |
| The Blue Gate | 368 | 34 |
| Stella Montis | 219 | 27 |
| Riven Tides | 159 | 20 |

Total: 1.981 reportes, 201 de cajas. Todos son posibles; no se declara un total oficial de apariciones por partida.

83 rutas de planos: 7 con corroboración específica, 72 del índice por corroborar y 4 incompletas. Las recompensas de plano verificadas para Burletta, Hullcracker y Lure Grenade se enlazan con los mapas de sus objetivos de misión. La captura inicial conserva su evidencia, y el catálogo efectivo sustituye los campos pendientes anteriores al resolver filtros.

## Validación de esta fase

Comprobación de tipos y pruebas de calibración, integridad SHA-256, máscaras de pisos/eventos, snapshots de los seis mapas, rutas y render de fichas. Revisión en navegador: 48 cajas de Dam; selección y fuente de un reporte; Stella Montis, 20 reportes arriba y 7 abajo; ruta de Hullcracker hacia un objetivo de misión en Dam. El movimiento reducido desactiva animación de zoom y desplazamiento. La carga inicial conserva una advertencia de bundle grande; mapas y biblioteca se cargan por demanda.
Resultado final local: 24 pruebas aprobadas en tres archivos, TypeScript estricto sin errores y compilación Vite correcta. El catálogo efectivo evita usar en filtros los pendientes que ya fueron sustituidos por evidencia de esta fase.
