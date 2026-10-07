import { useState } from 'react';
import { stepsForProject } from '../domain/projects';
import { catalog } from '../domain/catalog';
import { WikiLink, Sources } from '../app/WikiContext';
import { materialArcHints } from '../domain/arc-links';
export default function ProjectSteps({ projectId }: { projectId: string }) {
  const project = stepsForProject(projectId);
  const [index, setIndex] = useState(0);
  if (!project) return null;
  const stage = project.stages[index];
  const requirementLink = (item: string) => {
    const name = item.replace(/^[\d,]+[×x]\s*/, '');
    const hint = materialArcHints.find((hint) => hint.material === name);
    return (
      <>
        {item}
        {hint && (
          <small className="material-hint">
            <WikiLink entityId={hint.entityId}>Botín reportado de {hint.enemyName} →</WikiLink>{' '}
            <span className="confidence posible">posible</span>
          </small>
        )}
      </>
    );
  };
  const rewardLink = (reward: string) => {
    const name = reward.replace(/^[\d,]+[×x]\s*/, '');
    const blueprint = catalog.entities.find(
      (entity) => entity.category === 'blueprint' && entity.name === name,
    );
    return blueprint ? <WikiLink entityId={blueprint.id}>{reward} →</WikiLink> : reward;
  };
  return (
    <section className="combat-tool project-steps">
      <h3>Etapas, entregas y recompensas</h3>
      <p className="muted">
        Datos comunitarios por etapa. Las recompensas de planos se distinguen de las armas u objetos
        ya fabricados.
      </p>
      {project.availability === 'histórico' && (
        <p className="notice">
          Proyecto histórico. Estas recompensas describen su edición anterior; no se presentan como
          obtenibles ahora.
        </p>
      )}
      {project.availability === 'desconocido' && (
        <p className="notice">
          Disponibilidad actual sin confirmar. La ficha indica una fecha, pero no un horario de
          cierre.
        </p>
      )}
      {stage && (
        <>
          <label>
            Etapa del proyecto
            <select value={index} onChange={(event) => setIndex(Number(event.target.value))}>
              {project.stages.map((step, i) => (
                <option key={i} value={i}>
                  {step.name}
                </option>
              ))}
            </select>
          </label>
          <span className="confidence probable">probable</span>
          <div className="combat-pair">
            <div>
              <h4>Requisitos reportados</h4>
              {stage.requirements.length ? (
                <ul>
                  {stage.requirements.map((item, i) => (
                    <li key={i}>{requirementLink(item)}</li>
                  ))}
                </ul>
              ) : (
                <p>
                  Esta etapa se completa mediante un objetivo de actividad, no una entrega de
                  materiales.
                </p>
              )}
            </div>
            <div>
              <h4>Recompensas reportadas</h4>
              {stage.rewards.length ? (
                <ul>
                  {stage.rewards.map((item, i) => (
                    <li key={i}>{rewardLink(item)}</li>
                  ))}
                </ul>
              ) : (
                <p>No se especifica una recompensa individual en esta tabla.</p>
              )}
            </div>
          </div>
        </>
      )}
      {project.completion.length > 0 && (
        <details>
          <summary>Recompensas al completar el proyecto</summary>
          <ul>
            {project.completion.map((item, i) => (
              <li key={i}>{rewardLink(item)}</li>
            ))}
          </ul>
        </details>
      )}
      <Sources ids={[project.sourceId]} />
      <p className="muted">
        Las entregas del proyecto no son puntos de aparición de un plano en el mapa.
      </p>
    </section>
  );
}
