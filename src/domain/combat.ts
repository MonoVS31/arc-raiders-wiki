import { catalog } from './catalog';
import type { Claim } from './schema';

export const combatClaim = (id: string, field: string): Claim | undefined => catalog.claims.find(c => c.subjectId === id && c.field === field);
export function weaponTiers(id: string): string[] {
  const value = combatClaim(id, 'niveles')?.value;
  if (typeof value !== 'string') return [];
  if (value.includes('Sin mejoras')) return ['Único'];
  return value.split(' · ').filter(tier => /^(I|II|III|IV)$/.test(tier));
}
export function grenadeGeometry(id: string): { claim: Claim; radius: number; kind: 'búsqueda' | 'efecto' } | null {
  // A trail is not a circular area; the Wolfpack value is explicitly unverified.
  if (id === 'grenade-trailblazer') return null;
  const claim = combatClaim(id, 'Homing Range') ?? combatClaim(id, 'Radius');
  if (!claim || !['confirmado', 'probable'].includes(claim.confidence) || claim.unit !== 'm') return null;
  const radius = Number(claim.value);
  if (!Number.isFinite(radius) || radius <= 0) return null;
  return { claim, radius, kind: claim.field === 'Homing Range' ? 'búsqueda' : 'efecto' };
}
export const withinReportedRadius = (distance: number, radius: number): boolean => Number.isFinite(distance) && distance >= 0 && radius > 0 && distance <= radius;
