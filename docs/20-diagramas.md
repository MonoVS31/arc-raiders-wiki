# Diagramas animados · fases 1 a 5

Rama: `feat/diagramas`. Están implementadas la base y las integraciones ARC, armas/granadas, mapas y resto del sitio. La fase 6 requiere aprobación del usuario antes de continuar. No se integra a main ni se publica en este cierre.

## Componentes y datos

- `DiagramFrame`: esquinas opuestas, escaneo horizontal de ida y vuelta, entrada una sola vez al entrar en pantalla y escalonado de 150 ms por punto. La entrada usa IntersectionObserver; no hay callbacks de scroll ni filtros nuevos.
- `HotspotLayer`: imagen en su proporción natural, puntos y etiquetas en porcentajes de esa superficie, líneas guía y botones nativos con nombre accesible, aria-pressed y aria-controls. El panel lateral conserva un contenedor aria-live="polite" y pasa debajo hasta 900 px. `selectedId`, `onSelect` y `renderPanel` permiten sincronizarlo con los controles ARC existentes en la próxima fase.
- Los números del panel provienen del claim original y de `StatBars`; las barras animan desde cero hasta su escala original. Una zona ARC muestra sus textos, condición, evidencia, confianza y fuentes originales. No se deducen porcentajes de resistencia ni medidas.
- Sin entrada o con `puntos: []`, el componente devuelve el fallback sin ningún wrapper, marco o efecto adicional. Si falla una imagen con puntos, los controles superpuestos se retiran y el panel conserva los datos y fuentes.

El registro `public/data/atlas/diagram-hotspots.json` se creó vacío en la fase 1. La fase 2 incorpora cinco referencias ARC tras inspeccionar las imágenes locales: Wasp, Firefly, Fireball, Bombardier y Leaper. Las coordenadas sintéticas usadas en los tests de la base no se incluyen en los datos del sitio. Ver [piezas y pendientes](20-diagramas-pendientes.md).

Cada entrada admite únicamente `entityId`, `imageUrl` y `puntos`. Cada punto admite `id`, `x`, `y`, `lx`, `ly` y `ref`. Los cuatro porcentajes son finitos y van de 0 a 100. `ref` contiene exclusivamente `{ zoneId }` o `{ field }`:

- `zoneId` debe existir en las zonas del mismo ARC.
- `field` debe existir en los claims del mismo sujeto del catálogo efectivo.
- La imagen debe estar asociada a esa entidad en `arc-portraits.json` o `entity-visuals.json`. Se guarda su URL original y se resuelve al snapshot local existente.
- No se aceptan IDs duplicados, texto, notas, valores, confianza ni fuentes dentro del nuevo JSON. Se leen desde el archivo original en tiempo de ejecución.

El esquema zod de `src/domain/diagram-hotspots.ts` se ejecuta en `data:validate`, que forma parte del build. La carga utiliza la caché JSON existente y la base relativa de Vite. El hash del catálogo y sus fuentes se sigue comprobando contra el mismo valor de referencia.

## Editor

Disponible exclusivamente con `import.meta.env.DEV` y `?editar-diagrama=1`. Sobre una instancia montada de HotspotLayer, un clic muestra y copia x, y, con dos decimales. Si el portapapeles está bloqueado, se conserva el texto para copiar manualmente. Con teclado, el control de registro copia el centro (50, 50), anunciado en su nombre accesible.

Para cargar el primer punto puede montarse una entrada con imagen existente y `puntos: []`: el editor funciona, sin inventar una referencia. El JSON se edita a mano; el editor no escribe datos automáticamente. En modo edición, los clics atraviesan los hotspots para registrar coordenadas sobre toda la imagen; los botones mantienen el acceso por teclado.

La fase 2 monta el componente en ARCZoneExplorer cuando hay una entrada con puntos. El parámetro habilita el editor en esas instancias de desarrollo; no aparece en producción aunque se conserve en la URL.

## Identidad, animación y accesibilidad

Los estilos están en `redesign.css`, dentro de @layer components. Colores, fuentes, tamaños de control y duraciones provienen de tokens.css. Débil usa --color-weak-point, protección --color-armor, sin blindaje --color-secondary y desconocido --color-evidence-unknown. El tipo también aparece como texto y en el nombre del botón. La evidencia conserva las clases y tokens existentes.

Las animaciones solo modifican transform y opacity. `useVisibleAnimations` observa .diagram-frame y .diagram-panel, pausando sus descendientes fuera de pantalla o con el documento oculto. Con prefers-reduced-motion no hay escaneo, pulso, escalonado ni llenado animado; se conservan puntos, texto y valores finales. Al enfocar un punto con teclado se muestra su grupo sin esperar el escalonado. Esquinas, guías, etiquetas duplicadas y barras decorativas son aria-hidden. Se conserva el aviso de dibujos orientativos.

## Validación y próximos pasos

