# Mapas interactivos de ARC Atlas

La sección `?category=map` abre el visor de los seis mapas disponibles. Los enlaces `?mapa=dam`, `?mapa=spaceport`, `?mapa=buried-city`, `?mapa=blue-gate`, `?mapa=stella-montis` y `?mapa=riven-tides` seleccionan directamente un mapa. Se conservan las fichas y los enlaces antiguos con entity, arc y blueprint. No se cambió la base relativa de Vite.

## Datos y procedencia

Se trasladan los 1.981 reportes ya guardados en la wiki al formato `public/data/mapas/<slug>.json`. Los archivos originales de `public/data/maps` y el manifiesto no se modifican. Cada registro conserva el identificador, la posición y una referencia completa al reporte original, incluidos evidencia, pisos, eventos, puerta cerrada y fecha. x equivale a lng; y equivale a lat, con la calibración original. No se descargaron marcadores, dibujos ni textos de MapGenie u otros sitios.

| Mapa | Reportes únicos |
|---|---:|
| Dam Battlegrounds | 464 |
| Buried City | 389 |
| Spaceport | 382 |
| The Blue Gate | 368 |
| Stella Montis | 219 |
| Riven Tides | 159 |

Stella Montis y Riven Tides tienen la cobertura más reducida. El archivo incluye cajas de armas, ARC, caches y algunos objetivos de misión. Las otras categorías están disponibles en el editor, pero no aparecen como filtros hasta tener datos. No hay zonas de botín, tirolesas, nombres de región, extracciones ni servicios públicos con geometría verificada: sus listas iniciales permanecen vacías.

Spaceport y The Blue Gate conservan Superficie y Subterráneo; Stella Montis conserva los dos pisos que ya tenía. Los reportes originales que aplican a más de un piso retienen esa pertenencia sin duplicar el identificador ni el progreso. Los marcadores personales pertenecen al piso seleccionado.

## Interfaz y funcionamiento

Leaflet local continúa con CRS.Simple y la transformación calibrada existente, los mismos tiles y límites de cartografía. Hay rueda, pellizco, teclado, botones de zoom en español abajo a la derecha, selector de mapa y capa, filtros en dos columnas, grupos, búsqueda y una lista alternativa de botones para recorrer reportes con teclado. Los filtros solo muestran categorías con datos; sus contadores corresponden al mapa completo. Los pines y los SVG son propios. Los nombres de lugar se dibujan como texto y se ocultan si chocan. Los polígonos y líneas del editor se distinguen como borradores sin verificar.

El panel Progreso recuerda encontrados, categorías ocultas, notas personales y borradores por mapa en localStorage, con lectura validada y acceso protegido por try/catch. Si el almacenamiento falla se avisa y sigue disponible la exportación. El reinicio pide confirmación dentro de la página y conserva notas y borradores. La restauración del borrador también pide confirmación. El enlace `?mapa=<slug>&marcador=<id>` centra el punto y abre su ficha; `&categorias=a,b` aplica filtros iniciales. Un marcador seleccionado sigue visible para poder reconocer el destino del enlace, incluso si se ocultaron encontrados.

En celular, Filtros permanece como botón flotante y abre un cajón inferior desplazable. El progreso pasa debajo del mapa y puede plegarse. Los formularios tienen foco de teclado, Escape y circulación del foco; las descripciones se muestran como texto con negrita/listas, sin inyectar HTML. Se respetan las preferencias de movimiento reducido.

## Editor

`?mapa=<slug>&editor=1` activa un editor personal también en producción. Permite agregar, editar, mover y borrar marcadores; agregar etiquetas; trazar zonas altas/medias/bajas y tirolesas; copiar datos, descargar JSON e importar un JSON del mismo mapa. La importación valida formato, categorías y capas, y lo marca como borrador sin verificar. Ninguna de estas operaciones escribe en GitHub ni modifica datos de otras personas. Las notas quedan fuera del JSON público y solo en el navegador.

## Validación

Las pruebas verifican que los seis JSON preserven todos los reportes originales y sus pisos. Se cubren carga, enlaces, filtros, progreso, reinicio, edición y almacenamiento bloqueado/corrupto. El visor conserva una sola capa Canvas; las siluetas con sus sombras se rasterizan una sola vez por categoría y se reutilizan. Una prueba personal de 550 puntos en Dam quedó alrededor de 1,1 ms por repintado después de un zoom; no es una garantía de FPS en todos los dispositivos. El archivo sintético se guardó fuera del repo, no se publica y el borrador se restauró después de probarlo.

La revisión de navegador incluye los seis mapas, sus capas existentes, búsqueda, enlace directo, progreso conservado al recargar y creación/movimiento de un punto, zona de tres vértices y línea de dos vértices a 375 px. Se comprueba que no haya desplazamiento horizontal y se conservan capturas fuera del repo.
