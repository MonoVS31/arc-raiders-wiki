# Revisión adicional y publicación de diagramas

El usuario aprobó la fase 6 el 8 de octubre de 2026 y autorizó revisar capturas, volver a inspeccionar piezas pendientes, integrar feat/diagramas a main y publicar mediante GitHub Actions. Esta autorización reemplaza la pausa entre fases para este cierre.

## Capturas revisadas

Se levantaron las vistas locales de desarrollo y producción. Se guardaron capturas de cabecera y detalle a 1366 y 375 px de estas once páginas:

- Portada, incluidos hero y bento.
- Firefly, Leaper y Vaporizer.
- Rattler, Arpeggio y Canto.
- Heavy Fuze Grenade y Wolfpack.
- Dam Battlegrounds y Buried City.

Las capturas están en Arc/work/diagramas-publicacion, fuera del repositorio. Se revisaron las imágenes, no solo los tamaños del DOM. Se tomaron capturas adicionales de los diagramas y se esperó a la carga de tiles y a la finalización de entradas para no interpretar estados transitorios como errores de contenido. No se observó scroll horizontal; el panel pasa debajo de la imagen en celular. Las granadas mantienen el radio existente o el aviso de que no hay uno verificado. Ambos mapas cargan sus tiles y conservan controles, coordenadas, filtros y avisos de reportes posibles.

Se corrigieron dos problemas: el salto dentro de Articulaciones y la proximidad de dos controles de Leaper en celular. Las etiquetas disponen de hasta el 48% del ancho, limitado por su distancia a los bordes; las de articulaciones se ubican donde entra la palabra completa. Para Leaper se eligió una placa inequívoca de la pata izquierda, separada de la articulación de la derecha. Se comprobó a 375 px que sus tres botones de 44 px no se superponen y que las etiquetas quedan dentro de la imagen. Las posiciones son editoriales, no límites de impacto.

## Segunda inspección de pendientes

Se revisaron las imágenes locales de los 21 ARC disponibles y las 24 armas con imagen mediante hojas de contacto y vistas ampliadas de candidatos. Los anunciados sin imagen o anatomía no se completaron. Se añadieron únicamente estas referencias existentes:

| Ficha | Pieza visible | Referencia original |
|---|---|---|
| Vaporizer | Abertura azul bajo el cilindro del propulsor superior derecho | arc-zones: thrusters |
| Arpeggio | Cargador rectangular delante del guardamonte | claim: Magazine Size |
| Canto | Cargador grande delante de la empuñadura | claim: Magazine Size |
| Leaper | Articulación descubierta de la pata derecha | arc-zones: joints |
| Leaper | Placa visible de la pata izquierda | arc-zones: plates |

No se señalaron el núcleo cerrado ni un escudo inactivo como expuestos. Snitch y Spotter siguen sin una identificación visual suficiente de sus propulsores; los otros candidatos dudosos conservan su presentación. Los claims de las 16 granadas siguen sin relación explícita con una pieza visible, por lo que no se crean puntos sobre ellas.

Resultado: diez fichas con doce puntos sobre imagen; 57 fichas pendientes de ancla (19 ARC, 22 armas y 16 granadas). Las zonas sin ancla dentro de un ARC con foto siguen disponibles en sus opciones. Los 83 planos siguen sin recorridos ordenados respaldados; no se añadieron geometrías, nombres de región, extracciones ni medidas.

## Validación y entrega

Lint, typecheck, 142 pruebas, validación de datos y build en verde después de las correcciones; 381 imágenes con hashes verificados y 167 fichas prerenderizadas. El catálogo, notas, evidencia, fuentes y disponibilidad conservan sus hashes y semántica. Solo cambia el registro editorial de posiciones y el espacio de las etiquetas. No se agregan dependencias ni animaciones; permanecen la pausa por visibilidad, prefers-reduced-motion y la base relativa de Vite.

La integración conserva los commits separados de las seis fases y suma un commit de esta revisión adicional. El workflow Publish ARC Atlas vuelve a ejecutar sus verificaciones antes de entregar dist a Pages. La finalización del despliegue se comprueba en GitHub Actions y se revisan las fichas públicas desde el navegador antes de comunicar el resultado.
