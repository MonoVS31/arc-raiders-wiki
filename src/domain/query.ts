import type { Availability, Catalog, Category, Confidence, Entity } from './schema';

export interface Filters {
  category: Category | 'all';
  query: string;
  availability: Availability | 'all';
  confidence: Confidence | 'all';
}
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export function findEntities(catalog: Catalog, filters: Filters): Entity[] {
  const text = normalize(filters.query.trim());
  return catalog.entities.filter(entity =>
    (filters.category === 'all' || entity.category === filters.category) &&
    (filters.availability === 'all' || entity.availability === filters.availability) &&
    (!text || normalize(entity.name).includes(text)) &&
    (filters.confidence === 'all' || catalog.claims.some(claim => claim.subjectId === entity.id && claim.confidence === filters.confidence)),
  );
}
export function claimsFor(catalog: Catalog, entityId: string) {
  return catalog.claims.filter(claim => claim.subjectId === entityId);
}
