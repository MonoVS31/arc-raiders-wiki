import { z } from 'zod';
import rawProjects from '../data/project-stages.json';
import { availabilitySchema } from './schema';
export const projectStageData=z.object({schemaVersion:z.literal(1),reviewedAt:z.iso.datetime(),projects:z.array(z.object({entityId:z.string(),name:z.string(),availability:availabilitySchema,sourceId:z.string(),period:z.array(z.object({field:z.string(),value:z.string()}).strict()),stages:z.array(z.object({name:z.string(),requirements:z.array(z.string()),rewards:z.array(z.string()),confidence:z.literal('probable')}).strict()),completion:z.array(z.string())}).strict())}).strict().parse(rawProjects);
export const stepsForProject=(id:string)=>projectStageData.projects.find(project=>project.entityId===id);
