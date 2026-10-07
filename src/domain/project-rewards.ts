import { readAtlasData } from './data-loader';
import { z } from 'zod';
const rawRewards = readAtlasData<
  typeof import('../../public/data/atlas/project-blueprint-rewards.json')
>('project-blueprint-rewards.json');
const rawPeriods =
  readAtlasData<typeof import('../../public/data/atlas/project-periods.json')>(
    'project-periods.json',
  );
import { availabilitySchema } from './schema';
export const projectBlueprintRewards = z
  .array(
    z
      .object({
        projectId: z.string(),
        projectName: z.string(),
        availability: availabilitySchema,
        stageName: z.string(),
        blueprintId: z.string(),
        reward: z.string(),
        sourceId: z.string(),
        confidence: z.literal('probable'),
      })
      .strict(),
  )
  .parse(rawRewards);
export const projectPeriods = z
  .array(
    z
      .object({
        entityId: z.string(),
        name: z.string(),
        availability: availabilitySchema,
        sourceId: z.string(),
        period: z.array(z.object({ field: z.string(), value: z.string() }).strict()),
      })
      .strict(),
  )
  .parse(rawPeriods);
