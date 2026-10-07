import { expect, it } from 'vitest';
import { grenadeGeometry, weaponTiers, withinReportedRadius } from '../src/domain/combat';
it('no dibuja radios inciertos o una cadena como círculo', () => {
  expect(grenadeGeometry('grenade-wolfpack')).toBeNull();
  expect(grenadeGeometry('grenade-trailblazer')).toBeNull();
  expect(grenadeGeometry('desconocido')).toBeNull();
});
it('distingue búsqueda de explosión', () => {
  expect(grenadeGeometry('grenade-seeker-grenade')).toMatchObject({ radius: 20, kind: 'búsqueda' });
  expect(grenadeGeometry('grenade-heavy-fuze-grenade')).toMatchObject({ radius: 7.5, kind: 'efecto' });
});
it('no inventa niveles y conserva los niveles publicados', () => {
  expect(weaponTiers('weapon-kettle')).toEqual(['I','II','III','IV']);
  expect(weaponTiers('desconocido')).toEqual([]);
});
it('la frontera geométrica admite el borde y rechaza distancias inválidas', () => {
  expect(withinReportedRadius(7.5, 7.5)).toBe(true);
  expect(withinReportedRadius(7.6, 7.5)).toBe(false);
  expect(withinReportedRadius(-1, 7.5)).toBe(false);
  expect(withinReportedRadius(NaN, 7.5)).toBe(false);
});
