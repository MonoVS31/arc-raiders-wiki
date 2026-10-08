import { routeForBlueprint } from '../domain/blueprints';
import { mapManifest } from '../domain/maps';
import { auditForBlueprint, researchAudit } from '../domain/research-audit';
import { projectBlueprintRewards } from '../domain/project-rewards';
import { WikiLink, Sources } from '../app/WikiContext';
import { QuestGuide } from './QuestGuide';
import type { CSSProperties } from 'react';
import { DiagramFrame } from './wiki/DiagramFrame';
function RouteEvidence({ unknown = false }: { unknown?: boolean }) {
  return (
    <span className={`confidence ${unknown ? 'no-confirmado' : 'posible'}`}>
      {unknown ? 'no confirmado' : 'posible'}
    </span>
  );
}

export function BlueprintRouteCard({
  blueprintId,
  onNavigate,
}: {
  blueprintId: string;
  onNavigate?: ((mapId: string, blueprintId: string) => void) | undefined;
}) {
  const route = routeForBlueprint(blueprintId);
  if (!route) return null;
  const audit = auditForBlueprint(blueprintId);
  const rewards = projectBlueprintRewards.filter((reward) => reward.blueprintId === blueprintId);
  return (
    <DiagramFrame className="diagram-section-frame" scan={false}>
      <section className="blueprint-route" aria-labelledby="route-title">
        <div className="route-heading">
          <h3 id="route-title">Cómo buscar este plano</h3>
          <span className={`confidence ${route.confidence.replaceAll(' ', '-')}`}>
            {route.confidence}
          </span>
        </div>
        <dl>
          <div className="diagram-section-reveal" style={{ '--diagram-order': 0 } as CSSProperties}>
            <dt>
              Obtención por botín <RouteEvidence unknown={route.scavengable === null} />
            </dt>
            <dd>
              {route.scavengable === null
                ? 'Pendiente de verificar'
                : route.scavengable
                  ? 'Posible según el índice'
                  : 'No incluida en el botín del índice'}
            </dd>
          </div>
          <div className="diagram-section-reveal" style={{ '--diagram-order': 1 } as CSSProperties}>
            <dt>
              Contenedores reportados <RouteEvidence unknown={route.containers === null} />
            </dt>
            <dd>
              {route.containers ??
                (route.quest && !route.scavengable
                  ? 'No aplica a la recompensa de misión'
                  : 'No especificados')}
            </dd>
          </div>
          <div className="diagram-section-reveal" style={{ '--diagram-order': 2 } as CSSProperties}>
            <dt>
              Condiciones alternativas <RouteEvidence unknown={route.conditionUnknown} />
            </dt>
            <dd>
              {route.conditionUnknown
                ? 'Pendiente de verificar'
                : route.conditions.join(' · ') ||
                  (route.quest && !route.scavengable
                    ? 'No aplica a la recompensa de misión'
                    : 'Sin condición específica reportada')}
            </dd>
          </div>
          {route.quest && (
            <div
              className="diagram-section-reveal"
              style={{ '--diagram-order': 3 } as CSSProperties}
            >
              <dt>
                Misión que recompensa el plano{' '}
                <span
                  className={`confidence ${audit?.routeEvidence === 'explicit-blueprint' ? 'probable' : 'posible'}`}
                >
                  {audit?.routeEvidence === 'explicit-blueprint' ? 'probable' : 'posible'}
                </span>
              </dt>
              <dd>{route.quest}</dd>
            </div>
          )}
          <div className="diagram-section-reveal" style={{ '--diagram-order': 4 } as CSSProperties}>
            <dt>
              Recompensa de Trials <RouteEvidence unknown={route.trialReward === 'unknown'} />
            </dt>
            <dd>
              {route.trialReward === 'yes'
                ? 'Reportada'
                : route.trialReward === 'no'
                  ? 'No reportada'
                  : 'Sin verificar'}
            </dd>
          </div>
        </dl>
        <p>{route.note}</p>
        {route.quest && <QuestGuide name={route.quest} />}
        {rewards.length > 0 && (
          <div className="project-reward-routes">
            <h4>También como recompensa de proyecto</h4>
            {rewards.map((reward) => (
              <div key={reward.projectId + reward.stageName}>
                <span className="confidence probable">probable</span>
                <p>
                  {reward.projectName} · {reward.stageName}: {reward.reward}
                </p>
                <p>
                  Estado del proyecto: {reward.availability}.
                  {reward.availability !== 'disponible'
                    ? ' No se presenta como una obtención vigente.'
                    : ''}
                </p>
                <WikiLink entityId={reward.projectId}>Ver etapas del proyecto →</WikiLink>
              </div>
            ))}
          </div>
        )}
        {audit && (
          <details className="route-audit">
            <summary>Revisión de evidencia · {researchAudit.checkedAt.slice(0, 10)}</summary>
            <p>{audit.note}</p>
            {audit.containerDetails.length > 0 && (
              <p>
                <strong>Contenedores específicos reportados:</strong>{' '}
                {audit.containerDetails.join(' · ')}{' '}
                <span className="confidence probable">probable</span>
              </p>
            )}
            {audit.pendingFields.length > 0 && (
              <p>Campos sin verificar: {audit.pendingFields.join(' · ')}.</p>
            )}
            <p>
              La revisión comprobó la versión de la ficha y su presencia en otro catálogo. No
              equivale a verificar una aparición dentro del juego.
            </p>
            <Sources ids={researchAudit.sourceIds} />
          </details>
        )}
        {route.maps.length > 0 && (
          <div className="route-maps">
            <span>
              {route.mapScope === 'quest'
                ? 'Mapas con objetivos de misión reportados'
                : route.mapScope === 'condition-only'
                  ? 'Mapas con la condición reportada; ruta por corroborar'
                  : 'Mapas reportados'}
            </span>
            {route.maps.map((slug) => {
              const map = mapManifest.maps.find((map) => map.slug === slug);
              return (
                map && (
                  <button
                    key={slug}
                    type="button"
                    onClick={() => onNavigate?.(map.id, blueprintId)}
                    disabled={!onNavigate}
                  >
                    {map.name} ↗
                  </button>
                )
              );
            })}
          </div>
        )}
        {route.mapScope === 'quest' && (
          <p>
            El plano se obtiene al completar la misión. Sus objetivos no son puntos de aparición del
            plano.
          </p>
        )}
        <Sources ids={route.sourceIds} />
      </section>
    </DiagramFrame>
  );
}
