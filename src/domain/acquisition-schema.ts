import { z } from 'zod';
import rawRoutes from '../data/blueprint-routes.json';

const routeSchema = z
  .object({
    id: z.string(),
    blueprintId: z.string(),
    name: z.string(),
    maps: z.array(z.string()),
    mapScope: z.enum(['all', 'condition-only', 'specific', 'quest', 'unknown']),
    conditions: z.array(z.string()),
    conditionUnknown: z.boolean(),
    containers: z.string().nullable(),
    scavengable: z.boolean().nullable(),
    quest: z.string().nullable(),
    trialReward: z.enum(['yes', 'no', 'unknown']),
    confidence: z.enum(['probable', 'posible', 'no confirmado']),
    validation: z.enum(['cross-checked', 'index-only', 'incomplete']),
    sourceIds: z.array(z.string()).min(1),
    mapEvidenceUrls: z.array(z.string().startsWith('https://metaforge.app/arc-raiders/map/')),
    note: z.string().min(1),
  })
  .strict();
export const acquisitionData = z
  .object({
    schemaVersion: z.literal(1),
    asOf: z.iso.date(),
    indexRevision: z.string(),
    routes: z.array(routeSchema),
  })
  .strict()
  .parse(rawRoutes);
export type BlueprintRoute = z.infer<typeof routeSchema>;
