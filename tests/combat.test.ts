// @vitest-environment jsdom
import { expect, it } from 'vitest';
import { grenadeGeometry, weaponTiers, withinReportedRadius } from '../src/domain/combat';
import portraits from '../public/data/atlas/arc-portraits.json';
import { catalog, sourceById } from '../src/domain/catalog';
it('no dibuja radios inciertos o una cadena como círculo', () => {
  expect(grenadeGeometry('grenade-wolfpack')).toBeNull();
  expect(grenadeGeometry('grenade-trailblazer')).toBeNull();
  expect(grenadeGeometry('desconocido')).toBeNull();
});
it('distingue búsqueda de explosión', () => {
  expect(grenadeGeometry('grenade-seeker-grenade')).toMatchObject({ radius: 20, kind: 'búsqueda' });
  expect(grenadeGeometry('grenade-heavy-fuze-grenade')).toMatchObject({
    radius: 7.5,
    kind: 'efecto',
  });
});
it('no inventa niveles y conserva los niveles publicados', () => {
  expect(weaponTiers('weapon-kettle')).toEqual(['I', 'II', 'III', 'IV']);
  expect(weaponTiers('desconocido')).toEqual([]);
  expect(weaponTiers('weapon-aphelion')).toEqual(['Único']);
  expect(weaponTiers('weapon-jupiter')).toEqual(['Único']);
  expect(weaponTiers('weapon-equalizer')).toEqual(['Único']);
});
it('las referencias visuales tienen fuente y excluyen anuncios', () => {
  const available = catalog.entities.filter(
    (entity) => entity.category === 'arc' && entity.availability === 'disponible',
  );
  expect(portraits.portraits).toHaveLength(available.length);
  expect(sourceById.has(portraits.sourceId)).toBe(true);
  expect(new Set(portraits.portraits.map((p) => p.entityId)).size).toBe(available.length);
  for (const portrait of portraits.portraits) {
    expect(available.some((entity) => entity.id === portrait.entityId)).toBe(true);
    expect(new URL(portrait.imageUrl).protocol).toBe('https:');
    expect(['static.metaforge.app', 'unhbvkszwhczbjxgetgk.supabase.co']).toContain(
      new URL(portrait.imageUrl).hostname,
    );
  }
});
it('la frontera geométrica admite el borde y rechaza distancias inválidas', () => {
  expect(withinReportedRadius(7.5, 7.5)).toBe(true);
  expect(withinReportedRadius(7.6, 7.5)).toBe(false);
  expect(withinReportedRadius(-1, 7.5)).toBe(false);
  expect(withinReportedRadius(NaN, 7.5)).toBe(false);
});
