# Animaciones de ARC Atlas

## Alcance de la fase 6

Se implementaron las transiciones y efectos con APIs del navegador. La única dependencia nueva es `motion` (14.0.0), usada para layout de la galería y presencia de modales. GSAP, ScrollTrigger, Three.js y react-three-fiber no están instalados. No cambiaron el catálogo, la evidencia, disponibilidad, fuentes, notas ni las URLs.

## Navegación e imágenes compartidas

`transitionNavigation` envuelve portada, categorías y fichas con `document.startViewTransition`. La actualización de React se confirma dentro del callback con `flushSync`; después se espera la decodificación de la imagen de destino cuando existe. Cada imagen de tarjeta y ficha, incluidas las de ARC, comparte `art-<id>` como view-transition-name. Los ids del catálogo son únicos. Los snapshots del root tienen un fundido de 250 ms; los grupos de imágenes usan 350 ms.

Si la API falta, la navegación sucede directamente. Si la captura es rechazada, el cambio de vista ya confirmado sigue siendo válido; una excepción inicial también aplica el cambio una sola vez. La preferencia de movimiento reducido evita llamar a la API. Atrás y Adelante mantienen el mecanismo anterior y su scroll guardado.

Referencia: [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/Document/startViewTransition).

## Entrada ligada al scroll

Se retiró --delay y la entrada temporal wiki-enter de gallery-card y portal-tile. Dentro de @supports (animation-timeline: view()), ambas tarjetas usan una timeline view() y animation-range entry. La entrada es un fundido leve de 0.95 a 1; no compite por transform con el layout de Motion ni oscurece drásticamente los textos. Los navegadores sin soporte muestran las tarjetas directamente, sin animación de entrada.

## Diálogo, backdrop y búsqueda

`animations.css` usa @starting-style y transition-behavior allow-discrete para animar apertura y cierre de WikiModal, su backdrop y el desplegable del combobox. Las propiedades continuas son opacity y transform; display y overlay solo mantienen el elemento durante la salida. Los atributos hidden y el estado ARIA cambian inmediatamente para evitar opciones invisibles en el teclado.

`ModalStack` mantiene el descriptor de cada panel en la pila y presenta solo el superior. AnimatePresence con mode wait conserva el diálogo que sale hasta que termina su transición. WikiModal usa usePresence para cerrar el diálogo nativo y confirmar su retirada. transitionend retira el elemento, con un límite de 260 ms como respaldo; sin soporte o con movimiento reducido se retira directamente. Se conserva showModal, el cierre con Escape y el bloqueo/restauración del scroll, evitando dos diálogos simultáneos con ids duplicados.