Cierre de fase 1: lint, TypeScript, 120 pruebas, data:validate y build en verde; 381 imágenes verificadas y 167 fichas prerenderizadas. El hash del catálogo efectivo y sus fuentes permanece idéntico.

Las pruebas cubren el JSON y sus referencias, fallback idéntico, controles nativos enfocables, selección controlada, datos/fuentes originales, proporción de imagen, imagen fallida, reduced motion, pausa por visibilidad y editor en desarrollo/producción, incluyendo entrada vacía y fallo del portapapeles.

## Integración ARC · fase 2

Las referencias de foto se sincronizan con zone-options y zone-detail mediante una única selección de zona. Elegir una opción sin ancla deja todos los puntos de la foto sin seleccionar; el panel conserva el dato original y aclara que la posición en ese retrato está pendiente. Los puntos y las opciones se comprobaron con Enter en el navegador.

Los esquemas drone-four y shell-core conservan sus trazados y posiciones, ahora con marco, pulso y colores por tokens. El layout components conserva su lista de piezas dentro del marco: no se inventó una anatomía SVG. Débil, protección, sin blindaje y desconocido mantienen texto explícito y sus tokens. El panel tiene una única región aria-live; la entrada no se duplica entre el contenedor y zone-detail.

ARCCombatPanel muestra una sola instancia del retrato para los cinco ARC con puntos. La atribución y la procedencia de la imagen quedan junto al diagrama. Sin puntos se conserva el retrato anterior. Una imagen fallida no elimina las opciones, condiciones ni fuentes. Se mantienen las tablas de anatomía no corroboradas y los reportes posibles; no se crean barras de resistencia sin datos adecuados.

Cierre de fase 2: lint, TypeScript, 126 pruebas, data:validate y build en verde, con 167 fichas prerenderizadas. Se comprobó Firefly a 375 y 1366 px, panel debajo/lateral y ausencia de scroll horizontal, selección con Enter entre foto y opciones y el fallback de Hornet. Las pruebas nuevas cubren zona sin ancla, núcleo oculto de Fireball, imagen fallida, tipos de zona y retrato/atribución sin duplicación. El catálogo conserva su hash original. La revisión completa de todas las fichas, anchos y estados de movimiento queda en la fase 6.

## Armas y granadas · fase 3

La cabecera de Rattler y Tempest incorpora la imagen en proporción natural, un punto sobre el cargador visible y un panel que lee exclusivamente Magazine Size. Rattler conserva la serie 12 | 16 | 20 | 24 y las cuatro barras I–IV; Tempest conserva su valor 25. La evidencia y las fuentes siguen siendo las del claim original. La cabecera se organiza en una fila de título y otra de imagen/panel, con panel debajo en celular. Las imágenes de los diagramas no heredan el filtro de sombra del retrato anterior.

Sin entrada, la imagen normal de la cabecera permanece intacta. Kettle, Il Toro y Ferro no recibieron un punto tras la revisión: no se identifica un cargador separado con suficiente certeza o la capacidad corresponde al arma sin una pieza inequívoca en esta vista. El resto queda sin posiciones hasta una revisión positiva.

Las granadas no recibieron puntos sobre pasadores, tapas ni carcasas. Los campos existentes describen efecto, daño, radio, retardo, duración, aturdimiento o búsqueda; no relacionan explícitamente esos valores con una pieza visible. Se conserva el visor geométrico existente y sus advertencias, incluido el rechazo de radios inciertos en Wolfpack y Trailblazer.

StatBars agrega un marco compacto decorativo y una entrada/llenado escalonado usando las mismas funciones de escala. WeaponComparison y GrenadeEffectPanel reciben marco y entrada escalonada, conservando controles, números, series, fórmulas y fuentes. Los marcos de estadísticas y controles no tienen escaneo: se evita multiplicar líneas de escaneo en tablas y barras pequeñas. El escaneo sigue en las imágenes con puntos. No se agregó tilt ni parallax.

Las barras siguen siendo aria-hidden: el valor textual original está fuera de la decoración. Movimiento reducido mantiene el valor final y desactiva las entradas y llenados; los marcos continúan pausados por useVisibleAnimations. No se copió ninguna cifra, evidencia, nota o fuente dentro de diagram-hotspots.json.

Cierre de fase 3: lint, TypeScript, 132 pruebas, data:validate y build en verde, con 167 fichas prerenderizadas. El hash del catálogo y sus fuentes no cambió. Se comprobó Rattler a 375 y 1366 px sin scroll horizontal, el punto con Enter, la serie original en el panel y el nivel IV del comparador (24). Heavy Fuze conserva max=11.25 en el control de distancia, círculo r=65 en su SVG y la advertencia de impacto no garantizado; no tiene puntos sobre su imagen. La revisión completa con todos los anchos y estados de movimiento se reserva para la fase 6.

## Mapas y planos · fase 4

