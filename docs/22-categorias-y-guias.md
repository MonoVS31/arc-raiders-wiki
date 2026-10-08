# Categorías y guías · 8 de octubre de 2026

Los catorce accesos de portada conservan la cuadrícula 7/4/3 y los SVG originales. Sus superficies usan los tokens de negro cálido y crema de ARC Atlas. El contorno naranja es fino y tiene un halo estático de dos píxeles, sin animación de filtros ni cambio del diseño del resto del sitio.

Los nueve accesos sin contenido abren paneles locales con búsqueda: Misiones, Equipo, Comerciantes, Taller, Juicios, Habilidades, Personalización, Mazos y Ciencia. Hay 59 entradas seleccionadas, no una reproducción completa del catálogo externo. Se reutiliza el diálogo existente, su navegación por teclado, cierre y política de movimiento reducido.

## Fuentes y contenido

Consulta de [ARC Raiders Wiki](https://arcraiders.wiki/) el 08/10/2026: Quests, Equipment, Augments, Shields, Healing, Traders, Workshop, Trials, Skills, Customization, Decks, Reward Pass y Lore. También se consultaron las fichas Picking Up The Pieces, Clearer Skies y Trash Into Treasure para objetivos, requisitos y recompensas.

Cada sección y entrada guarda su enlace de fuente. Los datos comunitarios nuevos se clasifican como probables. Se preservan íntegros los archivos originales de catálogo, fuentes, evidencia y notas; esta ampliación vive en category-guides.json y tiene un esquema Zod independiente que valida data:validate.

Mazos conserva los tres recorridos antiguos como históricos. Reward Pass y la temporada 6 de Trials se muestran anunciados porque las páginas consultadas aún no confirman la disponibilidad posterior al lanzamiento del 8 de octubre. No se inventan desafíos vigentes ni precios de tienda. Personalización advierte que la fuente no sigue el stock de cosméticos.

Ciencia mantiene el nombre solicitado para el botón del libro, pero indica «Historia y mundo / Lore»: es el destino equivalente en la wiki de referencia. Se incluyen hechos de trasfondo, sin convertirlos en datos de combate.

## Atribución

Los textos de estas nueve guías fueron traducidos y resumidos por ARC Atlas a partir de las contribuciones de ARC Raiders Wiki. Se distribuyen bajo [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), con enlaces de fuente y licencia en los paneles. Esta licencia se aplica a dichos textos adaptados; el código y los datos anteriores mantienen su situación original. El contenido del juego sigue perteneciendo a Embark Studios. No se incorporaron imágenes, íconos ni estilos de la web externa.

## Cobertura pendiente

Se incorporan tres misiones iniciales y selecciones de equipo y habilidades. No se afirma cubrir todas las misiones, habilidades, cosméticos ni recompensas. Quedan pendientes el catálogo completo y la verificación de cambios posteriores al parche. Los enlaces originales permiten consultar el detalle de cada entrada.

## Validación

Lint, TypeScript, 143 tests, validación de los JSON, hashes de las 381 imágenes, build y las 167 fichas prerenderizadas en verde. Se abrieron los nueve paneles a 1366 y 375 px, sin desbordamiento horizontal. Se comprobaron búsqueda de misiones y habilidades, apertura con Enter y cierre con Escape. El brillo de los íconos es estático; las transiciones de los botones conservan la política de movimiento reducido.
