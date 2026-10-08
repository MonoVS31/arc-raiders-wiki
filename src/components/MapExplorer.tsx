import { updateMarkerSelection } from '../domain/map-markers';
import '../styles/leaflet.css';
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { DiagramFrame } from './wiki/DiagramFrame';
import { MapDiagramOverlay } from './wiki/MapDiagramOverlay';
import { traceForMap } from '../domain/map-diagrams';
import type * as Leaflet from 'leaflet';
import {
  arcIdForSubtype,
  calibration,
  loadMapSnapshot,
  mapManifest,
  markerMatches,
  type MapConfig,
  type MapFilters,
  type MapMarker,
  type MapSnapshot,
} from '../domain/maps';
import { routeForBlueprint } from '../domain/blueprints';
import { catalog } from '../domain/catalog';
import { Sources } from '../app/WikiContext';
import { claimsFor } from '../domain/query';

const kindNames = {
  'weapon-case': 'Cajas de armas',
  arc: 'Enemigos ARC',
  cache: 'Caches',
  'quest-objective': 'Objetivos de misión',
} as const;
const colors = {
  'weapon-case': '#d9ed99',
  arc: '#f29979',
  cache: '#80cfc5',
  'quest-objective': '#b5adf0',
} as const;
const sourceDate = (value: string) =>
  new Intl.DateTimeFormat('es-AR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'America/Buenos_Aires',
  }).format(new Date(value));

