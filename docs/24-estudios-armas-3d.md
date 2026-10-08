# Estudios originales de armas en 3D

Se reemplazó la presentación visual de las 24 armas disponibles. No se modifican catálogo, estadísticas, evidencia, disponibilidad, fabricación, fuentes ni URLs. Canto, Dolabra y Rascal ya tenían ficha. Stiletto y Bantam, anunciados y fuera de la lista solicitada, conservan la presentación anterior.

## Arte y representación

Cada estudio es un diseño original basado en la familia solicitada, con cuerpo completo, cañón, empuñadura, alimentación, mira y culata cuando corresponde. Las proporciones, equipo, acentos y detalles varían entre las 24 piezas. No son réplicas del juego ni documentación factual de sus piezas. El visor lo advierte; las anotaciones señalan exclusivamente partes del diseño editorial. La clasificación factual sigue leyendo el catálogo: por ejemplo, Kettle conserva clase Assault Rifle aunque el estudio solicitado tenga silueta de pistola ligera.

La geometría se crea por código con cajas, perfiles extruidos, superficies de revolución, cilindros, toros e icosaedros. El desgaste se dibuja en Canvas con un identificador de estudio inventado. No hay GLB, OBJ, imágenes descargadas, logos ni formas propias de los assets del juego. Iluminación mate con contorno turquesa, fondo de diagrama oscuro, acentos turquesa/amarillo/naranja y anotaciones monoespaciadas. Los cambios de estilo quedan limitados a armas.

## Archivos estáticos

`public/weapons3d/` tiene un archivo JavaScript por arma, `parts.js` con piezas originales, `model.js` con materiales y geometrías y `viewer.js` con el visor compartido. `catalog.json` enlaza los archivos con los identificadores originales. Three.js 0.180.0 y OrbitControls se sirven localmente desde `vendor`, con su licencia MIT conservada. No se agregó una dependencia al arranque del sitio ni se usa un CDN o servidor para ejecutar el visor.

Los 24 perfiles SVG y las 24 miniaturas SVG se generan desde las mismas geometrías con `scripts/build-weapon-studies.mjs`, mediante SVGRenderer. El listado carga esas miniaturas estáticas; no crea visores WebGL. El respaldo sin WebGL es el perfil de la misma pieza. Los archivos publicados se ejecutan como JavaScript estático; no hay compilación ni descargas de modelos en el dispositivo del visitante.

## Comportamiento y recursos

El visor comienza a cargarse al entrar en pantalla. Un observador de intersección y una comprobación complementaria de rectángulo al desplazar/redimensionar evitan que las esquinas recortadas dejen el visor sin activar en ciertos motores. OrbitControls permite arrastre y zoom con rueda/pellizco, con desplazamiento desactivado y límites de zoom/inclinación. Los botones permiten giro/pausa, perfil y reinicio; el canvas acepta flechas y +/−. Hay un único visor activo por página. El controlador anterior se libera al abrir otro: geometrías, materiales, texturas, controles, eventos, observadores, renderizador y contexto gráfico.

El giro se pausa fuera de pantalla y con la pestaña oculta. Con movimiento reducido se desactiva el giro automático y la amortiguación, y el botón de giro queda deshabilitado. Pausado, el visor vuelve a dibujar por interacción y deja de solicitar cuadros cuando termina la amortiguación. La resolución se limita a 1,5 veces el tamaño visible. Los bocetos, materiales y etiquetas no agregan estadísticas ni unidades reales.

## Validación

Las pruebas comprueban que los 24 estudios correspondan a las armas disponibles, que sus geometrías sean finitas y distintas, y que los 48 SVG puedan rasterizarse. Se cubren carga diferida, controles, liberación, fallo de carga, respaldo y movimiento reducido. Las pruebas anteriores se ajustaron para la presentación nueva y siguen verificando los datos originales. Los nombres de transición de tarjeta/ficha se conservan.

La revisión de navegador verifica las 24 fichas, controles de perfil/giro/reinicio, tamaños de celular/escritorio y consola. Una página temporal aislada fuerza ausencia de WebGL y movimiento reducido, sin modificar preferencias del sistema; se retira antes del build. La comparación visual de las 24 piezas y capturas se guarda fuera del repositorio, en Arc/work/weapons3d/revision.

Referencias de biblioteca: [OrbitControls](https://threejs.org/docs/#OrbitControls) y [administración de recursos](https://threejs.org/manual/en/cleanup.html). Estas referencias solo orientan el código del visor; los diseños son originales.
