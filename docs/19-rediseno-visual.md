# Fase 9: rediseño visual en revisión

Rama: feat/rediseno-visual. Un commit de fase. No integrar a main sin aprobación del usuario.

## Dirección de arte

Negro cálido, crema, naranja quemado y turquesa secundario; retícula militar, esquinas visualmente recortadas, líneas finas y códigos monoespaciados. Se retiró la capa de grano SVG de pantalla completa durante la revisión de rendimiento. Paleta y tokens tipográficos en el único :root de tokens.css; estilos organizados por sección en redesign.css dentro de @layer components.

## Tipografía local

Barlow Condensed 600/700 para títulos, Inter Variable para lectura y JetBrains Mono Variable para datos. Se distribuyen desde @fontsource con font-display: swap, sin Google Fonts remoto. Las licencias OFL están en public/font-licenses. Los subconjuntos variables usan unicode-range; el navegador descarga los que necesita.

## Cambios por sección

- Portada: hero panorámico del alto del viewport, degradados de lectura, palabras reveladas en secuencia y parallax máximo de 7/5 px según el cursor en escritorio. Bento con Mapas y ARC destacados; son imágenes editoriales, no mapas nuevos. Contadores derivados del mismo catálogo, con número final estable y entrada por transform/opacity. Franja Frozen Trail que abre el anuncio existente.
- Galería: spotlight radial en una capa que se mueve con transform, tilt de hasta 2,5 grados en una capa independiente del layout de Motion, imágenes que sobresalen del marco interno, acentos por disponibilidad y skeleton mientras cargan. Se conserva el enlace real y la apertura con teclado y nueva pestaña.
- Ficha: título display e imagen grande, datos originales junto a barras decorativas. La escala se calcula entre valores numéricos del mismo campo, categoría y unidad del archivo; no es un máximo del juego, no interpreta RPM mixtos, porcentajes ni datos desconocidos. Índice con aria-current según la sección visible, incluidos contenidos cargados por demanda.
- Microinteracciones: presión de botones, subrayado y pequeños movimientos de íconos; solo transform y opacity.

## Correcciones de revisión · edición visual 2.3

- Logo del sidebar en Barlow Condensed; subtítulo en una línea. Proyectos usa una lista de tareas, Contenedores una caja y Materiales un recurso geométrico.
- Bento con áreas explícitas: tres filas completas en escritorio y dos columnas hasta 1100 px. Se revisaron 375, 900, 1024 y 1366 px; sin huecos ni títulos recortados.
- Hornet llena la región derecha hasta los bordes, con imagen cover y degradado de lectura. En celular se atenúa la imagen.
- Comparador con tokens compartidos para etiquetas y ayuda. Barras para valores numéricos, multiplicadores explícitos y durabilidad en shots; las series I–IV se muestran como cuatro barras. No se extraen números de descripciones, porcentajes ni cadencias mixtas. Las escalas mantienen campo, unidad y categoría; no se interpretan como máximos del juego.
- La sección Estadísticas y datos incluye el comparador. El índice sigue scroll capturado y contenido por demanda; en tablet/celular aparece antes de la ficha. Se comprobaron ambos enlaces de sección y el cambio al nivel IV de Kettle (898 shots conservados).
- Se retiraron el grano global, el filtro heredado del hero, las entradas ligadas al scroll y la sombra al pasar por los botones bento. El puntero escribe transform solo en las capas que se mueven, sin actualizar seis variables heredadas en toda la tarjeta por frame. Los contadores conservan el valor final: entran mediante transform/opacity, sin cambiar texto por frame. El observador de animaciones ignora cambios de texto, evitando recorridos globales repetidos. Sidebar y topbar conservan backdrop-filter: none.

### Límite de la medición de rendimiento

La conexión disponible permite inspeccionar DOM, estilos y capturas de Chrome, pero no controlar su pestaña DevTools/Performance. Se intentó abrirla mediante el atajo del navegador sin obtener acceso al panel. Un ensayo local con requestAnimationFrame de ocho segundos presentó intervalos cercanos a un segundo y ningún long task: el navegador automatizado limita la cadencia, por lo que se descartó como prueba de FPS. No se certifican 60 fps ni se atribuye una mejora porcentual sin una traza válida. Falta una grabación de Performance en Chrome en primer plano para verificar rasterización y frames perdidos en esta PC.

Validación: lint, TypeScript, 109 pruebas, hashes de datos y assets, build y 167 fichas prerenderizadas. Vista local de revisión: http://127.0.0.1:4176/. No se integra ni publica main en esta fase.

## Accesibilidad y preservación

No se modifican JSON, disponibilidad, evidencia, fuentes, notas, filtros, rutas ni la base relativa de Vite. Los mapas conservan sus herramientas, coordenadas y tiles. No se agregan bibliotecas de animación. prefers-reduced-motion evita parallax, tilt, conteos, revelados, ticker y shimmer. El contador presenta el valor final a tecnologías asistivas durante toda la animación. Los adornos y barras son aria-hidden.

Contrastes de texto sobre la superficie elevada más clara; los títulos sobre fotografías tienen degradados adicionales:

| Uso | Texto | Fondo | Ratio |
|---|---|---|---|
| Texto crema | #f3ead6 | #2b261e | 12.55:1 |
| Texto secundario | #c7bca8 | #2b261e | 8.00:1 |
| Naranja | #e69a6c | #2b261e | 6.58:1 |
| Turquesa | #79c7bb | #2b261e | 7.65:1 |
| Texto de botón | #17130f | #e69a6c | 8.10:1 |

## Revisión y vista previa

Ejecutar npm run lint, npm run typecheck, npm test y npm run build. Se comprueba el catálogo efectivo contra el hash de referencia y las rutas antiguas y estáticas mediante los tests existentes. Nuevos tests cubren movimiento reducido, skeleton, fallo de imagen, escala numérica y scroll-spy. Revisar portada, bento, galería, fichas y paneles a 375 px, sin desplazamiento horizontal.

Después de compilar, npm run preview -- --port 4175 muestra el resultado local en http://127.0.0.1:4175/. Es una vista en esta PC, no una publicación de main. La rama y la propuesta de cambios sirven para revisar el código antes de aprobarlo.

### Compatibilidad del entorno local

El generador SSR conserva rutas de paquetes (preserveSymlinks) para evitar consultas nativas de realpath que fallan dentro del entorno aislado sobre OneDrive. El HTML y los datos generados conservan su comportamiento. Los temporales de verificación se guardan en Arc/work/phase9-runtime-temp cuando se ejecuta desde el entorno aislado.

Si el servidor del agente no responde al navegador, abrir una terminal normal en Arc/outputs/arc-raiders-wiki y ejecutar npm run preview -- --port 4175. Esto sirve el dist ya compilado sin cambiar la rama main. La revisión de 375 px y las interacciones se realizó antes de la interrupción; se conserva el resultado en los tests de regresión y el diseño está pendiente de aprobación.
