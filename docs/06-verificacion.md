# Verificación y límites

Corte: 6 de octubre de 2026.

## Base 0.1

La base inicial aprobó TypeScript estricto, 13 pruebas y compilación Vite. La [ejecución pública de CI](https://github.com/MonoVS31/arc-raiders-wiki/actions/runs/37518686760) aprobó instalación, tipos, tests y build.

## Versión 0.2: mapas y rutas

- 24 pruebas aprobadas en tres archivos.
- TypeScript estricto, con noUncheckedIndexedAccess y exactOptionalPropertyTypes: sin errores.
- Compilación Vite: correcta.
- Calibración: los dos anclajes de cada mapa y la escala de zoom coinciden con la configuración del proveedor.
- Caché de seis mapas: identificadores únicos, tipos y máscaras válidos, conteos y SHA-256 comprobados.
- Rutas: 83 registros, 7 corroborados específicamente y 4 incompletos; los otros conservan la clasificación posible.
- Revisión en navegador: 48 reportes de cajas de Dam; selección y enlace a la fuente; Stella Montis con 20 cajas en el piso superior y 7 en el inferior; navegación de Hullcracker a un objetivo de misión en Dam.

## Alcance de los datos

Las 1.981 ubicaciones son reportes de una fuente comunitaria, incluidos 201 reportes de cajas; no constituyen un total oficial ni garantizan aparición por partida. Los objetivos de misión no son ubicaciones de aparición del plano. Las coordenadas son unidades del proveedor, con calibración revisada, y no metros para calcular daño de granadas.

## Rendimiento y pendientes

Leaflet, el visor y las cachés de mapas se cargan por demanda. La versión 0.4 conserva una advertencia de tamaño, aproximadamente 647 kB minificado y 137 kB gzip. Quedan por corroborar individualmente 72 rutas del índice y completar cuatro rutas. No se verificaron todas las ubicaciones dentro del juego, no hay curva de daño revisada ni diagramas anatómicos de ARC.

## Versión 0.4: combate, referencias visuales y publicación

- 29 pruebas aprobadas; TypeScript estricto y compilación correctos.
- Comparación de estadísticas declaradas, niveles y mejoras separadas; legendarias sin niveles inventados.
- Radios de búsqueda y efecto separados, con exclusión de Wolfpack y Trailblazer del diagrama circular.
- 21 referencias visuales ARC con identidad probable, procedencia y atribución; sin hitboxes ficticios.
- Publicación en [ARC Atlas](https://monovs31.github.io/arc-raiders-wiki/) mediante [GitHub Actions](https://github.com/MonoVS31/arc-raiders-wiki/actions/runs/37573209902).
- Revisión de producción: el visor de Dam carga sus 48 reportes de cajas desde la subcarpeta pública; el retrato de Snitch carga y el selector de blindaje conserva evidencia y su límite cualitativo.
- Capturas y guía PDF de 32 páginas guardadas con los respaldos locales. Se verificaron las 32 páginas renderizadas y los límites de texto del PDF.

## Publicación

Repositorio: https://github.com/MonoVS31/arc-raiders-wiki. Las propuestas #1, #2 y #3 integraron mapas, combate y publicación tras CI. Este documento describe las verificaciones realizadas; no declara terminada la wiki completa.

## Edición 1.0 para revisión

43 pruebas, TypeScript estricto y compilación local correctos. Se verificaron 112 revisiones de objetos e índice/ARC; se capturaron los nueve proyectos. La navegación de Hornet a Dam conserva el foco y muestra sus seis reportes. La selección de piezas cambia la explicación de protección; las etapas de Trophy Display distinguen Bobcat IV de Bobcat Blueprint y enlazan el plano correspondiente.

Los conteos de mapas por ARC coinciden con los archivos públicos de caché. Los datos de etapas, recompensas y zonas tienen fuentes verificables y estados de disponibilidad separados. Se corrigió una interpretación optimista de Aphelion y se conservaron conflictos de fechas. El paquete inicial ronda 780 kB minificado y 150 kB gzip; visor, Leaflet, etapas y zonas se cargan por demanda. Ver `10-edicion-para-revision.md` para alcance y límites.

## Configuración

El proyecto no necesita secretos para consultar el catálogo. Solo se versiona .env.example con una etiqueta pública; las variables VITE_* son visibles en el navegador. La integración de datos incluye atribución y enlace a MetaForge, y exige revisar sus condiciones antes de monetizar un producto.
