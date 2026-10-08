# Posiciones y recorridos pendientes · cierre de fase 6

Las posiciones son anclas editoriales en porcentajes de la imagen original, no geometría ni coordenadas de impacto del juego. Cada referencia lee label, kind, confidence, condition, description y fuentes de `arc-zones.json`. No se cambió la evidencia de ningún dato.

## Con puntos sobre retrato

| Ficha | Referencia existente | Criterio visual | Piezas sin ancla en este retrato |
|---|---|---|---|
| Wasp | thrusters | Un propulsor visible a la izquierda de la imagen; se reconoce su abertura circular | La etiqueta original describe el grupo de cuatro; el punto no afirma que todos sean visibles. La ausencia general de blindaje no identifica una pieza adicional |
| Firefly | tank | Depósito amarillo visible bajo el cuerpo | Se conserva la condición Lanzallamas extendido. No se afirma exposición permanente ni se anclan los cuatro propulsores a una placa supuesta |
| Fireball | shell | Superficie de la carcasa cerrada claramente visible | Núcleo oculto; sigue disponible por opción y con la condición Panel frontal abierto, sin punto sobre la foto |
| Bombardier | joints | Articulación amarilla visible en la unión superior de una pata | Cilindro trasero oculto; el blindaje ligero es una categoría general, sin placa calibrada |
| Leaper | eye, joints, plates | Ojo frontal, articulación descubierta de la pata derecha y placa visible de la pata izquierda | Los puntos no delimitan todas las placas ni articulaciones; el blindaje pesado general sigue sin ancla |
| Vaporizer | thrusters | Abertura azul del propulsor bajo el cilindro superior derecho | Núcleo inferior oculto y escudo inactivo; no se señalan como expuestos |

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
| ARC Turbine | Los depósitos requieren aterrizaje y tren desplegado; falta una imagen y calibración positiva de esa condición | components |
| Queen | La propia descripción del núcleo indica ausencia de posición calibrada; articulaciones pendientes de revisión positiva | components |
| Matriarch | El núcleo exige retirar placas faciales; falta una imagen inequívoca de esa condición y del escudo | components |
| Frigate | Anunciado; no se agregan retrato ni anatomía por suposición | Sin zonas existentes |
| Bully | Anunciado; no se agregan retrato ni anatomía por suposición | Sin zonas existentes |
| Skulker | Anunciado; no se agregan retrato ni anatomía por suposición | Sin zonas existentes |
| Hydra | Anunciado; no se agregan retrato ni anatomía por suposición | Sin zonas existentes |

El layout `components` ya era una lista de piezas; se mantiene como lista dentro del marco, sin inventar un SVG anatómico. Los demás esquemas conservan trazados y posiciones orientativas. Todos mantienen opciones, condiciones, fuentes, tablas no corroboradas y reportes posibles.

Una selección de zona sin ancla apaga la selección de los puntos de foto y muestra el dato original en el panel. No desplaza el punto existente a otra pieza. Los cuatro tipos se distinguen por texto y tokens: débil, protección, sin blindaje y sin dato específico.

## Armas y granadas · fase 3

| Ficha | Campo | Ancla revisada |
|---|---|---|
| Rattler | Magazine Size | Superficie del cargador semicircular visible debajo del receptor |
| Tempest | Magazine Size | Cargador rectangular visible en la parte inferior trasera |
| Arpeggio | Magazine Size | Cargador rectangular visible delante del guardamonte |
| Canto | Magazine Size | Cargador grande visible delante de la empuñadura |

Kettle: no se pudo identificar inequívocamente un cargador separado en su imagen. Il Toro: la vista no permite separar con certeza el depósito de munición de otras piezas. Ferro: la capacidad de un disparo no justifica señalar un cargador externo que no se ve. Las otras armas siguen pendientes de revisión/calibración, sin puntos agregados por suposición.

Las 16 granadas quedan sin puntos sobre su imagen: los claims actuales no describen una relación pieza visible–campo. Efecto, radio, daño, retardo, duración, búsqueda y aturdimiento siguen en el visor y las estadísticas, con sus marcos nuevos. No se interpreta un pasador como temporizador ni una carcasa como radio de daño.

Se mantienen los cinco diagramas ARC anteriores. Total de fichas con puntos al cerrar la fase 3: siete. Las etiquetas y cifras siempre se leen del dato original.

## Mapas y planos · fase 4

