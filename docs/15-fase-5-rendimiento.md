# Fase 5: rendimiento

## Carga de datos y arranque

Los 15 JSON de src/data se trasladaron a public/data/atlas, conservando exactamente sus bytes y SHA-256. El catálogo efectivo también conserva el hash de la composición previa, incluidas fuentes, notas, disponibilidad y niveles de evidencia. Los módulos usan lecturas tipadas de la caché; los imports de JSON que quedan son de tipos y no emiten datos en JavaScript.

La entrada muestra carga y error con Reintentar sin descargar React. Solicita los archivos propios con fetch y BASE_URL, en paralelo. La caché reutiliza las respuestas y las solicitudes en curso; una respuesta HTTP fallida o JSON inválido se puede reintentar. Cuando los datos están completos, la entrada importa render-app y monta la wiki React. Los enlaces públicos y la base relativa se mantienen.

validateCatalog ya no se ejecuta en el navegador. npm run data:validate comprueba el catálogo original y el compuesto, además de los módulos auxiliares. npm run build ejecuta esa validación y falla si los datos son inválidos. La función de composición mantiene la misma lógica anterior. Los tests cargan fixtures desde los mismos JSON públicos. Los scripts de actualización de mapas, rutas y reportes usan las nuevas ubicaciones.

No se eliminó la transferencia de datos: los JSON suman 670.605 bytes sin comprimir y se descargan como archivos separados. La tabla mide JavaScript y CSS, no esos archivos ni imágenes externas. React sigue pesando 218,83 KB, pero se carga después del catálogo, junto con la wiki. No se ocultó dentro de una cifra de arranque.

## Mapa e imágenes

El visor conserva un Map de CircleMarker por id y sus colores. La selección modifica solo el anterior y el nuevo con setStyle/setRadius; los marcadores se reconstruyen al cambiar los filtros o el conjunto de datos, no al seleccionar. Leaflet usa preferCanvas. Se conservan zoom, tooltip, lista accesible y procedencia de reportes.

Las imágenes de React tienen width, height y decoding async; sus marcos CSS y object-fit conservan el aspecto actual y reservan espacio. Los tiles de Leaflet mantienen su geometría propia.

## Animaciones

Grid-drift mueve un pseudo-elemento con transform. Signal y zone-beacon usan halos de pseudo-elementos con sombra estática y animan opacity/transform. También se retiraron transiciones animadas de colores, fondos, bordes y sombras. Los keyframes propios modifican solo transform y opacity.

IntersectionObserver pausa cuadrícula, órbita, foto del hero, retratos, señales y pulsos fuera del viewport. También pausa cuando la pestaña está oculta, registra elementos añadidos por navegación y libera observers al desmontar. La política global de movimiento reducido se conserva. Sidebar y topbar dejan de usar backdrop-filter en pantallas de hasta 700 px.

## Tamaños medidos

Medición con npm run build antes y después de la fase. Unidades decimales del reporte de Vite, gzip entre paréntesis. Los nombres con hash se agrupan por función. Incluido significa que antes no existía un archivo separado; no representa cero bytes. Se incluyen todos los chunks emitidos, también CSS.

| Archivo / función | Antes KB (gzip) | Después KB (gzip) |
|---|---:|---:|
| Principal / arranque | 729.22 (133.71) | 4.06 (1.94) |
| Wiki / render-app | Incluido en principal | 39.48 (12.30) |
| React | Incluido en principal | 218.83 (68.26) |
| Zod | Incluido en compartidos | 88.70 (25.18) |
| Composición del catálogo | Incluido en principal | 8.83 (3.59) |
| WikiContext | 97.96 (28.57) | 1.03 (0.58) |
| LocalDossier | 2.86 (1.42) | 2.92 (1.45) |
| ProjectSteps | 21.56 (5.61) | 3.26 (1.34) |
| ARCZoneExplorer | 20.61 (5.22) | 5.93 (2.30) |
| WikiModal | 6.55 (2.49) | 6.73 (2.56) |
| MapExplorer | 10.13 (4.10) | 10.77 (4.33) |
| Leaflet | 148.74 (43.39) | 148.74 (43.39) |
| Runtime del bundler | 0.58 (0.36) | 0.71 (0.42) |
| CSS principal | 62.89 (12.20) | 63.48 (12.31) |
| CSS de Leaflet | 15.10 (6.37) | 15.10 (6.37) |

El chunk de entrada pasó de 729,22 KB a 4,06 KB. Un presupuesto en Vite hace fallar futuras compilaciones si la entrada alcanza 200.000 bytes. El HTML final no precarga React; su import ocurre cuando terminan las solicitudes de datos. Las mediciones de archivos se conservan en 15-bundle-mediciones.json; ese archivo también incluye una medición gzip propia de Node, cuya compresión difiere ligeramente del reporte de Vite.

## Validación

- npm run lint, npm run typecheck, 88 pruebas, npm run data:validate y npm run build aprobados.
- Caché en memoria, coalescencia de solicitudes, reintento HTTP y JSON inválido cubiertos por tests.
- Arranque con carga, error, reintento y cancelación cubierto por tests.
- Selección de marcadores: solo se modifican dos instancias; la selección repetida no hace trabajo.
- Pausa de animaciones fuera de pantalla, limpieza del observer y propiedades de keyframes cubiertas por tests.
- Comparación SHA-256 de los 15 archivos antes y después y del catálogo efectivo.
- En navegador: contenido y contadores conservados, imágenes con geometría y async decoding, señal inferior pausada fuera de pantalla, un Canvas para el mapa y nueve tiles cargados; selección desde la lista con reporte y fuentes visibles.
- Build servido bajo /arc-raiders-wiki/: fallo HTTP controlado de catalog.json mostró el error y Reintentar abrió la wiki con los contadores correctos. Esa comprobación no modificó los datos del repositorio.

## Pendiente

Las fases 1 a 5 están en commits locales; falta su publicación en GitHub. No se presenta un puntaje Lighthouse ni una medición de CLS o tiempos de red reales: esta fase informa tamaños de build y las verificaciones descritas.
