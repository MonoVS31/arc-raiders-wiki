# Fase 8: fichas estáticas y enlaces para compartir

## Decisión y alcance

Se conserva React + Vite y se agrega un generador de HTML en el build. No se migra a Astro: las URLs nuevas /fichas/<id>/ se suman a las URLs actuales y reutilizan la misma composición del catálogo. Cada ficha incluye metadatos propios, una tarjeta PNG original y todos sus campos efectivos con evidencia, disponibilidad, notas y fuentes. El HTML se puede leer sin JavaScript; al cargar el cliente se abre la ficha interactiva habitual.

Los botones de compartir usan las nuevas rutas. La navegación dentro de la SPA conserva los parámetros existentes, incluido el contexto de mapas. CSS y datos se resuelven desde la raíz del atlas al abrir una ficha profunda. Se conserva base: './' de Vite.

Las tarjetas se generan a partir del nombre, categoría, disponibilidad y símbolo original del atlas. No contienen assets del juego. El usuario pidió posteriormente descargar las imágenes usadas, aunque informó que no dispone de permiso. Se guardaron 381 imágenes en public/images/game y se registraron URL original, hash, tamaño, atribución y licencia no confirmada en image-assets.json. No se infiere una licencia de esa instrucción. Los tiles del mapa siguen remotos. Un proxy no resuelve los derechos de redistribución ni puede alojarse directamente en Pages.

El caché de 54,7 MB permanece en Arc y se excluye de Git. En CI, assets:ensure recupera el snapshot y comprueba hashes antes de copiarlo a dist y publicarlo en Pages. Así el navegador recibe imágenes desde el sitio propio; el build depende del proveedor. Si una imagen desaparece o cambia, el build falla y no reemplaza el despliegue anterior. No se modifica ningún dato ni URL de procedencia del catálogo.

## Verificación

La composición mantiene el hash efectivo anterior. Los tests revisan las 167 fichas, metadatos, valores, evidencia, notas, fuentes, escapes HTML/SVG, enlaces antiguos y nuevos, foco de mapa, regreso con scroll, resolución de assets y reintento conservando el artículo estático. El build verifica los 381 hashes de imagen y genera los PNG y sitemap. Se verifican lint, tipos, 103 tests y build antes de publicar. El archivo de entrada pesa 4,34 KB / 2,07 KB gzip; el resto de la aplicación se carga aparte. La revisión pública comprueba fichas, imágenes y mapas después del despliegue.

Referencias: https://vite.dev/guide/ssr.html y https://ogp.me/.
