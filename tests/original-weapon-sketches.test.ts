import { it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { standaloneWeaponCodes, standaloneWeaponSketch } from '../src/domain/standalone-weapons';
it('las 24 tarjetas y fichas usan bocetos del visor nuevo, sin el visor anterior', () => {
  for (const [id, code] of Object.entries(standaloneWeaponCodes)) {
    expect(standaloneWeaponSketch(id)).toContain('weapon-sketches/' + code + '.png');
    const png = readFileSync('public/weapon-sketches/' + code + '.png');
    expect(png.subarray(1, 4).toString()).toBe('PNG');
    expect(png.readUInt32BE(16)).toBe(960);
    expect(png.readUInt32BE(20)).toBe(480);
  }
  expect(readFileSync('src/components/EntityDetail.tsx', 'utf8')).not.toContain(
    'WeaponStudyViewer',
  );
  expect(readFileSync('src/components/wiki/Gallery.tsx', 'utf8')).not.toContain('weapons3d/');
});
