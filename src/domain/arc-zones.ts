import { readAtlasData } from './data-loader';
import { z } from 'zod';
const rawZones =
  readAtlasData<typeof import('../../public/data/atlas/arc-zones.json')>('arc-zones.json');
const zoneSchema = z
  .object({
    id: z.string(),
    label: z.string(),
    kind: z.enum(['weak', 'protected', 'unarmored', 'unknown']),
    description: z.string(),
    evidence: z.string(),
    condition: z.string(),
    confidence: z.enum(['probable', 'no confirmado']),
  })
  .strict();
const enemySchema = z
  .object({
    entityId: z.string(),
    layout: z.enum(['drone-four', 'shell-core', 'components']),
    revision: z.string(),
    sourceIds: z.array(z.string()).min(1),
    zones: z.array(zoneSchema).min(1),
    resistances: z.array(
      z
        .object({
          part: z.string(),
          armor: z.string(),
          physical: z.string().regex(/^\d+%$/),
          explosive: z.string().regex(/^\d+%$/),
          confidence: z.literal('no confirmado'),
        })
        .strict(),
    ),
  })
  .strict();
export const arcZoneData = z
  .object({
    schemaVersion: z.literal(1),
    reviewedAt: z.iso.datetime(),
    revisionSourceId: z.string(),
    enemies: z.array(enemySchema),
  })
  .strict()
  .parse(rawZones);
if (new Set(arcZoneData.enemies.map((enemy) => enemy.entityId)).size !== arcZoneData.enemies.length)
  throw Error('ARC duplicados');
for (const enemy of arcZoneData.enemies) {
  if (new Set(enemy.zones.map((zone) => zone.id)).size !== enemy.zones.length)
    throw Error('Zonas duplicadas');
  if (
    enemy.zones.some((zone) => (zone.kind === 'unknown') !== (zone.confidence === 'no confirmado'))
  )
    throw Error('Confianza de zona inconsistente');
}
export type ARCZone = z.infer<typeof zoneSchema>;
export const zonesForARC = (id: string) =>
  arcZoneData.enemies.find((enemy) => enemy.entityId === id);
