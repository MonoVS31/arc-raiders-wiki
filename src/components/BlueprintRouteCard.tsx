import { routeForBlueprint } from '../domain/blueprints';
import { sourceById } from '../domain/catalog';
import { mapManifest } from '../domain/maps';

export function BlueprintRouteCard({blueprintId,onNavigate}:{blueprintId:string;onNavigate?:((mapId:string,blueprintId:string)=>void)|undefined}){
 const route=routeForBlueprint(blueprintId);if(!route)return null;
 return <section className="blueprint-route" aria-labelledby="route-title">
   <div className="route-heading"><h3 id="route-title">Cómo buscar este plano</h3><span className={`confidence ${route.confidence.replaceAll(' ','-')}`}>{route.confidence}</span></div>
   <dl>
     <div><dt>Obtención por botín</dt><dd>{route.scavengable===null?'Pendiente de verificar':route.scavengable?'Posible según el índice':'No incluida en el botín del índice'}</dd></div>
     <div><dt>Contenedores reportados</dt><dd>{route.containers??'No especificados'}</dd></div>
     <div><dt>Condiciones alternativas</dt><dd>{route.conditionUnknown?'Pendiente de verificar':route.conditions.join(' · ')||'Sin condición específica reportada'}</dd></div>
     {route.quest&&<div><dt>Misión que recompensa el plano</dt><dd>{route.quest}</dd></div>}
     <div><dt>Recompensa de Trials</dt><dd>{route.trialReward==='yes'?'Reportada':route.trialReward==='no'?'No reportada':'Sin verificar'}</dd></div>
   </dl>
   <p>{route.note}</p>
   {route.maps.length>0&&<div className="route-maps"><span>{route.mapScope==='quest'?'Mapas con objetivos de misión reportados':route.mapScope==='condition-only'?'Mapas con la condición reportada; ruta por corroborar':'Mapas reportados'}</span>{route.maps.map(slug=>{const map=mapManifest.maps.find(map=>map.slug===slug);return map&&<button key={slug} type="button" onClick={()=>onNavigate?.(map.id,blueprintId)} disabled={!onNavigate}>{map.name} ↗</button>;})}</div>}
   {route.mapScope==='quest'&&<p>El plano se obtiene al completar la misión. Sus objetivos no son puntos de aparición del plano.</p>}
   <div className="source-links">{route.sourceIds.map(id=>{const source=sourceById.get(id);return source&&<a key={id} href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a>;})}</div>
   <div className="source-links">{route.mapEvidenceUrls.map(url=><a key={url} href={url} target="_blank" rel="noreferrer">Objetivos en MetaForge ↗</a>)}</div>
 </section>;
}
