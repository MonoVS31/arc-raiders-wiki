import { catalog } from './catalog';
import type { Category, Claim } from './schema';
function numeric(value: Claim['value'], field: string) {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) return value;
  if (typeof value === 'string' && /^\d+(?:\.\d+)?$/.test(value)) return Number(value);
  if (
    typeof value === 'string' &&
    field === 'Headshot Multiplier' &&
    /^\d+(?:\.\d+)?x$/.test(value)
  )
    return Number(value.slice(0, -1));
  if (typeof value === 'string' && field === 'Durability' && /^\d+(?:\.\d+)? shots$/.test(value))
    return Number(value.slice(0, -6));
  return null;
}
function series(claim: Claim): number[] | null {
  if (!['Magazine Size', 'Durability'].includes(claim.field) || typeof claim.value !== 'string')
    return null;
  const parts = claim.value.split(' | ');
  if (parts.length !== 4) return null;
  const values = parts.map((value) => numeric(value, claim.field));
  return values.every((value): value is number => value !== null) ? values : null;
}
const categories = new Map(catalog.entities.map((entity) => [entity.id, entity.category]));
const key = (field: string, unit: string | null, category: Category) =>
  JSON.stringify([field, unit, category]);
const maxima = new Map<string, number>();
for (const claim of catalog.claims) {
  const values = series(claim) ?? [numeric(claim.value, claim.field)];
  const category = categories.get(claim.subjectId);
  if (category) {
    const id = key(claim.field, claim.unit, category);
    for (const value of values)
      if (value !== null) maxima.set(id, Math.max(maxima.get(id) ?? 0, value));
  }
}
export function numericBarScale(claim: Claim, category: Category): number | null {
  const value = numeric(claim.value, claim.field);
  if (value === null) return null;
  const max = maxima.get(key(claim.field, claim.unit, category)) ?? value;
  return max > 0 ? Math.min(1, value / max) : 0;
}
export function numericBarSeries(claim: Claim, category: Category): number[] | null {
  const values = series(claim);
  if (!values) return null;
  const max = maxima.get(key(claim.field, claim.unit, category)) ?? Math.max(...values);
  return values.map((value) => (max > 0 ? Math.min(1, value / max) : 0));
}
