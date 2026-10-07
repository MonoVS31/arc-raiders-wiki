import { z } from 'zod';
import rawAudit from '../data/research-audit.json';
const rowSchema=z.object({blueprintId:z.string(),itemRevision:z.string(),secondaryId:z.string(),routeEvidence:z.enum(['explicit-blueprint','containers-only','index-only']),containerDetails:z.array(z.string()),pendingFields:z.array(z.string()),sourceIds:z.array(z.string()).min(1),note:z.string().min(1)}).strict();
export const researchAudit=z.object({schemaVersion:z.literal(1),checkedAt:z.iso.datetime(),indexRevision:z.string(),checkedPageCount:z.number().int().positive(),sourceIds:z.array(z.string()).min(1),routes:z.array(rowSchema)}).strict().parse(rawAudit);
if(new Set(researchAudit.routes.map(row=>row.blueprintId)).size!==researchAudit.routes.length)throw Error('Revisiones duplicadas');
export const auditForBlueprint=(id:string)=>researchAudit.routes.find(row=>row.blueprintId===id);
