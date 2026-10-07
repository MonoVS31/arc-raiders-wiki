import { readAtlasData } from './data-loader';
import { z } from 'zod';
const rawMaps =
  readAtlasData<typeof import('../../public/data/atlas/arc-map-reports.json')>(
    'arc-map-reports.json',
  );
const rawHints =
  readAtlasData<typeof import('../../public/data/atlas/material-arc-hints.json')>(
    'material-arc-hints.json',
  );
export const arcMapReports = z
  .array(
    z
      .object({
        entityId: z.string(),
        maps: z.array(
          z
            .object({
              mapId: z.string(),
              mapName: z.string(),
              count: z.number().int().positive(),
              sourceId: z.string(),
              confidence: z.literal('posible'),
            })
            .strict(),
        ),
      })
      .strict(),
  )
  .parse(rawMaps);
export const materialArcHints = z
  .array(
    z
      .object({
        material: z.string(),
        entityId: z.string(),
        enemyName: z.string(),
        sourceId: z.string(),
        confidence: z.literal('posible'),
      })
      .strict(),
  )
  .parse(rawHints);
