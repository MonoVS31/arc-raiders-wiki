import rawCatalog from '../data/catalog.json';
import rawSources from '../data/sources.json';
import { validateCatalog } from './schema';
import { mapManifest } from './maps';
import { acquisitionData } from './acquisition-schema';
import { researchAudit } from './research-audit';
import { projectBlueprintRewards, projectPeriods } from './project-rewards';
import extraStats from '../data/extra-stats.json';

// Retain the original research snapshot and supersede its pending fields with reviewed evidence.
const initial=validateCatalog(rawCatalog,rawSources);
const currentClaims=initial.catalog.claims.map(claim=>{
 const map=mapManifest.maps.find(map=>map.id===claim.subjectId);
 if(map&&claim.field==='coordenadas de cajas')return {...claim,value:`${map.caseCount} reportes de cajas con coordenadas de fuente`,confidence:'posible',sourceIds:[`metaforge-${map.slug}`,'metaforge-calibration'],note:'Calibración del proveedor revisada. Ubicación comunitaria posible; aparición en una partida no garantizada.'};
 const route=acquisitionData.routes.find(route=>route.blueprintId===claim.subjectId);
 if(route&&claim.field==='ruta detallada')return {...claim,value:route.quest?`Plano por misión: ${route.quest}`:route.validation==='incomplete'?'Ruta con campos pendientes de verificar':'Ruta de botín documentada en el índice comunitario',confidence:route.confidence,sourceIds:route.sourceIds,note:route.note};
 const project=projectPeriods.find(project=>project.entityId===claim.subjectId);
 const end=project?.period.find(period=>period.field==='End')?.value;
 if(project&&end&&end!=='Unknown'){
  const date=new Date(end);const iso=Number.isFinite(date.getTime())?date.toISOString().slice(0,10):null;
  if(claim.field==='cierre de ficha'&&iso)return {...claim,value:iso,confidence:'probable',sourceIds:[project.sourceId],note:'Fecha de la ficha actual; no se especifica horario de cierre. La disponibilidad se conserva desconocida.'};
  if(claim.field==='periodo del índice'&&typeof claim.value==='string'){
   const dates=claim.value.match(/[A-Za-z]+ \d{1,2}, \d{4}/g);const indexedEnd=dates?.at(-1);
   if(indexedEnd&&new Date(indexedEnd).getTime()!==date.getTime())return {...claim,confidence:'no confirmado',sourceIds:[...claim.sourceIds,project.sourceId],note:`El cierre del índice difiere de la ficha actual (${end}). Se conserva el conflicto, sin elegir una fecha por suposición.`};
   if(claim.subjectId==='project-ascending-the-mountain')return {...claim,confidence:'probable',sourceIds:[...claim.sourceIds,project.sourceId],note:'El índice y la ficha actual coinciden en la fecha. La hora de cierre y la disponibilidad actual siguen sin confirmar.'};
  }
 }
 return claim;
});
const containerClaims=researchAudit.routes.filter(row=>row.containerDetails.length).map(row=>({id:`audit-containers-${row.blueprintId}`,subjectId:row.blueprintId,field:'contenedores específicos del plano',value:row.containerDetails.join(' · '),unit:null,confidence:'probable',sourceIds:row.sourceIds.filter(id=>id!=='wiki-blueprints'),note:'La ficha incluye una sección explícita de ubicaciones del plano. No garantiza aparición ni confirma mapa o condición.',availability:'disponible',effectiveFrom:null}));
const rewardClaims=projectBlueprintRewards.map((reward,index)=>({id:`project-reward-${index}-${reward.blueprintId}`,subjectId:reward.blueprintId,field:'recompensa de proyecto',value:`${reward.projectName} / ${reward.stageName}: ${reward.reward}`,unit:null,confidence:'probable',sourceIds:[reward.sourceId],note:reward.availability==='disponible'?'Recompensa del plano reportada por etapa.':`Estado del proyecto: ${reward.availability}. No se presenta como una obtención actualmente disponible.`,availability:reward.availability,effectiveFrom:null}));
export const { catalog, sources } = validateCatalog({...initial.catalog,claims:[...currentClaims,...containerClaims,...rewardClaims,...extraStats]},rawSources);
export const sourceById = new Map(sources.map(source => [source.id, source]));
