import { createHash } from 'node:crypto';
import { expect, it } from 'vitest';
import { readAtlasData } from '../src/domain/data-loader';
import { catalog, sources } from '../src/domain/catalog';
import { validateCatalog } from '../src/domain/schema';
import '../src/domain/blueprints';
import '../src/domain/arc-zones';
import { diagramHotspotsSchema } from '../src/domain/diagram-hotspots';
import '../src/domain/projects';
import '../src/domain/arc-links';
import '../src/domain/project-rewards';
import '../src/components/QuestGuide';
it('valida el catálogo original y efectivo antes de compilar', () => {
  diagramHotspotsSchema.parse(readAtlasData('diagram-hotspots.json'));
  validateCatalog(readAtlasData('catalog.json'), readAtlasData('sources.json'));
  expect(validateCatalog(catalog, sources).catalog).toEqual(catalog);
});
it('el catálogo efectivo conserva su evidencia, fuentes y notas al mover los archivos', () => {
  // Baseline exported from the previous composition, not from the new loader.
  expect(createHash('sha256').update(JSON.stringify({ catalog, sources })).digest('hex')).toBe(
    '47696f4b54c5f2982be382cc9553885a6a9a768e5f91e3361581c1ba317e83d5',
  );
});
it('los diagramas solo aceptan posiciones y referencias existentes de la misma entidad', () => {
  const image = readAtlasData<{ entityId: string; url: string }[]>('entity-visuals.json').find(
    (image) => image.entityId === 'weapon-kettle',
  )!;
  const point = { id: 'prueba', x: 25, y: 50, lx: 70, ly: 30, ref: { field: 'Magazine Size' } };
  const diagram = { entityId: image.entityId, imageUrl: image.url, puntos: [point] };
  expect(diagramHotspotsSchema.parse([diagram])).toEqual([diagram]);
  const invalid = [
    [{ ...diagram, puntos: [{ ...point, x: 101 }] }],
    [{ ...diagram, puntos: [{ ...point, ly: -1 }] }],
    [{ ...diagram, puntos: [{ ...point, y: Number.NaN }] }],
    [{ ...diagram, puntos: [{ ...point, label: 'Texto duplicado' }] }],
    [{ ...diagram, puntos: [{ ...point, ref: { field: 'Campo inexistente' } }] }],
    [{ ...diagram, puntos: [{ ...point, ref: { zoneId: 'thrusters' } }] }],
    [{ ...diagram, puntos: [{ ...point, ref: { field: 'Magazine Size', zoneId: 'thrusters' } }] }],
    [{ ...diagram, imageUrl: 'https://example.com/imagen-no-revisada.png' }],
    [{ ...diagram, entityId: 'inexistente' }],
    [{ ...diagram, puntos: [point, point] }],
    [diagram, diagram],
  ];
  for (const data of invalid) expect(diagramHotspotsSchema.safeParse(data).success).toBe(false);
});
it('una referencia ARC usa la zona original', async () => {
  const { arcZoneData } = await import('../src/domain/arc-zones');
  const { resolveDiagramPoint } = await import('../src/domain/diagram-hotspots');
  const enemy = arcZoneData.enemies.find((enemy) => enemy.entityId === 'arc-snitch')!;
  const image = readAtlasData<{ portraits: { entityId: string; imageUrl: string }[] }>(
    'arc-portraits.json',
  ).portraits.find((image) => image.entityId === enemy.entityId)!;
  const point = { id: 'prueba', x: 50, y: 50, lx: 20, ly: 20, ref: { zoneId: enemy.zones[0]!.id } };
  diagramHotspotsSchema.parse([
    { entityId: enemy.entityId, imageUrl: image.imageUrl, puntos: [point] },
  ]);
  const resolved = resolveDiagramPoint(enemy.entityId, point);
  expect(resolved.zone).toBe(enemy.zones[0]);
  expect(resolved.sourceIds).toBe(enemy.sourceIds);
  expect(resolved.confidence).toBe(enemy.zones[0]!.confidence);
});
