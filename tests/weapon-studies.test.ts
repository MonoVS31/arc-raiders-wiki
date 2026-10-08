import { it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { Resvg } from '@resvg/resvg-js';
import { catalog } from '../src/domain/catalog';
import { weaponStudies } from '../src/domain/weapon-studies';
it('las 24 armas disponibles tienen estudios propios sin cambiar las fichas anunciadas', () => {
  expect(new Set(weaponStudies.map((study) => study.entityId))).toEqual(
    new Set(
      catalog.entities
        .filter((entity) => entity.category === 'weapon' && entity.availability === 'disponible')
        .map((entity) => entity.id),
    ),
  );
  expect(weaponStudies.some((study) => study.entityId === 'weapon-stiletto')).toBe(false);
});
it('cada modelo tiene geometrías completas, distintas y finitas y libera sus recursos', async () => {
  const model = await import(
    /* @vite-ignore */ new URL('../public/weapons3d/model.js', import.meta.url).href
  );
  const hashes = new Set<string>();
  for (const entry of weaponStudies) {
    const design = (
      await import(
        /* @vite-ignore */ new URL('../public/weapons3d/' + entry.file, import.meta.url).href
      )
    ).default;
    expect(design.id).toBe(entry.entityId);
    expect(design.parts.some((part: { name: string }) => part.name === 'Cuerpo')).toBe(true);
    expect(design.parts.some((part: { name: string }) => part.name === 'Cañón')).toBe(true);
    expect(design.parts.some((part: { name: string }) => part.name === 'Empuñadura')).toBe(true);
    expect(design.anchors.some((anchor: { text: string }) => anchor.text === 'MIRA')).toBe(true);
    hashes.add(createHash('sha256').update(JSON.stringify(design.parts)).digest('hex'));
    const built = model.buildModel(design, { preview: true });
    expect(built.size.x).toBeGreaterThan(1);
    expect(built.size.y).toBeGreaterThan(0.2);
    built.group.traverse(
      (node: { geometry?: { attributes: { position: { array: Iterable<number> } } } }) => {
        if (node.geometry)
          expect(Array.from(node.geometry.attributes.position.array).every(Number.isFinite)).toBe(
            true,
          );
      },
    );
    model.disposeModel(built.group);
  }
  expect(hashes.size).toBe(24);
});
it.each(weaponStudies)(
  'perfiles y miniaturas SVG válidos de $entityId, sin fotos ni modelos externos',
  (study) => {
    for (const file of [study.profile, study.preview]) {
      const svg = readFileSync('public/weapons3d/' + file, 'utf8');
      expect(svg).toContain('http://www.w3.org/2000/svg');
      expect(svg).not.toContain('<image');
      expect(svg).not.toMatch(/https?:[^" ]+\.(glb|obj|png|jpg)/);
      const rendered = new Resvg(svg, {
        fitTo: { mode: 'width', value: 32 },
        font: { loadSystemFonts: false },
      }).render();
      expect(rendered.width).toBe(32);
    }
  },
);
