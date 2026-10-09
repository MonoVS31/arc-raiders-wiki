import { StandaloneWeaponLink } from './wiki/StandaloneWeaponLink';
import { standaloneWeaponSketch } from '../domain/standalone-weapons';
import { OriginalWeaponSketch } from './wiki/OriginalWeaponSketch';
import { numericBarScale } from '../domain/numeric-scale';
import { StatBars } from './wiki/StatBars';
import { localImage } from '../domain/images';
import { AtlasImage } from './wiki/AtlasImage';
import { DiagramFrame } from './wiki/DiagramFrame';
import { HotspotLayer } from './wiki/HotspotLayer';
import { diagramFor } from '../domain/diagram-hotspots';
import { readAtlasData } from '../domain/data-loader';
import { claimsFor } from '../domain/query';
import { catalog } from '../domain/catalog';
import type { Entity } from '../domain/schema';
import { lazy, Suspense, type ReactNode, type CSSProperties } from 'react';
import { BlueprintRouteCard } from './BlueprintRouteCard';
import { mapManifest } from '../domain/maps';
import { WeaponComparison, ARCCombatPanel, GrenadeEffectPanel } from './CombatTools';
import { ShareEntityLink } from './ShareEntityLink';
import { Sources } from '../app/WikiContext';
const visuals =
  readAtlasData<typeof import('../../public/data/atlas/entity-visuals.json')>(
    'entity-visuals.json',
  );
const MapExplorer = lazy(() => import('./MapExplorer'));
const ProjectSteps = lazy(() => import('./ProjectSteps'));
const LocalDossier = lazy(() => import('./LocalDossier'));

