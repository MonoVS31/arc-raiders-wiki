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

Leaflet, el visor y las cachés de mapas se cargan por demanda. El paquete inicial conserva una advertencia de tamaño, aproximadamente 637 kB minificado y 135 kB gzip. Quedan por corroborar individualmente 72 rutas del índice y completar cuatro rutas. No se verificaron todas las ubicaciones dentro del juego, no hay curva de daño revisada ni diagramas anatómicos de ARC. La web aún no está desplegada en una URL pública.

## Publicación

Repositorio: https://github.com/MonoVS31/arc-raiders-wiki. La fase de mapas y rutas se prepara en una rama con propuesta de cambios y comprobaciones de CI. Este documento describe las verificaciones realizadas; no declara terminada la wiki completa.

## Configuración

El proyecto no necesita secretos para consultar el catálogo. Solo se versiona .env.example con una etiqueta pública; las variables VITE_* son visibles en el navegador. La integración de datos incluye atribución y enlace a MetaForge, y exige revisar sus condiciones antes de monetizar un producto.