function MapCanvas({
  config,
  floorId,
  markers,
  selectedId,
  onSelect,
  trace,
  layoutRef,
  detailRef,
}: {
  config: MapConfig;
  floorId: string;
  markers: MapMarker[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  trace: MapMarker[];
  layoutRef: RefObject<HTMLDivElement | null>;
  detailRef: RefObject<HTMLElement | null>;
}) {
  const host = useRef<HTMLDivElement>(null),
    mapRef = useRef<Leaflet.Map | null>(null),
    libraryRef = useRef<typeof Leaflet | null>(null);
  const layerRef = useRef<Leaflet.TileLayer | null>(null),
    pointsRef = useRef<Leaflet.LayerGroup | null>(null);
  const markerCache = useRef(new Map<string, Leaflet.CircleMarker>());
  const markerColors = useRef(new Map<string, string>());
  const previousSelection = useRef<string | null>(null);
  const selection = useRef(selectedId);
  selection.current = selectedId;
  const selectRef = useRef(onSelect);
  selectRef.current = onSelect;
  const [generation, setGeneration] = useState(0),
    [error, setError] = useState<string | null>(null),
    [tileError, setTileError] = useState(false);
  const ready = generation > 0;
  const reduced = useRef(false);
  useEffect(() => {
    const createdMarkers = markerCache.current;
    const createdColors = markerColors.current;
    let cancelled = false;
    let observer: ResizeObserver | undefined;
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    void import('leaflet')
      .then((L) => {
        if (cancelled || !host.current) return;
        libraryRef.current = L;
        const c = calibration(config),
          crs = L.extend({}, L.CRS.Simple, {
            transformation: new L.Transformation(c.sx, c.ox, c.sy, c.oy),
          });
        const bounds = L.latLngBounds([
          [-c.oy / c.sy, -c.ox / c.sx],
          [(config.tileSize - c.oy) / c.sy, (config.tileSize - c.ox) / c.sx],
        ]);
        const map = L.map(host.current, {
          crs,
          preferCanvas: true,
          center: config.center,
          zoom: config.initialZoom,
          minZoom: config.minZoom,
          maxZoom: config.maxZoom + 2,
          zoomSnap: 0.25,
          zoomDelta: 0.5,
          maxBounds: bounds,
          maxBoundsViscosity: 1,
          scrollWheelZoom: false,
          zoomAnimation: !reduced.current,
          fadeAnimation: !reduced.current,
          markerZoomAnimation: !reduced.current,
        });
        mapRef.current = map;
        pointsRef.current = L.layerGroup().addTo(map);
        observer = new ResizeObserver(() => map.invalidateSize({ animate: false }));
        observer.observe(host.current);
        setGeneration((current) => current + 1);
      })
      .catch(
        () =>
          !cancelled &&
          setError(
            'No se pudo iniciar el visor. Podés consultar la fuente y la lista de ubicaciones.',
          ),
      );
    return () => {
      cancelled = true;
      observer?.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
      libraryRef.current = null;
      pointsRef.current = null;
      createdMarkers.clear();
      createdColors.clear();
      previousSelection.current = null;
    };
  }, [config]);
  useEffect(() => {
    const L = libraryRef.current,
      map = mapRef.current;
    if (generation === 0 || !L || !map) return;
    const floor = config.floors.find((floor) => floor.id === floorId);
    if (!floor) return;
    layerRef.current?.remove();
    setTileError(false);
    const c = calibration(config),
      bounds = L.latLngBounds([
        [-c.oy / c.sy, -c.ox / c.sx],
        [(config.tileSize - c.oy) / c.sy, (config.tileSize - c.ox) / c.sx],
      ]);
    const layer = L.tileLayer(floor.tiles, {
      tileSize: config.tileSize,
      minZoom: config.minZoom,
      maxNativeZoom: config.maxZoom,
      maxZoom: config.maxZoom + 2,
      noWrap: true,
      bounds,
      keepBuffer: 1,
      attribution:
        '<a href="https://metaforge.app/arc-raiders" target="_blank" rel="noreferrer">MetaForge</a> · © Embark Studios',
    }).addTo(map);
    layer.on('tileerror', () => setTileError(true));
    layerRef.current = layer;
    return () => {
      layer.off('tileerror');
      layer.remove();
    };
  }, [config, floorId, generation]);
  useEffect(() => {
    const L = libraryRef.current,
      group = pointsRef.current;
    if (generation === 0 || !L || !group) return;
    group.clearLayers();
    markerCache.current.clear();
    markerColors.current.clear();
    for (const point of markers) {
      const dot = L.circleMarker([point.lat, point.lng], {
        radius: point.id === selection.current ? 10 : 6,
        color: point.id === selection.current ? '#fff' : colors[point.kind],
        weight: 2,
        fillColor: colors[point.kind],
        fillOpacity: 0.8,
      });
      const label = document.createElement('span');
      label.textContent = point.label + ' · posible';
      dot.bindTooltip(label);
      dot.on('click', () => selectRef.current(point.id));
      dot.addTo(group);
      markerCache.current.set(point.id, dot);
      markerColors.current.set(point.id, colors[point.kind]);
    }
  }, [markers, generation]);
  useEffect(() => {
    updateMarkerSelection(
      markerCache.current,
      markerColors.current,
      previousSelection.current,
      selectedId,
    );
    previousSelection.current = selectedId;
  }, [selectedId, generation, markers]);
  useEffect(() => {
    const map = mapRef.current,
      point = markers.find((point) => point.id === selectedId);
    if (generation === 0 || !map || !point) return;
    map.flyTo([point.lat, point.lng], Math.max(map.getZoom(), config.initialZoom + 0.5), {
      animate: !reduced.current,
      duration: 0.45,
    });
  }, [selectedId, generation, config.initialZoom, markers]);
  return (
    <>
      <div className="map-controls">
        <button
          type="button"
          disabled={!ready}
          onClick={() =>
            mapRef.current?.setView(config.center, config.initialZoom, {
              animate: !reduced.current,
            })
          }
        >
          Centrar mapa
        </button>
        <span>Arrastrá para mover · +/− para zoom · flechas con el mapa enfocado</span>
      </div>
      <DiagramFrame className="map-diagram-frame">
        <div className="map-diagram-surface">
          <div
            ref={host}
            className="map-canvas"
            role="region"
            aria-label={`Mapa interactivo de ${config.name}`}
          />
          <MapDiagramOverlay
            map={mapRef.current}
            selected={markers.find((marker) => marker.id === selectedId)}
            trace={trace}
            layoutRef={layoutRef}
            detailRef={detailRef}
          />
        </div>
      </DiagramFrame>
      {error && (
        <p role="alert" className="map-warning">
          {error}
        </p>
      )}
      {tileError && (
        <p className="map-warning">
          Algunas imágenes del proveedor no cargaron. La lista conserva los reportes y sus fuentes.
        </p>
      )}
    </>
  );
}

export default function MapExplorer({
  mapId,
  blueprintId,
  arcId,
}: {
  mapId: string;
  blueprintId?: string | undefined;
  arcId?: string | undefined;
}) {
  const config = mapManifest.maps.find((map) => map.id === mapId);
  if (!config) return <p className="notice">El mapa todavía no tiene cartografía revisada.</p>;
  return (
    <LoadedMap
      key={`${config.slug}:${blueprintId ?? ''}:${arcId ?? ''}`}
      config={config}
      blueprintId={blueprintId}
      arcId={arcId}
    />
  );
}
function LoadedMap({
  config,
  blueprintId,
  arcId,
}: {
  config: MapConfig;
  blueprintId?: string | undefined;
  arcId?: string | undefined;
}) {
  const route = blueprintId ? routeForBlueprint(blueprintId) : undefined;
  const layoutRef = useRef<HTMLDivElement>(null),
    detailRef = useRef<HTMLElement>(null);
  const [snapshot, setSnapshot] = useState<MapSnapshot | null>(null),
    [error, setError] = useState<string | null>(null),
    [retry, setRetry] = useState(0);
  const [floorId, setFloorId] = useState(config.defaultFloorId),
    [kind, setKind] = useState<MapFilters['kind']>(
      arcId ? 'arc' : route?.mapScope === 'quest' ? 'quest-objective' : 'weapon-case',
    );
  const [conditionBit, setConditionBit] = useState<number | null>(null),
    [query, setQuery] = useState(''),
    [selectedId, setSelectedId] = useState<string | null>(null);
  const floor = config.floors.find((floor) => floor.id === floorId) ?? config.floors[0]!;
  useEffect(() => {
    const abort = new AbortController();
    setError(null);
    loadMapSnapshot(config, abort.signal)
      .then((data) => setSnapshot(data))
      .catch((error) => {
        if (error instanceof Error && error.name !== 'AbortError')
          setError('No se pudo cargar la información del mapa. Intentá nuevamente.');
      });
    return () => abort.abort();
  }, [config, retry]);
  const questKey = route?.quest
    ?.replaceAll("'", '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
  const markers = useMemo(
    () =>
      snapshot?.markers.filter(
        (marker) =>
          markerMatches(marker, { kind, floorIndex: floor.index, conditionBit, query }) &&
          !(
            kind === 'quest-objective' &&
            route?.mapScope === 'quest' &&
            questKey &&
            marker.subtype !== questKey
          ) &&
          !(kind === 'arc' && arcId && arcIdForSubtype(marker.subtype) !== arcId),
      ) ?? [],
    [snapshot, kind, floor.index, conditionBit, query, route?.mapScope, questKey, arcId],
  );
  const selected = markers.find((marker) => marker.id === selectedId);
  const trace = useMemo(
    () => traceForMap(route, config, floorId, markers),
    [route, config, floorId, markers],
  );
  const arc =
    selected?.kind === 'arc'
      ? catalog.entities.find(
          (entity) => entity.id === arcIdForSubtype(selected.subtype) && entity.category === 'arc',
        )
      : undefined;
  const arcClaims = arc
    ? claimsFor(catalog, arc.id).filter((claim) =>
        ['punto débil', 'blindaje', 'consejo'].includes(claim.field),
      )
    : [];
  if (error)
    return (
      <p role="alert" className="notice">
        {error} <button onClick={() => setRetry((value) => value + 1)}>Reintentar</button>
      </p>
    );
  if (!snapshot)
    return (
      <p role="status" className="map-loading">
        Cargando mapa y reportes comunitarios…
      </p>
    );
  return (
    <section className="map-explorer" aria-label="Explorador de ubicaciones">
      <p className="map-note">
        Ubicaciones posibles de una fuente comunitaria. La posición del reporte se conserva; su
        aparición no está garantizada.
      </p>
      {arcId && (
        <aside className="route-focus">
          <strong>
            ARC objetivo: {catalog.entities.find((entity) => entity.id === arcId)?.name}
          </strong>
          <p>
            En la vista de enemigos se muestran solo los reportes de esta máquina para el piso
            seleccionado.
          </p>
        </aside>
      )}
      {route && (
        <aside className="route-focus">
          <strong>Plano objetivo: {route.name}</strong>
          <p>{route.note}</p>
          <p>
            {route.mapScope === 'quest'
              ? 'Los puntos son objetivos de la misión; el plano se recompensa al completarla.'
              : 'Este mapa muestra reportes de cajas y ARC. No representa posiciones exactas de ese plano.'}
          </p>
          <p className="map-trace-status">
            {trace.length > 1
              ? 'Trazo posible de reportes, en el orden respaldado por su fuente. No garantiza botín ni acceso.'
              : 'Recorrido con coordenadas ordenadas: Pendiente de verificar.'}
          </p>
          {trace.length > 1 && (
            <Sources
              ids={
                route.traces?.find(
                  (item) => item.mapSlug === config.slug && item.floorId === floorId,
                )?.sourceIds ?? []
              }
              label="Fuente del trazo"
            />
          )}
        </aside>
      )}
      <div className="map-filters">
        <label>
          Piso
          <select
            value={floorId}
            onChange={(event) => {
              setFloorId(event.target.value);
              setSelectedId(null);
            }}
          >
            {config.floors.map((floor) => (
              <option key={floor.id} value={floor.id}>
                {floor.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Mostrar
          <select
            value={kind}
            onChange={(event) => {
              setKind(event.target.value as MapFilters['kind']);
              setSelectedId(null);
            }}
          >
            <option value="all">Todos los reportes</option>
            {Object.entries(kindNames).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Etiqueta de evento
          <select
            value={conditionBit ?? 'all'}
            onChange={(event) => {
              setConditionBit(event.target.value === 'all' ? null : Number(event.target.value));
              setSelectedId(null);
            }}
          >
            <option value="all">Todas / sin filtrar</option>
            {config.conditions.map((condition) => (
              <option key={condition.bit} value={condition.bit}>
                {condition.name === 'No Event' ? 'Sin evento' : condition.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="map-search">
        Buscar reporte
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Nombre de ARC, caja o misión"
        />
      </label>
      <p role="status" className="result-count">
        {markers.length} reportes en esta selección · {floor.label}. Las etiquetas de evento no son
        reglas de aparición verificadas.
      </p>
      <div ref={layoutRef} className="map-diagram-layout">
        <div>
          <MapCanvas
            config={config}
            floorId={floorId}
            markers={markers}
            selectedId={selectedId}
            onSelect={setSelectedId}
            trace={trace}
            layoutRef={layoutRef}
            detailRef={detailRef}
          />
        </div>
        <div className="map-detail-column">
          {selected && (
            <section
              ref={detailRef}
              className="marker-detail"
              aria-label="Reporte seleccionado"
              aria-live="polite"
            >
              <div className="route-heading">
                <h4>{selected.label}</h4>
                <span className="confidence posible">posible</span>
              </div>
              <p>
                {kindNames[selected.kind]} ·{' '}
                {selected.behindLockedDoor
                  ? 'La fuente lo sitúa detrás de una puerta cerrada.'
                  : 'Acceso específico no verificado.'}
              </p>
              <p>
                {selected.layerMask === 2147483647
                  ? 'La fuente no asigna un piso exclusivo.'
                  : 'La fuente sitúa este reporte en el piso seleccionado.'}
              </p>
              {selected.kind === 'quest-objective' && (
                <p>Objetivo de misión; no es un punto de aparición del plano.</p>
              )}
              <p className="claim-note">
                Actualizado en la fuente:{' '}
                {selected.sourceUpdatedAt ? sourceDate(selected.sourceUpdatedAt) : 'sin fecha'}
              </p>
              <Sources ids={['metaforge-' + config.slug]} label="Procedencia del reporte" />
            </section>
          )}
          {!selected && (
            <aside className="marker-detail map-detail-placeholder">
              Elegí un reporte del mapa o de la lista para ver sus datos y fuentes.
            </aside>
          )}
        </div>
      </div>
      <div className="map-legend">
        {Object.entries(kindNames).map(([key, label]) => (
          <span key={key}>
            <i style={{ background: colors[key as keyof typeof colors] }} />
            {label}
          </span>
        ))}
      </div>
      {arc && (
        <section className="marker-detail" aria-label="Consejos contra el ARC">
          <h4>{arc.name} · combate</h4>
          {arcClaims.map((claim) => (
            <div className="claim" key={claim.id}>
              <div className="route-heading">
                <span>{claim.field}</span>
                <span className={`confidence ${claim.confidence.replaceAll(' ', '-')}`}>
                  {claim.confidence}
                </span>
              </div>
              <p>{claim.value === null ? 'Pendiente de verificar' : String(claim.value)}</p>
              <Sources ids={claim.sourceIds} />
            </div>
          ))}
        </section>
      )}
      <details className="map-reports">
        <summary>Lista accesible de ubicaciones ({markers.length})</summary>
        <ul>
          {markers.map((marker) => (
            <li key={marker.id}>
              <button
                type="button"
                aria-pressed={marker.id === selectedId}
                onClick={() => setSelectedId(marker.id)}
              >
                {marker.label} <small>{kindNames[marker.kind]} · posible</small>
              </button>
            </li>
          ))}
        </ul>
        {markers.length === 0 && (
          <p>
            No hay reportes con estos filtros. La ausencia de un registro no demuestra que no pueda
            aparecer.
          </p>
        )}
      </details>
      <p className="map-attribution">
        Datos y mapas: MetaForge · Material del juego © Embark Studios. Captura:{' '}
        {sourceDate(snapshot.retrievedAt)}.{' '}
        <Sources
          ids={['metaforge-' + config.slug, 'metaforge-calibration']}
          label="Créditos y procedencia"
        />
      </p>
    </section>
  );
}
