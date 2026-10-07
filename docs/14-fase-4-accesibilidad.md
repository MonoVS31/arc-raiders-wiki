# Fase 4: accesibilidad

## Cambios

Los tamaños tipográficos menores que 0.75rem se elevaron a 0.75rem. Se ajustaron los tokens de texto con contraste insuficiente en portada, navegación, footer, notas, créditos y evidencia. Los placeholders también usan un color explícito. La paleta conserva los colores de evidencia y disponibilidad, las notas y los datos.

La búsqueda global sigue el patrón de combobox editable con selección manual: input con nombre, aria-expanded, aria-controls y aria-activedescendant; popup listbox con options identificadas y aria-selected. Flecha abajo selecciona la primera opción, arriba selecciona la última; las flechas recorren la lista, Enter abre la ficha y Escape cierra sin borrar la consulta. Tab conserva su función normal. El foco permanece en el input y la opción activa se mantiene visible dentro de la lista. También funcionan el clic y la entrada de texto mediante IME.

Las tarjetas de galería usan WikiLink y un href real. El clic normal conserva navegación interna; Ctrl/Cmd, clic central y menú contextual quedan disponibles para abrir otras pestañas y copiar enlaces. El breadcrumb usa nav con nombre y una lista ordenada; la página actual tiene aria-current. document.title sigue ficha, categoría, portada y cambios del historial.

## Contraste

Se calculó luminancia relativa sRGB según WCAG, sin redondear antes de aplicar el umbral 4.5:1. Para degradados y transparencias se tomó conservadoramente el fondo más claro bajo los textos claros. El footer y el índice se muestran sobre el fondo compuesto de la página, más exigente que el color base aislado. Los ratios de esta tabla están redondeados solo para presentación.

| Texto | Antes | Después | Color / fondo |
|---|---:|---:|---|
| Números de tarjetas | 2.58:1 | 6.27:1 | `#8fa5c3` / `#192333` |
| Flechas de tarjetas | 3.93:1 | 6.27:1 | `#8fa5c3` / `#192333` |
| Identificador del footer | 3.08:1 | 7.19:1 | `#8fa5c3` / `#0f1623` |
| Texto del footer | 4.13:1 | 7.19:1 | `#8fa5c3` / `#0f1623` |
| Índice del artículo | 3.48:1 | 7.19:1 | `#8fa5c3` / `#0f1623` |
| Notas de fichas | 4.28:1 | 6.36:1 | `#8fa5c3` / `#182230` |
| Rótulo lateral | 4.34:1 | 7.39:1 | `#8fa5c3` / `#0d131e` |
| Conteos laterales | 4.01:1 | 7.39:1 | `#8fa5c3` / `#0d131e` |
| Nota lateral | 4.33:1 | 7.39:1 | `#8fa5c3` / `#0d131e` |
| Flechas de recetas | 4.07:1 | 6.75:1 | `#8fa5c3` / `#101d2d` |
| Créditos de imágenes | 2.48:1 | 5.48:1 | `#b4c9e4` / `#314963` |
| Botones de evidencia | 2.93:1 | 5.48:1 | `#b4c9e4` / `#314963` |
| Resultado seleccionado | 4.07:1 | 5.39:1 | `#a7bed9` / `#28435b` |

## Validación

- Lint, typecheck, 78 pruebas y build aprobados.
- Teclado del combobox, Escape, Tab, lista vacía, clic, desplazamiento interno y títulos iniciales/dinámicos/historial cubiertos por tests.
- Tests de regresión del tamaño mínimo y de 13 pares de colores sobre los fondos más exigentes revisados.
- Revisión en navegador de portada, arsenal, arma, ARC, plano, mapa, granada, materiales y resultados de búsqueda. Ningún texto medido por debajo de 12 px ni par medido por debajo de 4.5:1 después de corregir los tokens.
- En celular de 390 x 844: documento de 375 px, sin desbordamiento horizontal; opciones accesibles con flechas, Enter y Escape.
- Sin errores de consola. Datos y URLs conservados; base relativa y política global de movimiento reducido sin cambios.

Referencias: [patrón de combobox de WAI-ARIA](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) y [contraste mínimo WCAG](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

## Pendiente

La publicación de las fases 1 a 4 en GitHub sigue pendiente. Se conserva la advertencia anterior de tamaño del bundle para la fase de rendimiento. Las comprobaciones descritas no sustituyen una auditoría completa con tecnologías de asistencia y todos los estados posibles de la aplicación.
