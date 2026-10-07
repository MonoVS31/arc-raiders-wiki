import { z } from 'zod';
import rawRewards from '../data/project-blueprint-rewards.json';
import rawPeriods from '../data/project-periods.json';
import { availabilitySchema } from './schema';
export const projectBlueprintRewards=z.array(z.object({projectId:z.string(),projectName:z.string(),availability:availabilitySchema,stageName:z.string(),blueprintId:z.string(),reward:z.string(),sourceId:z.string(),confidence:z.literal('probable')}).strict()).parse(rawRewards);
export const projectPeriods=z.array(z.object({entityId:z.string(),name:z.string(),availability:availabilitySchema,sourceId:z.string(),period:z.array(z.object({field:z.string(),value:z.string()}).strict())}).strict()).parse(rawPeriods);
