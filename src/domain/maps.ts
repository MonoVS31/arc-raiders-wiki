import { atlasAsset } from './assets';
import { readAtlasData } from './data-loader';
import { z } from 'zod';
const rawManifest =
  readAtlasData<typeof import('../../public/data/atlas/maps/manifest.json')>('maps/manifest.json');

const coordinate = z.number().finite();
export const regionLabelSchema = z
  .object({
    lat: coordinate,
    lng: coordinate,
    texto: z.string().trim().min(1),
    fuente: z.string().trim().min(1),
  })
  .strict();
const extent = z.tuple([coordinate, coordinate, coordinate, coordinate]);
const tiles = z
  .string()
  .refine(
    (value) =>
      value.startsWith('https://static.metaforge.app/arc-raiders/maps/') &&
      ['{z}', '{x}', '{y}'].every((token) => value.includes(token)),
    'Tiles no autorizados',
  );
export const mapConfigSchema = z
  .object({
    id: z.string(),
    slug: z.enum(['dam', 'spaceport', 'buried-city', 'blue-gate', 'stella-montis', 'riven-tides']),
    name: z.string(),
    center: z.tuple([coordinate, coordinate]),
    worldExtent: extent,
    tileExtent: extent,
    minZoom: coordinate,
    maxZoom: coordinate,
    initialZoom: coordinate,
    tileSize: z.number().positive(),
    defaultFloorId: z.string(),
    floors: z
      .array(
        z.object({
          id: z.string(),
          index: z.number().int().min(0).max(30),
          label: z.string(),
          tiles,
        }),
      )
      .min(1),
    conditions: z.array(z.object({ name: z.string(), bit: z.number().int().min(0).max(30) })),
    sourceUrl: z.url(),
    snapshotHash: z.string().regex(/^[a-f0-9]{64}$/),
    markerCount: z.number().int().nonnegative(),
    caseCount: z.number().int().nonnegative(),
    regionLabels: z.array(regionLabelSchema).optional(),
  })
  .strict()
  .superRefine((map, ctx) => {
    for (const [index, label] of (map.regionLabels ?? []).entries()) {
      if (
        !readAtlasData<{ id: string }[]>('sources.json').some(
          (source) => source.id === label.fuente,
        )
      )
        ctx.addIssue({
          code: 'custom',
          message: 'Etiqueta de región sin fuente existente',
          path: ['regionLabels', index, 'fuente'],
        });
    }
    if (
      map.worldExtent[0] === map.worldExtent[2] ||
      map.worldExtent[1] === map.worldExtent[3] ||
      map.tileExtent[0] === map.tileExtent[2] ||
      map.tileExtent[1] === map.tileExtent[3]
    )
      ctx.addIssue({ code: 'custom', message: 'Calibración degenerada' });
    if (!map.floors.some((floor) => floor.id === map.defaultFloorId))
      ctx.addIssue({ code: 'custom', message: 'Piso predeterminado inexistente' });
    if (new Set(map.floors.map((floor) => floor.id)).size !== map.floors.length)
      ctx.addIssue({ code: 'custom', message: 'Pisos duplicados' });
  });
export const markerSchema = z
  .object({
    id: z.string().min(1),
    kind: z.enum(['weapon-case', 'arc', 'cache', 'quest-objective']),
    subtype: z.string(),
    label: z.string(),
    lat: coordinate,
    lng: coordinate,
    layerMask: z.number().int().min(0).max(2147483647),
    eventMask: z.number().int().min(0).max(2147483647).nullable(),
    behindLockedDoor: z.boolean(),
    sourceUpdatedAt: z.iso.datetime({ offset: true }).nullable(),
    confidence: z.literal('posible'),
  })
  .strict();
export const snapshotSchema = z
  .object({
    slug: z.string(),
    retrievedAt: z.iso.datetime(),
    sourceUrl: z.url(),
    contentHash: z.string().regex(/^[a-f0-9]{64}$/),
    markers: z.array(markerSchema),
  })
  .strict();
