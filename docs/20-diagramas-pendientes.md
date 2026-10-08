# Posiciones de diagramas ARC · fase 2

Las posiciones son anclas editoriales en porcentajes de la imagen original, no geometría ni coordenadas de impacto del juego. Cada referencia lee label, kind, confidence, condition, description y fuentes de `arc-zones.json`. No se cambió la evidencia de ningún dato.

## Con puntos sobre retrato

| Ficha | Referencia existente | Criterio visual | Piezas sin ancla en este retrato |
|---|---|---|---|
| Wasp | thrusters | Un propulsor visible a la izquierda de la imagen; se reconoce su abertura circular | La etiqueta original describe el grupo de cuatro; el punto no afirma que todos sean visibles. La ausencia general de blindaje no identifica una pieza adicional |
| Firefly | tank | Depósito amarillo visible bajo el cuerpo | Se conserva la condición Lanzallamas extendido. No se afirma exposición permanente ni se anclan los cuatro propulsores a una placa supuesta |
| Fireball | shell | Superficie de la carcasa cerrada claramente visible | Núcleo oculto; sigue disponible por opción y con la condición Panel frontal abierto, sin punto sobre la foto |
| Bombardier | joints | Articulación amarilla visible en la unión superior de una pata | Cilindro trasero oculto; el blindaje ligero es una categoría general, sin placa calibrada |
| Leaper | eye | Ojo circular frontal visible | Articulaciones y placas requieren ubicar con mayor precisión la pieza y su protección; no se transforma el blindaje pesado general en una zona |

Imágenes: las mismas entradas de arc-portraits.json, con resolución al snapshot local y atribución existente. No se descargó ni editó ninguna imagen. Los puntos no delinean superficies, rangos ni medidas.

## Sin puntos sobre retrato

| Ficha | Motivo | Presentación conservada |
|---|---|---|
| Snitch | El ARC es demasiado pequeño en el retrato para calibrar un propulsor inequívoco | drone-four |
| Hornet | El ángulo inferior permite ver motores, pero no identifica inequívocamente el par delantero frente al trasero con estas referencias | drone-four |
| Tick | La zona débil está explícitamente sin especificar. Sin blindaje es un dato general | components |
| Pop | La zona débil está explícitamente sin especificar. Sin blindaje es un dato general | components |
| Turret | No hay zona débil específica en los datos | components |
| Sentinel | La cápsula amarilla trasera no se identifica en el ángulo del retrato revisado | components |
| Surveyor | La foto muestra transmisión, pero la apertura y el núcleo no tienen una ancla inequívoca a esta escala; no se marca una carcasa cerrada en ese estado | shell-core |
| Shredder | No se distinguen chorros azules en el retrato revisado. Blindaje pesado es general | components |
| Comet | La carcasa está cerrada: el punto débil depende de su abertura durante la carga | shell-core |
| Spotter | Pendiente de una revisión positiva y calibración del propulsor sobre su imagen | components |
| Bastion | Piezas inferiores y cilindro trasero no tienen una ubicación inequívoca en la foto revisada | components |
| Rocketeer | Las referencias exigen vista desde arriba o retirar una placa; pendiente de una imagen con esa condición verificable | components |
| Vaporizer | El núcleo exige retirar el panel inferior; falta calibrar propulsores y escudo activo sobre una imagen adecuada | components |
| ARC Turbine | Los depósitos requieren aterrizaje y tren desplegado; falta una imagen y calibración positiva de esa condición | components |
| Queen | La propia descripción del núcleo indica ausencia de posición calibrada; articulaciones pendientes de revisión positiva | components |
| Matriarch | El núcleo exige retirar placas faciales; falta una imagen inequívoca de esa condición y del escudo | components |
| Frigate | Anunciado; no se agregan retrato ni anatomía por suposición | Sin zonas existentes |
| Bully | Anunciado; no se agregan retrato ni anatomía por suposición | Sin zonas existentes |
| Skulker | Anunciado; no se agregan retrato ni anatomía por suposición | Sin zonas existentes |
| Hydra | Anunciado; no se agregan retrato ni anatomía por suposición | Sin zonas existentes |

El layout `components` ya era una lista de piezas; se mantiene como lista dentro del marco, sin inventar un SVG anatómico. Los demás esquemas conservan trazados y posiciones orientativas. Todos mantienen opciones, condiciones, fuentes, tablas no corroboradas y reportes posibles.

Una selección de zona sin ancla apaga la selección de los puntos de foto y muestra el dato original en el panel. No desplaza el punto existente a otra pieza. Los cuatro tipos se distinguen por texto y tokens: débil, protección, sin blindaje y sin dato específico.
