import { useState } from 'react';
import { zonesForARC, type ARCZone } from '../domain/arc-zones';
import { WikiLink, Sources } from '../app/WikiContext';
import { arcMapReports } from '../domain/arc-links';
const kinds = {
  weak: 'Zona débil reportada',
  protected: 'Protección reportada',
  unarmored: 'Sin blindaje declarado',
  unknown: 'Sin dato específico',
};
export default function ARCZoneExplorer({ entityId }: { entityId: string }) {
  const enemy = zonesForARC(entityId);
  const [selectedId, setSelectedId] = useState(enemy?.zones[0]?.id ?? '');
  if (!enemy) return null;
  const selected = enemy.zones.find((zone) => zone.id === selectedId) ?? enemy.zones[0]!;
  const select = (zone: ARCZone) => setSelectedId(zone.id);
  const diagramButton = (zone: ARCZone, position: string, label = zone.label) => (
    <button
      type="button"
      key={position}
      className={`zone-point ${position} ${zone.kind}`}
      aria-label={label}
      aria-pressed={selected.id === zone.id}
      onClick={() => select(zone)}
    >
      <span aria-hidden="true">●</span>
    </button>
  );
  const thruster = (front: boolean) =>
    enemy.zones.find((zone) => zone.id === (front ? 'front' : 'rear')) ??
    enemy.zones.find((zone) => zone.id === 'thrusters') ??
    selected;
  const weak = enemy.zones.find((zone) => zone.kind === 'weak')!;
  const protection = enemy.zones.find((zone) => zone.kind === 'protected');
  const reports = arcMapReports.find((report) => report.entityId === entityId)?.maps ?? [];
  return (
    <section className="arc-zones" aria-labelledby="zones-title">
      <h4 id="zones-title">Zonas y condiciones de combate</h4>
      <p className="muted">
        Elegí una pieza para ver su función y cuándo queda expuesta. Los dibujos son orientativos y
        no reproducen las zonas exactas de impacto.
      </p>
      {enemy.layout === 'drone-four' && (
        <div className="zone-diagram drone-diagram">
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
              fill="#263d31"
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
        <div className="zone-diagram shell-diagram">
          <svg viewBox="0 0 300 190" aria-hidden="true">
            <circle cx="150" cy="95" r="72" fill="#203329" stroke="#bda277" strokeWidth="12" />
            <circle cx="150" cy="95" r="28" fill="#d9ed9933" stroke="#d9ed99" />
          </svg>
          {protection && diagramButton(protection, 'shell-point', 'Carcasa o blindaje')}
          {diagramButton(weak, 'center-point', 'Núcleo cuando queda expuesto')}
        </div>
      )}
      <div className="zone-options" aria-label="Piezas del ARC">
        {enemy.zones.map((zone) => (
          <button
            type="button"
            key={zone.id}
            className={`zone-option ${zone.kind}`}
            aria-pressed={selected.id === zone.id}
            onClick={() => select(zone)}
          >
            <span className="zone-kind">{kinds[zone.kind]}</span>
            <strong>{zone.label}</strong>
          </button>
        ))}
      </div>
      <div className={`zone-detail ${selected.kind}`} key={selected.id} aria-live="polite">
        <h5>{selected.label}</h5>
        <span className={`confidence ${selected.confidence.replaceAll(' ', '-')}`}>
          {selected.confidence}
        </span>
        {selected.condition && (
          <p className="zone-condition">
            <strong>Cuándo:</strong> {selected.condition}
          </p>
        )}
        <p>{selected.description}</p>
        <Sources ids={enemy.sourceIds} />
      </div>
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
