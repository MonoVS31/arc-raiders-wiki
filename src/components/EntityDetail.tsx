import { claimsFor } from '../domain/query';
import { catalog, sourceById } from '../domain/catalog';
import type { Entity } from '../domain/schema';
import { lazy, Suspense } from 'react';
import { BlueprintRouteCard } from './BlueprintRouteCard';
import { mapManifest } from '../domain/maps';
import { WeaponComparison, ARCCombatPanel, GrenadeEffectPanel } from './CombatTools';
const MapExplorer=lazy(()=>import('./MapExplorer'));

export const categories = { map: 'Mapas', weapon: 'Armas', arc: 'Enemigos ARC', grenade: 'Granadas', blueprint: 'Planos', project: 'Proyectos', container: 'Contenedores' } as const;
const fieldNames: Record<string, string> = {
  'Ammo Type': 'Munición', 'Firing Mode': 'Modo de disparo', 'ARC Armor Penetration': 'Penetración ARC',
  Damage: 'Daño declarado', 'Fire Rate': 'Cadencia declarada', Range: 'Alcance declarado', 'Magazine Size': 'Cargador',
  Radius: 'Radio del efecto', 'Homing Range': 'Alcance de búsqueda', Duration: 'Duración', Delay: 'Retardo',
  'ARC Stun Duration': 'Aturdimiento ARC', 'Raider Stun Duration': 'Aturdimiento Raider', 'Stamina Drain': 'Consumo de resistencia',
};
export function EntityDetail({ entity, blueprintId, onNavigate }: { entity: Entity; blueprintId?:string|undefined; onNavigate?:((mapId:string,blueprintId:string)=>void)|undefined }) {
  const hasMap=mapManifest.maps.some(map=>map.id===entity.id);
  const claims = claimsFor(catalog, entity.id).filter(claim=>!(hasMap&&claim.field==='coordenadas de cajas')&&!(entity.category==='blueprint'&&claim.field==='ruta detallada'));
  const pendingLocations = catalog.locations.filter(location => location.mapId === entity.id);
  return <article className="detail" aria-labelledby="detail-title">
    <div className="detail-header"><span className="eyebrow">{categories[entity.category]} / expediente</span><span className={`availability ${entity.availability}`}>{entity.availability}</span></div>
    <h2 id="detail-title">{entity.name}</h2>
    <p className="muted">Cada campo conserva su propia evidencia. Los datos comunitarios siguen sujetos a revisión.</p>
    {entity.availability === 'anunciado' && <p className="notice">Contenido anunciado para el 8 de octubre. Todavía no se presenta como disponible.</p>}
    {hasMap&&<Suspense fallback={<p className="map-loading">Cargando visor de mapas…</p>}><MapExplorer mapId={entity.id} blueprintId={blueprintId}/></Suspense>}
    {entity.category==='map'&&!hasMap&&<div className="map-placeholder"><h3>Cartografía en verificación</h3><p>Este mapa aún no tiene coordenadas revisadas.</p></div>}
    {entity.category==='blueprint'&&<BlueprintRouteCard blueprintId={entity.id} onNavigate={onNavigate}/>}
    {entity.availability==='disponible'&&entity.category==='weapon'&&<WeaponComparison entity={entity}/>}
    {entity.availability==='disponible'&&entity.category==='arc'&&<ARCCombatPanel entity={entity}/>}
    {entity.availability==='disponible'&&entity.category==='grenade'&&<GrenadeEffectPanel entity={entity}/>}
    <dl className="claims">{claims.map(claim => <div className="claim" key={claim.id}>
      <dt>{fieldNames[claim.field] ?? claim.field}<span className={`confidence ${claim.confidence.replaceAll(' ', '-')}`}>{claim.confidence}</span></dt>
      <dd>{claim.value === null ? <span className="unknown">Pendiente de verificar</span> : `${claim.value}${claim.unit ? ` ${claim.unit}` : ''}`}</dd>
      {claim.note && <p className="claim-note">{claim.note}</p>}
      <div className="source-links">{claim.sourceIds.map(id => { const source = sourceById.get(id); return source && <a key={id} href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a>; })}</div>
    </div>)}</dl>
    {!hasMap&&pendingLocations.length > 0 && <section className="location-tasks"><h3>Reportes y verificación de cajas</h3>{pendingLocations.map(location => <div key={location.id}><span className={`confidence ${location.confidence.replaceAll(' ', '-')}`}>{location.confidence}</span><p>{location.note}</p>{location.sourceIds.map(id => { const source = sourceById.get(id); return source && <a key={id} href={source.url} target="_blank" rel="noreferrer">Fuente ↗</a>; })}</div>)}</section>}
  </article>;
}
