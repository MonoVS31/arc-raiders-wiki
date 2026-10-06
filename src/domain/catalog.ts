import rawCatalog from '../data/catalog.json';
import rawSources from '../data/sources.json';
import { validateCatalog } from './schema';
import { mapManifest } from './maps';
import { acquisitionData } from './acquisition-schema';

// Retain the original research snapshot and supersede its pending fields with reviewed evidence.
const initial=validateCatalog(rawCatalog,rawSources);
const currentClaims=initial.catalog.claims.map(claim=>{
 const map=mapManifest.maps.find(map=>map.id===claim.subjectId);
 if(map&&claim.field==='coordenadas de cajas')return {...claim,value:`${map.caseCount} reportes de cajas con coordenadas de fuente`,confidence:'posible',sourceIds:[`metaforge-${map.slug}`,'metaforge-calibration'],note:'Calibración del proveedor revisada. Ubicación comunitaria posible; aparición en una partida no garantizada.'};
 const route=acquisitionData.routes.find(route=>route.blueprintId===claim.subjectId);
 if(route&&claim.field==='ruta detallada')return {...claim,value:route.quest?`Plano por misión: ${route.quest}`:route.validation==='incomplete'?'Ruta con campos pendientes de verificar':'Ruta de botín documentada en el índice comunitario',confidence:route.confidence,sourceIds:route.sourceIds,note:route.note};
 return claim;
});
export const { catalog, sources } = validateCatalog({...initial.catalog,claims:currentClaims},rawSources);
export const sourceById = new Map(sources.map(source => [source.id, source]));
