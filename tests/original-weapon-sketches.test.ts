import { it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  standaloneThrowableCodes,
  standaloneViewer,
  standaloneWeaponCodes,
  standaloneWeaponSketch,
} from '../src/domain/standalone-weapons';
const isThumbnail = (path: string) => {
  const png = readFileSync(path);
  expect(png.subarray(1, 4).toString()).toBe('PNG');
  expect(png.readUInt32BE(16)).toBe(960);
  expect(png.readUInt32BE(20)).toBe(480);
};
it('las tarjetas usan miniaturas sacadas de los visores 3D, sin el visor anterior', () => {
  for (const [id, code] of Object.entries(standaloneWeaponCodes)) {
    expect(standaloneWeaponSketch(id)).toContain('weapon-sketches/' + code + '.png');
    isThumbnail('public/weapon-sketches/' + code + '.png');
  }
  for (const [id, code] of Object.entries(standaloneThrowableCodes)) {
    expect(standaloneViewer(id)?.sketch).toContain('throwable-sketches/' + code + '.png');
    isThumbnail('public/throwable-sketches/' + code + '.png');
  }
  expect(readFileSync('src/components/EntityDetail.tsx', 'utf8')).not.toContain(
    'WeaponStudyViewer',
  );
  expect(readFileSync('src/components/wiki/Gallery.tsx', 'utf8')).not.toContain('weapons3d/');
});