import { categories, fieldNames } from '../domain/presentation';
export { categories } from '../domain/presentation';
function ContainerClaimsFrame({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  return enabled ? (
    <DiagramFrame className="diagram-container-frame" scan={false}>
      {children}
    </DiagramFrame>
  ) : (
    <>{children}</>
  );
}
export function EntityDetail({
  entity,
  blueprintId,
  arcId,
  onNavigate,
}: {
  entity: Entity;
  blueprintId?: string | undefined;
  arcId?: string | undefined;
  onNavigate?: ((mapId: string, blueprintId: string) => void) | undefined;
}) {
  const hasMap = mapManifest.maps.some((map) => map.id === entity.id);
  const claims = claimsFor(catalog, entity.id).filter(
    (claim) =>
      !(hasMap && claim.field === 'coordenadas de cajas') &&
      !(entity.category === 'blueprint' && claim.field === 'ruta detallada'),
  );
  const pendingLocations = catalog.locations.filter((location) => location.mapId === entity.id);
  const visual = visuals.find((visual) => visual.entityId === entity.id);
  const entry = ['weapon', 'grenade'].includes(entity.category) ? diagramFor(entity.id) : undefined;
  const study = entity.category === 'weapon' ? standaloneWeaponSketch(entity.id) : undefined;
  const diagram = !study && entry?.puntos.length ? entry : undefined;
  return (
    <article className="detail" aria-labelledby="detail-title">
      <header
        className={
          study
            ? 'article-hero article-hero-weapon-study'
            : diagram
              ? 'article-hero article-hero-diagram'
              : 'article-hero'
        }
      >
        <div>
          <div className="detail-header">
            <span className="eyebrow">{categories[entity.category]} / expediente</span>
            <span className={`availability ${entity.availability}`}>{entity.availability}</span>
          </div>
          <h2 id="detail-title">{entity.name}</h2>
          {entity.category === 'weapon' && <StandaloneWeaponLink entityId={entity.id} />}
          <span className="article-code" aria-hidden="true">
            ARCHIVO / {entity.id.toUpperCase()}
          </span>
          {study && (
            <dl className="weapon-study-summary">
              {claims
                .filter((claim) =>
                  ['clase', 'Ammo Type', 'Firing Mode', 'Magazine Size'].includes(claim.field),
                )
                .map((claim) => (
                  <div key={claim.id}>
                    <dt>{fieldNames[claim.field] ?? claim.field}</dt>
                    <dd>
                      {claim.value} <small>· {claim.confidence}</small>{' '}
                      <Sources ids={claim.sourceIds} />
                    </dd>
                  </div>
                ))}
            </dl>
          )}
        </div>
        {study ? (
          <div className="article-visual article-visual-weapon-study">
            <OriginalWeaponSketch entityId={entity.id} name={entity.name} />
          </div>
        ) : (
          visual && (
            <div className={diagram ? 'article-visual article-visual-diagram' : 'article-visual'}>
              <HotspotLayer
                key={entity.id}
                diagram={diagram}
                fallback={
                  <DiagramFrame className="diagram-static-image">
                    <AtlasImage
                      key={visual.url}
                      url={localImage(visual.url)}
                      name={entity.category === 'arc' ? '' : entity.name}
                      id={entity.id}
                      lazy={false}
                    />
                  </DiagramFrame>
                }
              />
              {diagram && (
                <p className="diagram-attribution">
                  Imagen del catálogo existente · Assets © Embark Studios.{' '}
                  <Sources ids={[visual.sourceId]} label="Procedencia de la imagen" />
                </p>
              )}
            </div>
          )
        )}
      </header>
      <ShareEntityLink entityId={entity.id} blueprintId={blueprintId} arcId={arcId} />
      <p className="muted">
        Cada campo conserva su propia evidencia. Los datos comunitarios siguen sujetos a revisión.
      </p>
      {entity.availability === 'anunciado' && (
        <p className="notice">
          Contenido anunciado para el 8 de octubre. Todavía no se presenta como disponible.
        </p>
      )}
      {hasMap && (
        <Suspense fallback={<p className="map-loading">Cargando visor de mapas…</p>}>
          <MapExplorer mapId={entity.id} blueprintId={blueprintId} arcId={arcId} />
        </Suspense>
      )}
      {entity.category === 'map' && !hasMap && (
        <div className="map-placeholder">
          <h3>Cartografía en verificación</h3>
          <p>Este mapa aún no tiene coordenadas revisadas.</p>
        </div>
      )}
      {entity.category === 'blueprint' && (
        <BlueprintRouteCard blueprintId={entity.id} onNavigate={onNavigate} />
      )}
      {entity.category === 'project' && (
        <Suspense fallback={<p>Cargando etapas…</p>}>
          <ProjectSteps projectId={entity.id} />
        </Suspense>
      )}
      <section id="datos" aria-label="Estadísticas y datos">
        {entity.availability === 'disponible' && entity.category === 'weapon' && (
          <WeaponComparison entity={entity} />
        )}
        {entity.availability === 'disponible' && entity.category === 'arc' && (
          <ARCCombatPanel entity={entity} />
        )}
        {entity.availability === 'disponible' && entity.category === 'grenade' && (
          <GrenadeEffectPanel entity={entity} />
        )}
        {claims.some((claim) => numericBarScale(claim, entity.category) !== null) && (
          <p className="muted bar-legend">
            Las barras usan una escala visual del archivo: mismo campo, unidad y categoría. No
            representan límites del juego ni modifican los valores.
          </p>
        )}
        <ContainerClaimsFrame enabled={entity.category === 'container'}>
          <dl className="claims">
            {claims.map((claim, index) => (
              <div
                className={
                  entity.category === 'container' ? 'claim diagram-section-reveal' : 'claim'
                }
                style={
                  entity.category === 'container'
                    ? ({ '--diagram-order': index } as CSSProperties)
                    : undefined
                }
                key={claim.id}
              >
                <dt>
                  {fieldNames[claim.field] ?? claim.field}
                  <span className={`confidence ${claim.confidence.replaceAll(' ', '-')}`}>
                    {claim.confidence}
                  </span>
                </dt>
                <dd>
                  {claim.value === null ? (
                    <span className="unknown">Pendiente de verificar</span>
                  ) : (
                    `${claim.value}${claim.unit ? ` ${claim.unit}` : ''}`
                  )}
                </dd>
                <StatBars claim={claim} category={entity.category} />
                {claim.note && <p className="claim-note">{claim.note}</p>}
                <Sources ids={claim.sourceIds} />
              </div>
            ))}
          </dl>
        </ContainerClaimsFrame>
      </section>
      {['weapon', 'grenade', 'blueprint', 'container'].includes(entity.category) &&
        entity.availability === 'disponible' && (
          <Suspense fallback={<p className="muted">Cargando archivo de fabricación…</p>}>
            <LocalDossier entity={entity} />
          </Suspense>
        )}
      {!hasMap && pendingLocations.length > 0 && (
        <section className="location-tasks">
          <h3>Reportes y verificación de cajas</h3>
          {pendingLocations.map((location) => (
            <div key={location.id}>
              <span className={`confidence ${location.confidence.replaceAll(' ', '-')}`}>
                {location.confidence}
              </span>
              <p>{location.note}</p>
              <Sources ids={location.sourceIds} />
            </div>
          ))}
        </section>
      )}
    </article>
  );
}
