import type { Entity } from './schema';
export function requestedEntity(search: string, entities: Entity[]): Entity | undefined {
  const id = new URLSearchParams(search).get('entity');
  return entities.find((entity) => entity.id === id);
}
export function entityLink(
  base: string,
  entityId: string,
  blueprintId?: string,
  arcId?: string,
): string {
  const url = new URL(base);
  url.search = '';
  url.searchParams.set('entity', entityId);
  if (blueprintId) url.searchParams.set('blueprint', blueprintId);
  if (arcId && !blueprintId) url.searchParams.set('arc', arcId);
  url.hash = 'catalog';
  return url.toString();
}