Referencias: [@starting-style](https://developer.mozilla.org/en-US/docs/Web/CSS/@starting-style) y [AnimatePresence](https://motion.dev/docs/react-animate-presence).

## Radar y borde de tarjetas

@property registra --sweep-angle con tipo angle, initial-value 0deg e inherits false. La variable fija el ángulo de referencia de los gradientes y del giro. Para conservar la regla de rendimiento de la fase 5, el barrido interpola transform, en vez de repintar el gradiente modificando su ángulo en cada frame.

El radar es una capa decorativa recortada dentro de welcome-banner. El borde de las tarjetas mantiene su máscara quieta mientras gira un gradiente en su interior al hacer hover. Los colores usan los tokens del archivo: acento turquesa y naranja de acción. Las capas tienen aria-hidden y pointer-events none; no afectan el contenido ni la interacción. IntersectionObserver pausa los giros fuera de pantalla.

## Motion solo donde se necesita

CategoryView carga MotionGallery con lazy() y conserva una Gallery estática durante la descarga. Las tarjetas siguen siendo WikiLink con href real y ref al anchor; m.create, LazyMotion con domMax y layout position animan su reacomodo al filtrar. No se usan gestos, drag ni animaciones JS para el hero.

ModalStack se importa con lazy() después de abrir el primer panel. La portada inicial no monta ese componente ni solicita Motion. Se dejó que el bundler separe las funciones compartidas de presencia del motor de layout para que abrir una fuente no descargue la galería completa.

Referencias: [layout de Motion](https://motion.dev/docs/react-layout-animations) y [LazyMotion y reducción de tamaño](https://motion.dev/docs/react-reduce-bundle-size).

## Movimiento reducido y accesibilidad

La consulta prefers-reduced-motion se observa también desde React. Con reduce: se omite View Transitions, layout es false, las salidas no esperan timers, los decorativos radar/borde se ocultan y las animaciones y transiciones CSS se desactivan. Las pseudocapas de View Transitions también tienen animation none. Los estados de búsqueda, enlaces, diálogos, foco y títulos siguen funcionando.

La interfaz conserva los tamaños mínimos y tokens de contraste de la fase 4. Los efectos no agregan información del juego y no sustituyen notas ni niveles de evidencia.

## Validación y peso

- Lint, typecheck, 95 tests, validación de datos y build aprobados.
- Tests de API ausente, movimiento reducido, capturas rechazadas, confirmación única, nombres compartidos y salida de modales con y sin reducción.
- Revisión en navegador: navegación nativa con ready resuelto, cierre de diálogo y scroll restaurado, galería filtrada a Rattler sin errores.
- El arranque continúa en 4,06 KB (1,95 KB gzip). La wiki diferida pesa 40,98 KB (12,75 KB gzip).
- MotionGallery y su motor diferido: 122,60 KB (39,97 KB gzip); presencia compartida: 0,80 KB (0,49 KB gzip); ModalStack y contenido: 11,44 KB (4,60 KB gzip).
- El manifiesto confirma que esos tres chunks no están en la cadena de imports estáticos de la portada. Las mediciones y cierres de dependencias se conservan en 12-animaciones-mediciones.json.
- Se limita la suite a cuatro workers y 15 s por test para evitar falsos timeouts al renderizar todas las fichas en paralelo; las comprobaciones anteriores se mantienen.

## Futuro: hero con GSAP/ScrollTrigger

Esta sería una extensión posterior, con una razón visual concreta: una secuencia coordinada de varias capas del archivo mientras el hero queda fijado durante un tramo de scroll. No se necesita para los efectos actuales.

Crear un módulo HeroScrollScene separado y cargarlo con lazy() únicamente si el viewport es de escritorio (por ejemplo 1024 px o más), el hero está próximo a entrar en pantalla y no hay movimiento reducido ni ahorro de datos. El fallback conserva la portada CSS actual y su altura reservada. GSAP y ScrollTrigger se importan dentro de ese módulo, nunca desde la entrada o la navegación. La escena debe liberar sus timelines y triggers al desmontar, volver al fallback si cambia la preferencia y respetar teclado y scroll nativo. [Documentación de ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/).

## Futuro: ARC 3D con react-three-fiber

Crear Arc3DViewer como módulo lazy, solo en escritorio y después de una interacción explícita para ver el modelo. Mantener imagen, puntos reportados, datos y controles accesibles como alternativa. El modelo requiere procedencia y permiso de uso; sus piezas no deben usarse para inventar puntos débiles o resistencias.

Usar un canvas con tamaño reservado y render por demanda, reducir la resolución en equipos limitados, reutilizar materiales/geometrías y detener el render al salir del viewport. Los controles deben invalidar frames cuando cambie la cámara; al desmontar se liberan texturas y recursos WebGL. Si WebGL falla, hay movimiento reducido o se activa ahorro de datos, se conserva la imagen. Las dependencias y archivos del modelo no deben descargarse en la portada ni en celular. [Rendimiento de react-three-fiber](https://r3f.docs.pmnd.rs/advanced/scaling-performance).

## Pendiente

Las fases 1 a 6 están preparadas en el repositorio local de Arc. Falta publicar los commits en GitHub. El hero GSAP y el visor 3D son propuestas documentadas, sin código ni dependencias instaladas en esta fase.
