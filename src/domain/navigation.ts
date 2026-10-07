import type { Entity } from './schema';
export function requestedEntity(
  search: string,
  entities: Entity[],
  pathname = '',
): Entity | undefined {
  const params = new URLSearchParams(search);
  const route = pathname.match(/\/fichas\/([a-z0-9-]+)\/(?:index\.html)?$/);
  const id = params.has('entity') ? params.get('entity') : route?.[1];
  return entities.find((entity) => entity.id === id);
}
export function atlasRoot(base: string): URL {
  const url = new URL(base);
  const route = url.pathname.match(/^(.*\/)fichas\/[a-z0-9-]+\/(?:index\.html)?$/);
  if (route) url.pathname = route[1]!;
  else if (url.pathname.endsWith('/index.html')) url.pathname = url.pathname.slice(0, -10);
  url.search = '';
  url.hash = '';
  return url;
}
export function entityShareLink(
  base: string,
  entityId: string,
  blueprintId?: string,
  arcId?: string,
): string {
  if (!/^[a-z0-9-]+$/.test(entityId)) throw new Error('Identificador de ficha inválido');
  const url = atlasRoot(base);
  url.pathname += `fichas/${entityId}/`;
  if (blueprintId) url.searchParams.set('blueprint', blueprintId);
  if (arcId && !blueprintId) url.searchParams.set('arc', arcId);
  url.hash = 'catalog';
  return url.toString();
}
export function entityLink(
  base: string,
  entityId: string,
  blueprintId?: string,
  arcId?: string,
): string {
  const url = atlasRoot(base);
  url.search = '';
  url.searchParams.set('entity', entityId);
  if (blueprintId) url.searchParams.set('blueprint', blueprintId);
  if (arcId && !blueprintId) url.searchParams.set('arc', arcId);
  url.hash = 'catalog';
  return url.toString();
}
