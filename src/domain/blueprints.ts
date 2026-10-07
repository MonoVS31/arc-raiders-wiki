import { catalog, sourceById } from './catalog';
import { acquisitionData } from './acquisition-schema';
export const blueprintRoutes = acquisitionData.routes;
for (const route of blueprintRoutes) {
  if (
    !catalog.entities.some(
      (entity) => entity.id === route.blueprintId && entity.category === 'blueprint',
    )
  )
    throw new Error('Plano inexistente');
  if (route.sourceIds.some((id) => !sourceById.has(id))) throw new Error('Ruta sin fuente');
}
export type { BlueprintRoute } from './acquisition-schema';
export const routeForBlueprint = (id: string) =>
  blueprintRoutes.find((route) => route.blueprintId === id);
