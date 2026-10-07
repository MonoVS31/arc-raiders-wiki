import { catalog } from './catalog';
import type { Claim } from './schema';

export const combatClaim = (id: string, field: string): Claim | undefined =>
  catalog.claims.find((c) => c.subjectId === id && c.field === field);
export function weaponTiers(id: string): string[] {
  const value = combatClaim(id, 'niveles')?.value;
  if (typeof value !== 'string') return [];
  if (value.includes('Sin mejoras')) return ['Único'];
  return value.split(' · ').filter((tier) => /^(I|II|III|IV)$/.test(tier));
}
export function weaponTierMetric(id: string, field: string, tier: string): Claim | undefined {
  const claim = combatClaim(id, field);
  if (!claim || typeof claim.value !== 'string' || !['Magazine Size', 'Durability'].includes(field))
    return claim;
  const tiers = weaponTiers(id),
    index = tiers.indexOf(tier),
    parts = claim.value.split(' | ');
  if (tiers.length !== 4 || parts.length !== 4 || index < 0) return claim;
  const suffix = parts[3]?.match(/\s+(shots)$/)?.[0] ?? '';
  if (!parts.every((part) => /^\d+(?:\.\d+)?(?: shots)?$/.test(part))) return claim;
  const value = parts[index]!;
  return {
    ...claim,
    value: value.endsWith(suffix) ? value : value + suffix,
    note: `Valor del nivel ${tier}, tomado de la serie I–IV publicada. ${claim.note}`.trim(),
  };
}
export function grenadeGeometry(
  id: string,
): { claim: Claim; radius: number; kind: 'búsqueda' | 'efecto' } | null {
  // A trail is not a circular area; the Wolfpack value is explicitly unverified.
  if (id === 'grenade-trailblazer') return null;
  const claim = combatClaim(id, 'Homing Range') ?? combatClaim(id, 'Radius');
  if (!claim || !['confirmado', 'probable'].includes(claim.confidence) || claim.unit !== 'm')
    return null;
  const radius = Number(claim.value);
  if (!Number.isFinite(radius) || radius <= 0) return null;
  return { claim, radius, kind: claim.field === 'Homing Range' ? 'búsqueda' : 'efecto' };
}
export const withinReportedRadius = (distance: number, radius: number): boolean =>
  Number.isFinite(distance) && distance >= 0 && radius > 0 && distance <= radius;