Los seis mapas con snapshot reciben marco, escaneo, pulso de selección y guía al reporte. El mapa anunciado sin cartografía mantiene su mensaje original. No se agregaron marcadores, coordenadas ni nombres.

Los 83 registros de rutas son metadatos de obtención; ninguno tiene geometría ni orden de coordenadas respaldado para dibujar un recorrido. No se enlazan cajas, ARC u objetivos de misión por orden arbitrario. Para cada plano, el recorrido cartográfico continúa como Pendiente de verificar, aunque su método de obtención conserve su evidencia original.

Para cargar un trazo futuro: fuente que respalde el orden, mapa, piso e IDs de reportes existentes. El esquema admite traces, pero el JSON no fue modificado. Para etiquetas de región, MapConfig reserva lat, lng, texto y fuente; regionLabels está vacío por ausencia y no tiene representación nueva en esta fase.


## Inventario completo sin puntos nuevos · fase 6

Los 19 ARC sin ancla están enumerados arriba, junto con sus motivos y esquemas conservados. Las zonas ocultas o no calibradas de los seis ARC con foto también permanecen pendientes; se pueden consultar en las opciones existentes. La segunda revisión mantuvo Snitch y Spotter sin puntos: el tamaño o la apariencia de las aberturas no permiten identificar un propulsor con suficiente seguridad. Los núcleos cerrados o condicionados siguen sin anclas por suposición.

### Armas: 22 fichas

Kettle, Il Toro y Ferro tienen los motivos particulares indicados arriba. Las otras armas disponibles necesitan una revisión positiva de una pieza visible relacionada con un claim existente. Las anunciadas no reciben posiciones por suposición.

| Ficha | ID | Disponibilidad original |
|---|---|---|
| Kettle | weapon-kettle | disponible |
| Bettina | weapon-bettina | disponible |
| Ferro | weapon-ferro | disponible |
| Renegade | weapon-renegade | disponible |
| Aphelion | weapon-aphelion | disponible |
| Stitcher | weapon-stitcher | disponible |
| Bobcat | weapon-bobcat | disponible |
| Il Toro | weapon-il-toro | disponible |
| Vulcano | weapon-vulcano | disponible |
| Dolabra | weapon-dolabra | disponible |
| Hairpin | weapon-hairpin | disponible |
| Burletta | weapon-burletta | disponible |
| Venator | weapon-venator | disponible |
| Anvil | weapon-anvil | disponible |
| Torrente | weapon-torrente | disponible |
| Osprey | weapon-osprey | disponible |
| Jupiter | weapon-jupiter | disponible |
| Rascal | weapon-rascal | disponible |
| Hullcracker | weapon-hullcracker | disponible |
| Equalizer | weapon-equalizer | disponible |
| Stiletto | weapon-stiletto | anunciado |
| Bantam | weapon-bantam | anunciado |

### Granadas: 16 fichas

Todas carecen de una relación pieza visible–campo en los claims actuales. Se conservan valores y advertencias; no se ancla el efecto a una parte del modelo.

| Ficha | ID |
|---|---|
| Light Impact Grenade | grenade-light-impact-grenade |
| Heavy Fuze Grenade | grenade-heavy-fuze-grenade |
| Blaze Grenade | grenade-blaze-grenade |
| Gas Grenade | grenade-gas-grenade |
| Showstopper | grenade-showstopper |
| Snap Blast Grenade | grenade-snap-blast-grenade |
| Seeker Grenade | grenade-seeker-grenade |
| Shrapnel Grenade | grenade-shrapnel-grenade |
| Trigger 'Nade | grenade-trigger-nade |
| Trailblazer | grenade-trailblazer |
| Wolfpack | grenade-wolfpack |
| Lure Grenade | grenade-lure-grenade |
| Li'l Smoke Grenade | grenade-li-l-smoke-grenade |
| Smoke Grenade | grenade-smoke-grenade |
| Tagging Grenade | grenade-tagging-grenade |
| Yank Grenade | grenade-yank-grenade |

### Planos y regiones

Los 83 planos del [registro de rutas](../public/data/atlas/blueprint-routes.json) permanecen pendientes de geometría y orden respaldados por una fuente. El dato de obtención conserva su propia evidencia: esta falta no invalida ni eleva esa evidencia. Ningún mapa tiene etiquetas de región con coordenadas y fuente; el campo opcional sigue vacío por ausencia.