export const manifestSchema = z
  .object({
    schemaVersion: z.literal(1),
    asOf: z.iso.date(),
    retrievedAt: z.iso.datetime(),
    provider: z.literal('MetaForge'),
    termsUrl: z.url(),
    attributionUrl: z.url(),
    configUrl: z.url(),
    configHash: z.string(),
    transformUrl: z.url(),
    transformHash: z.string(),
    maps: z.array(mapConfigSchema),
  })
  .strict();
export const mapManifest = manifestSchema.parse(rawManifest);
export type MapConfig = z.infer<typeof mapConfigSchema>;
export type MapMarker = z.infer<typeof markerSchema>;
export type MapSnapshot = z.infer<typeof snapshotSchema>;
export interface MapFilters {
  kind: MapMarker['kind'] | 'all';
  floorIndex: number;
  conditionBit: number | null;
  query: string;
}

export function calibration(map: Pick<MapConfig, 'worldExtent' | 'tileExtent'>) {
  const [wy0, wx0, wy1, wx1] = map.worldExtent,
    [ty0, tx0, ty1, tx1] = map.tileExtent;
  if (wx0 === wx1 || wy0 === wy1) throw new Error('Calibración degenerada');
  const sx = (tx1 - tx0) / (wx1 - wx0),
    sy = (ty1 - ty0) / (wy1 - wy0);
  return { sx, ox: tx0 - sx * wx0, sy, oy: ty0 - sy * wy0 };
}
export function projectPoint(map: MapConfig, point: { lat: number; lng: number }, zoom = 0) {
  const c = calibration(map),
    scale = 2 ** zoom;
  return { x: (point.lng * c.sx + c.ox) * scale, y: (point.lat * c.sy + c.oy) * scale };
}
export function markerMatches(marker: MapMarker, filters: MapFilters) {
  const query = filters.query.trim().toLowerCase();
  return (
    (filters.kind === 'all' || marker.kind === filters.kind) &&
    (marker.layerMask & (1 << filters.floorIndex)) !== 0 &&
    (filters.conditionBit === null ||
      (marker.eventMask !== null && (marker.eventMask & (1 << filters.conditionBit)) !== 0)) &&
    (!query || (marker.label + ' ' + marker.subtype).toLowerCase().includes(query))
  );
}
export function parseSnapshot(input: unknown, map: MapConfig) {
  const snapshot = snapshotSchema.parse(input);
  if (snapshot.slug !== map.slug) throw new Error('Snapshot de otro mapa');
  if (new Set(snapshot.markers.map((marker) => marker.id)).size !== snapshot.markers.length)
    throw new Error('Marcadores duplicados');
  if (snapshot.markers.length !== map.markerCount) throw new Error('Snapshot incompleto');
  return snapshot;
}
export function arcIdForSubtype(subtype: string) {
  const aliases: Record<string, string> = {
    bison: 'leaper',
    rollbot: 'surveyor',
    turbine: 'arc-turbine',
  };
  return 'arc-' + (aliases[subtype.trim()] ?? subtype.trim().replaceAll('_', '-'));
}
const cache = new Map<string, MapSnapshot>();
export async function loadMapSnapshot(map: MapConfig, signal?: AbortSignal) {
  const cached = cache.get(map.slug);
  if (cached) return cached;
  const response = await fetch(
    atlasAsset(`data/maps/${map.slug}.json`),
    signal ? { signal } : undefined,
  );
  if (!response.ok) throw new Error('No se pudo cargar el mapa');
  const text = await response.text();
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  const hash = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
  if (hash !== map.snapshotHash) throw new Error('La caché no coincide con la captura revisada');
  const snapshot = parseSnapshot(JSON.parse(text), map);
  cache.set(map.slug, snapshot);
  return snapshot;
}
