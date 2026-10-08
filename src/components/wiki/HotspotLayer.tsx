import {
  useCallback,
  useId,
  useState,
  type CSSProperties,
  type ReactNode,
  type MouseEvent,
} from 'react';
import { catalog } from '../../domain/catalog';
import {
  diagramKinds,
  resolveDiagramPoint,
  type Diagram,
  type DiagramPoint,
  type ResolvedDiagramPoint,
} from '../../domain/diagram-hotspots';
import { localImage } from '../../domain/images';
import { Sources } from '../../app/WikiContext';
import { DiagramFrame } from './DiagramFrame';
import { StatBars } from './StatBars';

interface HotspotProps {
  diagram: Diagram | undefined;
  fallback: ReactNode;
  selectedId?: string | null;
  panelContent?: ReactNode;
  onSelect?: (point: DiagramPoint) => void;
  renderPanel?: (data: ResolvedDiagramPoint, point: DiagramPoint) => ReactNode;
}
const diagramEditorEnabled = () =>
  import.meta.env.DEV &&
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).get('editar-diagrama') === '1';
export function HotspotLayer(props: HotspotProps) {
  if (!props.diagram || (!props.diagram.puntos.length && !diagramEditorEnabled()))
    return <>{props.fallback}</>;
  return (
    <DiagramImage
      key={`${props.diagram.entityId}:${props.diagram.imageUrl}`}
      {...props}
      diagram={props.diagram}
    />
  );
}
function DiagramImage({
  diagram,
  selectedId,
  onSelect,
  renderPanel,
  panelContent,
}: HotspotProps & { diagram: Diagram }) {
  const [internalId, setInternalId] = useState(diagram.puntos[0]?.id ?? '');
  const [imageState, setImageState] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [dimensions, setDimensions] = useState({ width: 512, height: 512 });
  const [coordinates, setCoordinates] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  const panelId = useId();
  const entity = catalog.entities.find((entity) => entity.id === diagram.entityId);
  const selected =
    selectedId === null
      ? undefined
      : (diagram.puntos.find((point) => point.id === (selectedId ?? internalId)) ??
        diagram.puntos[0]);
  const data = selected ? resolveDiagramPoint(diagram.entityId, selected) : null;
  const editor = diagramEditorEnabled();
  const loaded = useCallback((image: HTMLImageElement | null) => {
    if (image?.complete && image.naturalWidth > 0) {
      setImageState('ready');
      setDimensions({ width: image.naturalWidth, height: image.naturalHeight });
    }
  }, []);
  const registerPosition = async (event: MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x =
      event.detail === 0
        ? 50
        : Math.min(100, Math.max(0, ((event.clientX - rect.left) * 100) / rect.width));
    const y =
      event.detail === 0
        ? 50
        : Math.min(100, Math.max(0, ((event.clientY - rect.top) * 100) / rect.height));
    const text = `x: ${x.toFixed(2)}, y: ${y.toFixed(2)}`;
    setCoordinates(text);
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus('Posición copiada.');
    } catch {
      setCopyStatus('No se pudo copiar. Copiá la posición mostrada manualmente.');
    }
  };
  return (
    <div className="diagram-layout">
      <div>
        <DiagramFrame>
          <div className="diagram-image-plane" data-editor={editor ? '' : undefined}>
            {imageState === 'loading' && <span className="image-skeleton" aria-hidden="true" />}
            {imageState === 'failed' ? (
              <p role="status" className="diagram-image-error">
                No se pudo cargar la imagen. Los datos y sus fuentes siguen disponibles en el panel.
              </p>
            ) : (
              <img
                ref={loaded}
                src={localImage(diagram.imageUrl)}
                alt={entity?.name ?? 'Imagen del archivo'}
                width={dimensions.width}
                height={dimensions.height}
                decoding="async"
                onLoad={(event) => loaded(event.currentTarget)}
                onError={() => setImageState('failed')}
              />
            )}
            {imageState === 'ready' && (
              <>
                {editor && (
                  <button
                    type="button"
                    className="diagram-editor-plane"
                    aria-label="Registrar posición en la imagen; con teclado se registra el centro"
                    onClick={(event) => void registerPosition(event)}
                  />
                )}
                {diagram.puntos.map((point, index) => {
                  const resolved = resolveDiagramPoint(diagram.entityId, point);
                  return (
                    <div
                      key={point.id}
                      className={`diagram-reveal diagram-kind-${resolved.kind}`}
                      style={{ '--diagram-order': index } as CSSProperties}
                    >
                      <svg
                        className="diagram-guide"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                      >
                        <line
                          x1={point.x}
                          y1={point.y}
                          x2={point.lx}
                          y2={point.ly}
                          vectorEffect="non-scaling-stroke"
                        />
                      </svg>
                      <span
                        className="diagram-label"
                        aria-hidden="true"
                        style={{
                          left: `${point.lx}%`,
                          top: `${point.ly}%`,
                          maxWidth: `${Math.min(42, point.lx * 2, (100 - point.lx) * 2)}%`,
                        }}
                      >
                        {resolved.label}
                      </span>
                      <button
                        type="button"
                        className="diagram-hotspot"
                        aria-label={`${resolved.label} · ${diagramKinds[resolved.kind]}`}
                        aria-pressed={selected?.id === point.id}
                        aria-controls={panelId}
                        style={{ left: `${point.x}%`, top: `${point.y}%` }}
                        onClick={() => {
                          if (selectedId === undefined) setInternalId(point.id);
                          onSelect?.(point);
                        }}
                      >
                        <span aria-hidden="true" />
                      </button>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </DiagramFrame>
        <p className="diagram-notice">
          Los dibujos son orientativos y no reproducen las zonas exactas de impacto.
        </p>
        {editor && (
          <div className="diagram-editor">
            <p>
              Editor de desarrollo: hacé clic sobre la imagen para mostrar y copiar x, y en
              porcentaje. Estas posiciones no son medidas del juego.
            </p>
            <output>{coordinates}</output>
            <p role="status">{copyStatus}</p>
          </div>
        )}
      </div>
      <div id={panelId} className="diagram-panel" aria-live="polite" aria-atomic="true">
        <div
          key={selected?.id ?? 'sin-puntos'}
          className={panelContent !== undefined ? undefined : 'diagram-panel-entry'}
        >
          {panelContent !== undefined ? (
            panelContent
          ) : !data || !selected ? (
            <p>Pendiente de verificar</p>
          ) : renderPanel ? (
            renderPanel(data, selected)
          ) : (
            <>
              <span className="section-kicker">{diagramKinds[data.kind]}</span>
              <h3>{data.label}</h3>
              <span className={`confidence ${data.confidence.replaceAll(' ', '-')}`}>
                {data.confidence}
              </span>
              {data.zone ? (
                <>
                  {data.zone.condition && (
                    <p>
                      <strong>Cuándo:</strong> {data.zone.condition}
                    </p>
                  )}
                  <p>{data.zone.description || 'Pendiente de verificar'}</p>
                  {data.zone.evidence && <p>{data.zone.evidence}</p>}
                </>
              ) : data.claim ? (
                <>
                  <p className="diagram-value">
                    {data.claim.value === null
                      ? 'Pendiente de verificar'
                      : `${data.claim.value}${data.claim.unit ? ` ${data.claim.unit}` : ''}`}
                  </p>
                  {entity && <StatBars claim={data.claim} category={entity.category} />}
                  {data.claim.note && <p>{data.claim.note}</p>}
                  <p className="bar-legend">
                    Las barras comparan el mismo campo y unidad del archivo; no representan límites
                    del juego.
                  </p>
                </>
              ) : (
                <p>Pendiente de verificar</p>
              )}
              {data.sourceIds.length > 0 && <Sources ids={data.sourceIds} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
