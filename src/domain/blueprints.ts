import { catalog, sourceById } from './catalog';
import { acquisitionData } from './acquisition-schema';
import { mapManifest } from './maps';
export const blueprintRoutes = acquisitionData.routes;
for (const route of blueprintRoutes) {
  if (
    !catalog.entities.some(
      (entity) => entity.id === route.blueprintId && entity.category === 'blueprint',
    )
  )
    throw new Error('Plano inexistente');
  if (route.sourceIds.some((id) => !sourceById.has(id))) throw new Error('Ruta sin fuente');
  for (const trace of route.traces ?? []) {
    if (trace.sourceIds.some((id) => !sourceById.has(id))) throw new Error('Trazo sin fuente');
    const map = mapManifest.maps.find((map) => map.slug === trace.mapSlug);
    if (!map?.floors.some((floor) => floor.id === trace.floorId))
      throw new Error('Piso del trazo inexistente');
  }
}
export type { BlueprintRoute } from './acquisition-schema';
export const routeForBlueprint = (id: string) =>
  blueprintRoutes.find((route) => route.blueprintId === id);