MapExplorer conserva CRS, calibración, tiles, zoom, arrastre, centrado, filtros, eventos, coordenadas, máscaras de piso, selección Canvas y lista accesible. El mapa tiene un marco con esquinas y escaneo; ningún contenedor del mapa recibe tilt, parallax, rotación ni una transformación nueva. El detalle aparece al costado en escritorio y debajo hasta 1100 px.

MapDiagramOverlay usa latLngToContainerPoint de la instancia Leaflet para ubicar un pulso sobre el marcador seleccionado y una línea hacia el encabezado del reporte. Las reproyecciones se agrupan en un requestAnimationFrame por evento move/zoom/resize, sin reconstruir los marcadores ni actualizar toda la lista React en cada movimiento. Al salir de la superficie visible, pulso y guía se ocultan. La guía no intercepta clics y se oculta en celular. El frame pausa sus adornos fuera de pantalla; reduced motion desactiva pulso, escaneo y entradas animadas.

Los 83 registros de blueprint-routes.json contienen metadatos de obtención, mapas y misiones, pero ningún recorrido de coordenadas ordenadas. Por eso las rutas actuales muestran Pendiente de verificar y no dibujan polilíneas. Tampoco se une automáticamente una lista de objetivos de misión, cajas ni reportes ARC.

Queda preparado el campo opcional `traces` en el esquema de rutas: mapSlug, floorId, orderedMarkerIds (al menos dos IDs únicos) y sourceIds. Se requieren mapa/piso y fuentes existentes. traceForMap conserva el orden declarado y devuelve los objetos originales; si falta un punto, otro piso o un filtro excluye parte del trazo, no se dibuja un recorrido parcial. Los segmentos usan las coordenadas de los reportes existentes y entrada por opacity, sin stroke-dashoffset ni nuevos cálculos de navegación. Los trazos geográficos se presentan como posibles, sin garantizar botín ni acceso. No hay ninguna entrada traces en los datos actuales.

El esquema MapConfig reserva `regionLabels?: [{lat, lng, texto, fuente}]`, vacío por ausencia en todos los mapas. Exige números finitos, texto y una fuente existente del índice de fuentes. El campo está reservado: no se renderizan etiquetas nuevas ni se cargaron nombres de zonas, extracciones o curvas de nivel.

Cierre de fase 4: lint, TypeScript, 137 pruebas, data:validate y build en verde, con 167 fichas prerenderizadas. Se conservan hashes de snapshots y catálogo. En Dam se comprobó selección por Enter, tiles cargados, contenedor sin transformación y guía al panel a 1366 px. A 375 px el mapa conserva 360 px de altura, el detalle queda debajo y no hay scroll horizontal. Con ?blueprint=blueprint-hullcracker-blueprint sigue el filtro de misión, su reporte y la advertencia de que no es una aparición del plano, sin trazo inventado.

Pendiente: las piezas sin ancla y los recorridos sin geometría de [20-diagramas-pendientes.md](20-diagramas-pendientes.md). La revisión completa a cuatro anchos permanece en la fase 6. No se agregaron dependencias, detección, extracciones, cotas ni curvas de nivel.

## Resto del sitio · fase 5

ProjectSteps, BlueprintRouteCard y LocalDossier reciben un marco sin escaneo y entradas escalonadas para requisitos, recompensas, campos y tablas. Se conservan etapas, selección, navegación, enlaces de fuentes, avisos, detalles desplegables y reintento de carga. Los campos de los contenedores reciben el mismo marco y escalonado sin duplicar sus valores ni evidencia.

Las imágenes principales sin puntos reciben DiagramFrame como fallback de EntityDetail: esquinas, escaneo y entrada. HotspotLayer sigue devolviendo el fallback recibido cuando no hay puntos; no crea controles superpuestos. Se retira la animación flotante heredada en estas imágenes para conservar una única entrada. Portada, galería y bento mantienen sus efectos existentes, con una única capa de tilt y sin otro parallax.

Los nuevos efectos usan únicamente transform y opacity y los tokens existentes. Al enfocar un control se elimina la espera de su entrada; reduced motion mantiene todo visible y sin animación. Los marcos ya están incluidos en la pausa por visibilidad. No se agregaron posiciones, datos, dependencias ni rutas.

Cierre de fase 5: lint, TypeScript, 142 pruebas, data:validate y build en verde; 381 imágenes verificadas y 167 fichas prerenderizadas. El catálogo conserva su hash original. Las pruebas cubren cambio de etapa, navegación al mapa desde un plano, fallo y reintento del dossier, campos de contenedores, imagen sin puntos y ausencia de capas duplicadas en portada y galería. Se comprobaron proyectos, planos, contenedores y portada a 375 px sin desborde horizontal. Quedan pendientes la revisión completa a 375, 900, 1024 y 1366 px con ambos estados de movimiento y la actualización final del README en la fase 6.