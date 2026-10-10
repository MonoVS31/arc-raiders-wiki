# Fase 28 · Robots ARC en 3D con puntos débiles

## Qué cambió

- **Nuevo visor `robots-3d.html`** con el mismo estilo que las armas y los arrojadizos: 27 diseños
  originales (no son copias de los modelos del juego). Incluye las 25 máquinas ARC del catálogo, más la
  Sonda y el Evaluador, que son contenedores y no tienen ficha propia.
- **Puntos débiles marcados:** los puntos rojos señalan cada punto débil y al tocarlos se resalta la pieza
  y aparece qué pasa al romperla. Los puntos verdes son datos: ataque, sensores, escudos.
- **Código de colores de los bocetos:** amarillo mate para los puntos débiles, gris oscuro brillante para
  el blindaje pesado, blanco mate para la chapa común y rojo o naranja encendido para los núcleos.
- **«Abrir blindaje»** separa las placas y muestra lo que tapan: el núcleo del Fireball, del Topógrafo o
  del Cometa, la placa trasera del Bastión, el panel inferior del Vaporizador, la cara de la Matriarca.
- **«Escala humana»** pone una figura de 1,8 m al lado del robot para comparar tamaños.
- **Fichas ARC:** muestran el visor en lugar del retrato del juego. El explorador de zonas sigue
  funcionando con los esquemas y las opciones, sin la foto. La portada y la galería usan las
  miniaturas de `public/robot-sketches`.

## Datos

No cambió ningún dato del catálogo ni sus niveles de evidencia. Los puntos débiles, la vida y los ataques
que muestra el visor salen de arcraiders.wiki (octubre de 2026) y cada robot enlaza su fuente. Bully,
Skulker, Hydra y la Fragata llegaron con Frozen Trail el 8 de octubre: el visor los marca como datos
preliminares. Los tamaños son estimados para el boceto.

## Mantenimiento

Las miniaturas se regeneran con `scripts/build-viewer-sketches.mjs`, igual que las de armas y
arrojadizos.
