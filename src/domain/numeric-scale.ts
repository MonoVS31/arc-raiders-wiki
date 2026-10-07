import { catalog } from './catalog';
import type { Category, Claim } from './schema';
function numeric(value: Claim['value']) {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) return value;
  if (typeof value === 'string' && /^\d+(?:\.\d+)?$/.test(value)) return Number(value);
  return null;
}
const categories = new Map(catalog.entities.map((entity) => [entity.id, entity.category]));
const key = (field: string, unit: string | null, category: Category) =>
  JSON.stringify([field, unit, category]);
const maxima = new Map<string, number>();
for (const claim of catalog.claims) {
  const value = numeric(claim.value);
  const category = categories.get(claim.subjectId);
  if (value !== null && category) {
    const id = key(claim.field, claim.unit, category);
    maxima.set(id, Math.max(maxima.get(id) ?? 0, value));
  }
}
export function numericBarScale(claim: Claim, category: Category): number | null {
  const value = numeric(claim.value);
  if (value === null) return null;
  const max = maxima.get(key(claim.field, claim.unit, category)) ?? value;
  return max > 0 ? Math.min(1, value / max) : 0;
}
