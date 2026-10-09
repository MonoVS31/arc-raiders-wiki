// @vitest-environment jsdom
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Gallery } from '../src/components/wiki/Gallery';
import { EntityDetail } from '../src/components/EntityDetail';
import { catalog } from '../src/domain/catalog';
import { standaloneWeaponCodes, standaloneWeaponLink } from '../src/domain/standalone-weapons';
it('preserva exactamente el archivo entregado, descontando solo la barra autorizada', () => {
  const bytes = readFileSync('armas-3d.html');
  const source = bytes
    .toString('utf8')
    .replace(/\n<!-- ARC ATLAS RETURN BAR START -->[\s\S]*?<!-- ARC ATLAS RETURN BAR END -->/, '');
  expect(createHash('sha256').update(source).digest('hex')).toBe(
    '8d122ff72c4e9cdc15790781d5ecc25c214087476cbc01d8839d789f4ffd38e0',
  );
  expect(source).toContain('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js');
  expect(source).toContain(
    'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js',
  );
});
it('los 24 enlaces apuntan a los códigos de inicio del archivo original', () => {
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
  }
});
it('no agrega botones ni contenedores nuevos a otras categorías o armas sin código', () => {
  for (const id of ['arc-hornet', 'grenade-heavy-fuze-grenade', 'weapon-stiletto']) {
    const entity = catalog.entities.find((entity) => entity.id === id)!;
    const card = renderToStaticMarkup(<Gallery entities={[entity]} />);
    expect(card).not.toContain('Ver en 3D');
    expect(card).not.toContain('gallery-item');
  }
});
