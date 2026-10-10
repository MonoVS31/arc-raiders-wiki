import { useId, useState } from 'react';
import { DiagramFrame } from './wiki/DiagramFrame';
import { HotspotLayer } from './wiki/HotspotLayer';
import { diagramFor, type DiagramPoint } from '../domain/diagram-hotspots';
import { readAtlasData } from '../domain/data-loader';
import { zonesForARC, type ARCZone } from '../domain/arc-zones';
import { WikiLink, Sources } from '../app/WikiContext';
import { arcMapReports } from '../domain/arc-links';
import { standaloneViewer } from '../domain/standalone-weapons';
const kinds = {
  weak: 'Zona débil reportada',
  protected: 'Protección reportada',
  unarmored: 'Sin blindaje declarado',
  unknown: 'Sin dato específico',
};
export default function ARCZoneExplorer({ entityId }: { entityId: string }) {
  const enemy = zonesForARC(entityId);
  const diagram = diagramFor(entityId);
  // Con boceto 3D propio no se usa el retrato del juego: quedan el esquema y las piezas.
  const photo = diagram?.puntos.length && !standaloneViewer(entityId) ? diagram : undefined;
  const [selectedId, setSelectedId] = useState(enemy?.zones[0]?.id ?? '');
  const [pointId, setPointId] = useState<string | null>(null);
  const titleId = useId(),
    detailId = useId();
  if (!enemy) return null;
  const selected = enemy.zones.find((zone) => zone.id === selectedId) ?? enemy.zones[0]!;
  const pointMatches = (point: DiagramPoint) =>
    'zoneId' in point.ref && point.ref.zoneId === selected.id;
  const selectedPoint =
    photo?.puntos.find((point) => point.id === pointId && pointMatches(point)) ??
    photo?.puntos.find(pointMatches);
  const select = (zone: ARCZone) => {
    setSelectedId(zone.id);
    setPointId(null);
  };
  const selectPoint = (point: DiagramPoint) => {
    if ('zoneId' in point.ref) setSelectedId(point.ref.zoneId);
    setPointId(point.id);
  };
  const diagramButton = (zone: ARCZone, position: string, label = zone.label) => (
    <button
      type="button"
      key={position}
      className={`zone-point diagram-hotspot ${position} ${zone.kind}`}
      aria-label={`${label} · ${kinds[zone.kind]}`}
      aria-pressed={selected.id === zone.id}
      aria-controls={detailId}
      onClick={() => select(zone)}
    >
      <span aria-hidden="true" />
    </button>
  );
  const thruster = (front: boolean) =>
    enemy.zones.find((zone) => zone.id === (front ? 'front' : 'rear')) ??
    enemy.zones.find((zone) => zone.id === 'thrusters') ??
    selected;
  const weak = enemy.zones.find((zone) => zone.kind === 'weak')!;
  const protection = enemy.zones.find((zone) => zone.kind === 'protected');
  const reports = arcMapReports.find((report) => report.entityId === entityId)?.maps ?? [];
  const portraits = readAtlasData<{
    sourceId: string;
    portraits: { entityId: string; imageUrl: string }[];
  }>('arc-portraits.json');
  const visuals =
    readAtlasData<{ entityId: string; url: string; sourceId: string }[]>('entity-visuals.json');
  const imageSource = portraits.portraits.some(
    (image) => image.entityId === entityId && image.imageUrl === photo?.imageUrl,
  )
    ? portraits.sourceId
    : visuals.find((image) => image.entityId === entityId && image.url === photo?.imageUrl)
        ?.sourceId;
  const options = (
    <div className="zone-options" aria-label="Piezas del ARC">
      {enemy.zones.map((zone) => (
        <button
          type="button"
          key={zone.id}
          className={`zone-option ${zone.kind}`}
          aria-pressed={selected.id === zone.id}
          aria-controls={detailId}
          onClick={() => select(zone)}
        >
          <span className="zone-kind">{kinds[zone.kind]}</span>
          <strong>{zone.label}</strong>
        </button>
      ))}
    </div>
  );
  const detail = (
    <div
      id={detailId}
      className={`zone-detail diagram-panel-entry ${selected.kind}`}
      key={selected.id}
    >
      <span className="zone-kind">{kinds[selected.kind]}</span>
      <h5>{selected.label}</h5>
      <span className={`confidence ${selected.confidence.replaceAll(' ', '-')}`}>
        {selected.confidence}
      </span>
      {selected.kind === 'unknown' && <p className="unknown">Pendiente de verificar</p>}
      {photo && !selectedPoint && (
        <p className="muted">Posición en este retrato: Pendiente de verificar.</p>
      )}
      {selected.condition && (
        <p className="zone-condition">
          <strong>Cuándo:</strong> {selected.condition}
        </p>
      )}
      <p>{selected.description}</p>
      <Sources ids={enemy.sourceIds} />
    </div>
  );
  const schematic = (
    <>
      {enemy.layout === 'drone-four' && (
        <div className="zone-diagram drone-diagram diagram-reveal">
          <span className="diagram-orientation">FRENTE ↑</span>
          <svg viewBox="0 0 300 190" aria-hidden="true">
            <path
              d="M95 55L150 95L205 55M95 135L150 95L205 135"
              stroke="currentColor"
              strokeWidth="12"
            />
            <rect
              x="120"
              y="65"
              width="60"
              height="60"
              rx="20"
              fill="var(--color-surface-raised)"
              stroke="currentColor"
            />
          </svg>
          {diagramButton(thruster(true), 'front-left', 'Propulsor delantero izquierdo')}
          {diagramButton(thruster(true), 'front-right', 'Propulsor delantero derecho')}
          {diagramButton(thruster(false), 'rear-left', 'Propulsor trasero izquierdo')}
          {diagramButton(thruster(false), 'rear-right', 'Propulsor trasero derecho')}
          {enemy.zones.some((zone) => zone.id === 'tank') &&
            diagramButton(
              enemy.zones.find((zone) => zone.id === 'tank')!,
              'center-point',
              'Depósito de combustible',
            )}
        </div>
      )}
      {enemy.layout === 'shell-core' && (
        <div className="zone-diagram shell-diagram diagram-reveal">
          <svg viewBox="0 0 300 190" aria-hidden="true">
            <circle
              cx="150"
              cy="95"
              r="72"
              fill="var(--color-surface-raised)"
              stroke="var(--color-armor)"
              strokeWidth="12"
            />
            <circle
              cx="150"
              cy="95"
              r="28"
              fill="var(--color-weak-point-glow)"
              stroke="var(--color-weak-point)"
            />
          </svg>
          {protection && diagramButton(protection, 'shell-point', 'Carcasa o blindaje')}
          {weak && diagramButton(weak, 'center-point', 'Núcleo cuando queda expuesto')}
        </div>
      )}
      {enemy.layout === 'components' && (
        <div className="diagram-components diagram-reveal">{options}</div>
      )}
    </>
  );
  return (
    <section className="arc-zones" aria-labelledby={titleId}>
      <h4 id={titleId}>Zonas y condiciones de combate</h4>
      <p className="muted">
        Elegí una pieza para ver su función y cuándo queda expuesta.
        {!photo && ' Los dibujos son orientativos y no reproducen las zonas exactas de impacto.'}
      </p>
      {photo ? (
        <>
          <HotspotLayer
            diagram={photo}
            selectedId={selectedPoint?.id ?? null}
            onSelect={selectPoint}
            panelContent={detail}
            fallback={null}
          />
          {imageSource && (
            <p className="diagram-attribution">
              Referencia visual vía MetaForge · Assets © Embark Studios.{' '}
              <Sources ids={[imageSource]} label="Procedencia de la imagen" />
            </p>
          )}
        </>
      ) : (
        <div className="diagram-layout">
          <DiagramFrame className="arc-schematic-frame">{schematic}</DiagramFrame>
          <div className="diagram-panel" aria-live="polite" aria-atomic="true">
            {detail}
          </div>
        </div>
      )}
      {(photo || enemy.layout !== 'components') && options}
      {enemy.resistances.length > 0 && (
        <details className="anatomy-table">
          <summary>Tabla de anatomía comunitaria · valores sin corroborar</summary>
          <p>
            La ficha publica estos porcentajes, pero falta evidencia primaria que permita
            confirmarlos. Se muestran como referencia y no se utilizan para calcular daño.
          </p>
          <div className="combat-table">
            <table>
              <thead>
                <tr>
                  <th>Pieza</th>
                  <th>Blindaje</th>
                  <th>Resistencia física declarada</th>
                  <th>Resistencia explosiva declarada</th>
                </tr>
              </thead>
              <tbody>
                {enemy.resistances.map((row) => (
                  <tr key={row.part}>
                    <th>{row.part}</th>
                    <td>{row.armor}</td>
                    <td>{row.physical}</td>
                    <td>{row.explosive}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <span className="confidence no-confirmado">no confirmado</span>
          <Sources ids={enemy.sourceIds} label="Evidencia de la anatomía" />
        </details>
      )}
      <div className="arc-map-links">
        <h4>Mapas con reportes de esta máquina</h4>
        <p className="muted">
          Reportes posibles de la caché comunitaria; no garantizan presencia en una partida. La
          falta de un reporte no demuestra ausencia.
        </p>
        {reports.length > 0 ? (
          reports.map((report) => (
            <div key={report.mapId}>
              <WikiLink entityId={report.mapId} arcId={entityId}>
                {report.mapName} · {report.count} reportes →
              </WikiLink>{' '}
              <span className="confidence posible">posible</span>
            </div>
          ))
        ) : (
          <p>No hay reportes de esta máquina en la caché revisada.</p>
        )}
      </div>
    </section>
  );
}
