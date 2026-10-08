# Diagramas animados · fase 1

Rama: `feat/diagramas`. Solo está implementada la base. Las integraciones de las fases 2–6 requieren aprobación del usuario después de cada commit. No se integra a main ni se publica en este cierre.

## Componentes y datos

- `DiagramFrame`: esquinas opuestas, escaneo horizontal de ida y vuelta, entrada una sola vez al entrar en pantalla y escalonado de 150 ms por punto. La entrada usa IntersectionObserver; no hay callbacks de scroll ni filtros nuevos.
- `HotspotLayer`: imagen en su proporción natural, puntos y etiquetas en porcentajes de esa superficie, líneas guía y botones nativos con nombre accesible, aria-pressed y aria-controls. El panel lateral conserva un contenedor aria-live="polite" y pasa debajo hasta 900 px. `selectedId`, `onSelect` y `renderPanel` permiten sincronizarlo con los controles ARC existentes en la próxima fase.
- Los números del panel provienen del claim original y de `StatBars`; las barras animan desde cero hasta su escala original. Una zona ARC muestra sus textos, condición, evidencia, confianza y fuentes originales. No se deducen porcentajes de resistencia ni medidas.
- Sin entrada o con `puntos: []`, el componente devuelve el fallback sin ningún wrapper, marco o efecto adicional. Si falla una imagen con puntos, los controles superpuestos se retiran y el panel conserva los datos y fuentes.

El registro `public/data/atlas/diagram-hotspots.json` empieza como `[]`. No hay fichas con posiciones aprobadas en esta fase. Las coordenadas usadas en tests son sintéticas y no se incluyen en los datos del sitio.

Cada entrada admite únicamente `entityId`, `imageUrl` y `puntos`. Cada punto admite `id`, `x`, `y`, `lx`, `ly` y `ref`. Los cuatro porcentajes son finitos y van de 0 a 100. `ref` contiene exclusivamente `{ zoneId }` o `{ field }`:

- `zoneId` debe existir en las zonas del mismo ARC.
- `field` debe existir en los claims del mismo sujeto del catálogo efectivo.
- La imagen debe estar asociada a esa entidad en `arc-portraits.json` o `entity-visuals.json`. Se guarda su URL original y se resuelve al snapshot local existente.
- No se aceptan IDs duplicados, texto, notas, valores, confianza ni fuentes dentro del nuevo JSON. Se leen desde el archivo original en tiempo de ejecución.

El esquema zod de `src/domain/diagram-hotspots.ts` se ejecuta en `data:validate`, que forma parte del build. La carga utiliza la caché JSON existente y la base relativa de Vite. El hash del catálogo y sus fuentes se sigue comprobando contra el mismo valor de referencia.

## Editor

Disponible exclusivamente con `import.meta.env.DEV` y `?editar-diagrama=1`. Sobre una instancia montada de HotspotLayer, un clic muestra y copia x, y, con dos decimales. Si el portapapeles está bloqueado, se conserva el texto para copiar manualmente. Con teclado, el control de registro copia el centro (50, 50), anunciado en su nombre accesible.

Para cargar el primer punto puede montarse una entrada con imagen existente y `puntos: []`: el editor funciona, sin inventar una referencia. El JSON se edita a mano; el editor no escribe datos automáticamente. En modo edición, los clics atraviesan los hotspots para registrar coordenadas sobre toda la imagen; los botones mantienen el acceso por teclado.

La URL por sí sola no monta diagramas en las fichas actuales: esa integración empieza en la fase 2. El editor no aparece en producción aunque se conserve el parámetro.

## Identidad, animación y accesibilidad

Los estilos están en `redesign.css`, dentro de @layer components. Colores, fuentes, tamaños de control y duraciones provienen de tokens.css. Débil usa --color-weak-point, protección --color-armor, sin blindaje --color-secondary y desconocido --color-evidence-unknown. El tipo también aparece como texto y en el nombre del botón. La evidencia conserva las clases y tokens existentes.

Las animaciones solo modifican transform y opacity. `useVisibleAnimations` observa .diagram-frame y .diagram-panel, pausando sus descendientes fuera de pantalla o con el documento oculto. Con prefers-reduced-motion no hay escaneo, pulso, escalonado ni llenado animado; se conservan puntos, texto y valores finales. Al enfocar un punto con teclado se muestra su grupo sin esperar el escalonado. Esquinas, guías, etiquetas duplicadas y barras decorativas son aria-hidden. Se conserva el aviso de dibujos orientativos.

## Validación y próximos pasos

Cierre de fase 1: lint, TypeScript, 120 pruebas, data:validate y build en verde; 381 imágenes verificadas y 167 fichas prerenderizadas. El hash del catálogo efectivo y sus fuentes permanece idéntico.

Las pruebas cubren el JSON y sus referencias, fallback idéntico, controles nativos enfocables, selección controlada, datos/fuentes originales, proporción de imagen, imagen fallida, reduced motion, pausa por visibilidad y editor en desarrollo/producción, incluyendo entrada vacía y fallo del portapapeles.

Pendiente de la fase 2: integrar ARCZoneExplorer, revisar imágenes y cargar solo piezas inequívocas; registrar los ARC pendientes. Las armas, granadas, Leaflet, rutas, proyectos, dossiers y revisión a cuatro anchos se mantienen para sus fases correspondientes. No se agregaron dependencias, posiciones reales, datos de detección, extracciones, cotas ni curvas de nivel.
