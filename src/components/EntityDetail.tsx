import { claimsFor } from '../domain/query';
import { catalog } from '../domain/catalog';
import type { Entity } from '../domain/schema';
import { lazy, Suspense } from 'react';
import { BlueprintRouteCard } from './BlueprintRouteCard';
import { mapManifest } from '../domain/maps';
import { WeaponComparison, ARCCombatPanel, GrenadeEffectPanel } from './CombatTools';
import { ShareEntityLink } from './ShareEntityLink';
import { Sources } from '../app/WikiContext';
import visuals from '../data/entity-visuals.json';
const MapExplorer=lazy(()=>import('./MapExplorer'));
const ProjectSteps=lazy(()=>import('./ProjectSteps'));
const LocalDossier=lazy(()=>import('./LocalDossier'));

export const categories = { map: 'Mapas', weapon: 'Armas', arc: 'Enemigos ARC', grenade: 'Granadas', blueprint: 'Planos', project: 'Proyectos', container: 'Contenedores' } as const;
const fieldNames: Record<string, string> = {
  Health: 'Vida declarada', 'Primary Attack':'Ataque principal', Abilities:'Habilidades declaradas',
  'Headshot Multiplier':'Multiplicador a la cabeza', Durability:'Durabilidad declarada', Stability:'Estabilidad', Agility:'Agilidad', Stealth:'Sigilo', Weight:'Peso declarado',
  'Ammo Type': 'Munición', 'Firing Mode': 'Modo de disparo', 'ARC Armor Penetration': 'Penetración ARC',
  Damage: 'Daño declarado', 'Fire Rate': 'Cadencia declarada', Range: 'Alcance declarado', 'Magazine Size': 'Cargador',
  Radius: 'Radio del efecto', 'Homing Range': 'Alcance de búsqueda', Duration: 'Duración', Delay: 'Retardo',
  'ARC Stun Duration': 'Aturdimiento ARC', 'Raider Stun Duration': 'Aturdimiento Raider', 'Stamina Drain': 'Consumo de resistencia',
};
export function EntityDetail({ entity, blueprintId, arcId, onNavigate }: { entity: Entity; blueprintId?:string|undefined; arcId?:string|undefined; onNavigate?:((mapId:string,blueprintId:string)=>void)|undefined }) {
  const hasMap=mapManifest.maps.some(map=>map.id===entity.id);
  const claims = claimsFor(catalog, entity.id).filter(claim=>!(hasMap&&claim.field==='coordenadas de cajas')&&!(entity.category==='blueprint'&&claim.field==='ruta detallada'));
  const pendingLocations = catalog.locations.filter(location => location.mapId === entity.id);
  const visual=visuals.find(visual=>visual.entityId===entity.id);
  return <article className="detail" aria-labelledby="detail-title">
    <div className="detail-header"><span className="eyebrow">{categories[entity.category]} / expediente</span><span className={`availability ${entity.availability}`}>{entity.availability}</span></div>
    <h2 id="detail-title">{entity.name}</h2>
    {visual&&entity.category!=='arc'&&<div className="article-visual"><img src={visual.url} alt={entity.name}/></div>}
    <ShareEntityLink entityId={entity.id} blueprintId={blueprintId} arcId={arcId}/>
    <p className="muted">Cada campo conserva su propia evidencia. Los datos comunitarios siguen sujetos a revisión.</p>
    {entity.availability === 'anunciado' && <p className="notice">Contenido anunciado para el 8 de octubre. Todavía no se presenta como disponible.</p>}
    {hasMap&&<Suspense fallback={<p className="map-loading">Cargando visor de mapas…</p>}><MapExplorer mapId={entity.id} blueprintId={blueprintId} arcId={arcId}/></Suspense>}
    {entity.category==='map'&&!hasMap&&<div className="map-placeholder"><h3>Cartografía en verificación</h3><p>Este mapa aún no tiene coordenadas revisadas.</p></div>}
    {entity.category==='blueprint'&&<BlueprintRouteCard blueprintId={entity.id} onNavigate={onNavigate}/>}
    {entity.category==='project'&&<Suspense fallback={<p>Cargando etapas…</p>}><ProjectSteps projectId={entity.id}/></Suspense>}
    {entity.availability==='disponible'&&entity.category==='weapon'&&<WeaponComparison entity={entity}/>}
    {entity.availability==='disponible'&&entity.category==='arc'&&<ARCCombatPanel entity={entity}/>}
    {entity.availability==='disponible'&&entity.category==='grenade'&&<GrenadeEffectPanel entity={entity}/>}
    <dl className="claims" id="datos">{claims.map(claim => <div className="claim" key={claim.id}>
      <dt>{fieldNames[claim.field] ?? claim.field}<span className={`confidence ${claim.confidence.replaceAll(' ', '-')}`}>{claim.confidence}</span></dt>
      <dd>{claim.value === null ? <span className="unknown">Pendiente de verificar</span> : `${claim.value}${claim.unit ? ` ${claim.unit}` : ''}`}</dd>
      {claim.note && <p className="claim-note">{claim.note}</p>}
      <Sources ids={claim.sourceIds}/>
    </div>)}</dl>
    {['weapon','grenade','blueprint','container'].includes(entity.category)&&entity.availability==='disponible'&&<Suspense fallback={<p className="muted">Cargando archivo de fabricación…</p>}><LocalDossier entity={entity}/></Suspense>}
    {!hasMap&&pendingLocations.length > 0 && <section className="location-tasks"><h3>Reportes y verificación de cajas</h3>{pendingLocations.map(location => <div key={location.id}><span className={`confidence ${location.confidence.replaceAll(' ', '-')}`}>{location.confidence}</span><p>{location.note}</p><Sources ids={location.sourceIds}/></div>)}</section>}
  </article>;
}
