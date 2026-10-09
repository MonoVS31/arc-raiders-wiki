// @vitest-environment jsdom
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Gallery } from '../src/components/wiki/Gallery';
import { EntityDetail } from '../src/components/EntityDetail';
import { catalog } from '../src/domain/catalog';
import {
  standaloneThrowableCodes,
  standaloneViewer,
  standaloneWeaponCodes,
  standaloneWeaponLink,
} from '../src/domain/standalone-weapons';
const withoutReturnBar = (file: string) =>
  readFileSync(file, 'utf8').replace(
    /\n<!-- ARC ATLAS RETURN BAR START -->[\s\S]*?<!-- ARC ATLAS RETURN BAR END -->/,
    '',
  );
it.each([
  ['armas-3d.html', '09798469ee10296eea5756df10a0e5d9f32a84e0e84faa74b7b1ca6f309490c6'],
  ['arrojadizos-3d.html', '1d3b8bca4534a5086e0d76b2878c59b9e493a08c6547d5bf8d15701a4464c492'],
])('preserva exactamente %s, descontando solo la barra autorizada', (file, hash) => {
  const source = withoutReturnBar(file);
  expect(createHash('sha256').update(source).digest('hex')).toBe(hash);
  expect(source).toContain('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js');
  expect(source).toContain(
    'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js',
  );
});
it('los 24 enlaces de armas apuntan a los códigos de inicio del visor', () => {
  const html = readFileSync('armas-3d.html', 'utf8');
  expect(Object.keys(standaloneWeaponCodes)).toHaveLength(24);
  for (const [id, code] of Object.entries(standaloneWeaponCodes)) {
    expect(html).toContain(`id:'${code}'`);
    expect(standaloneWeaponLink(id)).toMatch(new RegExp(`armas-3d\\.html#${code}$`));
    const entity = catalog.entities.find((entity) => entity.id === id)!;
    const card = renderToStaticMarkup(<Gallery entities={[entity]} />);
    expect(card).toContain(`armas-3d.html#${code}`);
    const detail = renderToStaticMarkup(<EntityDetail entity={entity} />);
    expect(detail).toContain(`armas-3d.html#${code}`);
    expect(detail).toContain(`armas-3d.html?embed#${code}`);
  }
});
it('las 15 granadas con modelo abren el visor de arrojadizos', () => {
  const html = readFileSync('arrojadizos-3d.html', 'utf8');
  expect(Object.keys(standaloneThrowableCodes)).toHaveLength(15);
  for (const [id, code] of Object.entries(standaloneThrowableCodes)) {
    expect(html).toContain(`id:'${code}'`);
    expect(standaloneViewer(id)?.link).toMatch(new RegExp(`arrojadizos-3d\\.html#${code}$`));
    const entity = catalog.entities.find((entity) => entity.id === id)!;
    expect(renderToStaticMarkup(<Gallery entities={[entity]} />)).toContain(
      `arrojadizos-3d.html#${code}`,
    );
    expect(renderToStaticMarkup(<EntityDetail entity={entity} />)).toContain(
      `arrojadizos-3d.html?embed#${code}`,
    );
  }
});
it('no agrega botones ni contenedores nuevos a otras categorías o fichas sin modelo', () => {
  for (const id of ['arc-hornet', 'weapon-stiletto', 'grenade-yank-grenade']) {
    const entity = catalog.entities.find((entity) => entity.id === id)!;
    const card = renderToStaticMarkup(<Gallery entities={[entity]} />);
    expect(card).not.toContain('Ver en 3D');
    expect(card).not.toContain('gallery-item');
    expect(renderToStaticMarkup(<EntityDetail entity={entity} />)).not.toContain('viewer-embed');
  }
});
