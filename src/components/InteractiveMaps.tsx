import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { mapManifest, type MapConfig } from '../domain/maps';
import { atlasAsset } from '../domain/assets';
import { catalog } from '../domain/catalog';
import { WikiLink } from '../app/WikiContext';
import {
  interactiveMapSchema,
  categoryFor,
  mapCategories,
  mapGroups,
  loadInteractiveMap,
  mapLink,
  emptyProgress,
  readProgress,
  saveProgress,
  type InteractiveMapData,
  type AtlasPoint,
  type MapProgress,
} from '../domain/interactive-maps';
import AtlasMapCanvas from './wiki/AtlasMapCanvas';
import { MapSymbol } from './wiki/MapSymbols';
import '../styles/interactive-maps.css';
const validSlug = () =>
  mapManifest.maps.find(
    (map) => map.slug === new URLSearchParams(window.location.search).get('mapa'),
  )?.slug ?? 'dam';
export default function InteractiveMaps() {
  const [slug, setSlug] = useState(validSlug);
  useEffect(() => {
    const pop = () => setSlug(validSlug());
    window.addEventListener('popstate', pop);
    return () => window.removeEventListener('popstate', pop);
  }, []);
  const config = mapManifest.maps.find((map) => map.slug === slug)!;
  return (
    <section className="atlas-maps" aria-label="Mapas interactivos">
      <div className="atlas-map-heading">
        <div>
          <span className="section-kicker">CARTOGRAFÍA / ARCHIVO LOCAL</span>
          <h1>Mapas interactivos</h1>
        </div>
        <WikiLink entityId={config.id}>Ficha de {config.name} →</WikiLink>
      </div>
      <LoadedInteractiveMap
        key={slug}
        config={config}
        changeMap={(next) => {
          window.history.pushState(
            window.history.state,
            '',
            mapLink(
              window.location.href,
              next,
              undefined,
              new URLSearchParams(window.location.search).get('editor') === '1',
            ),
          );
          setSlug(next as typeof slug);
        }}
      />
    </section>
  );
}
type Tool = 'point' | 'note' | 'move' | 'high' | 'medium' | 'low' | 'zipline' | null;
type Form = {
  x: number;
  y: number;
  categoria: string;
  titulo: string;
  descripcion: string;
  id?: string;
  note?: boolean;
  geometry?: boolean;
};
function FormattedDescription({ text }: { text: string }) {
  return (
    <div className="atlas-description">
      {text.split('\n').map((line, index) => (
        <p key={index}>
          {line.startsWith('- ') ? '• ' : ''}
          {(line.startsWith('- ') ? line.slice(2) : line)
            .split(/(\*\*[^*]+\*\*)/g)
            .map((part, i) =>
              part.startsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : part,
            )}
        </p>
      ))}
    </div>
  );
}
function LoadedInteractiveMap({
  config,
  changeMap,
}: {
  config: MapConfig;
  changeMap: (slug: string) => void;
}) {
  const [data, setData] = useState<InteractiveMapData | null>(null),
    [error, setError] = useState(''),
    [retry, setRetry] = useState(0);
  const [progress, setProgress] = useState<MapProgress>(() => {
    try {
      return readProgress(config.slug, window.localStorage);
    } catch {
      return emptyProgress();
    }
  });
  const [storageError, setStorageError] = useState(false),
    [left, setLeft] = useState(true),
    [right, setRight] = useState(true),
    [mobileFilters, setMobileFilters] = useState(false),
    [query, setQuery] = useState(''),
    [listLimit, setListLimit] = useState(30);
  const params = new URLSearchParams(window.location.search),
    editor = params.get('editor') === '1';
  const [selectedId, setSelectedId] = useState<string | null>(() => params.get('marcador')),
    [floor, setFloor] = useState(config.defaultFloorId),
    [reset, setReset] = useState(false),
    [restoreDraft, setRestoreDraft] = useState(false),
    [tool, setTool] = useState<Tool>(null),
    [form, setForm] = useState<Form | null>(null),
    [vertices, setVertices] = useState<[number, number][]>([]),
    [message, setMessage] = useState(''),
    [expandedImage, setExpandedImage] = useState<string | null>(null);
  const dialogOpen = !!form || !!expandedImage;

  useEffect(() => {
    if (!dialogOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const dialog = document.querySelector<HTMLElement>(
      '.atlas-form-backdrop, .atlas-image-fullscreen',
    );
    dialog?.querySelector<HTMLElement>('input, button')?.focus();
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setForm(null);
        setExpandedImage(null);
      }
      if (event.key !== 'Tab' || !dialog) return;
      const controls = Array.from(
        dialog.querySelectorAll<HTMLElement>('button, input, select, textarea, a[href]'),
      );
      const index = controls.indexOf(document.activeElement as HTMLElement);
      if (event.shiftKey && index <= 0) {
        event.preventDefault();
        controls.at(-1)?.focus();
      } else if (!event.shiftKey && index === controls.length - 1) {
        event.preventDefault();
        controls[0]?.focus();
      }
    };
    document.addEventListener('keydown', keyboard);
    return () => {
      document.removeEventListener('keydown', keyboard);
      previous?.focus();
    };
  }, [dialogOpen]);

  const initialRequest = useRef({ selectedId, draft: progress.draft });
  const dataset = progress.draft ?? data,
    points = useMemo(() => dataset?.marcadores ?? [], [dataset]);
  const exportedData = useMemo(() => JSON.stringify(dataset, null, 2), [dataset]);
  const [hidden, setHidden] = useState<string[]>(() =>
    params.has('categorias')
      ? mapCategories
          .filter((category) => !params.get('categorias')!.split(',').includes(category.id))
          .map((category) => category.id)
      : progress.hidden,
  );
  useEffect(() => {
    const abort = new AbortController();
    loadInteractiveMap(config.slug, abort.signal)
      .then((value) => {
        setData(value);
        setError('');
        const point = (initialRequest.current.draft ?? value).marcadores.find(
          (point) => point.id === initialRequest.current.selectedId,
        );
        if (point)
          setFloor(
            point.capas.includes(config.defaultFloorId) ? config.defaultFloorId : point.capa,
          );
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setError('No se pudo cargar este mapa. Podés reintentar.');
      });
    return () => abort.abort();
  }, [config, retry]);
  useEffect(() => {
    try {
      setStorageError(!saveProgress(config.slug, { ...progress, hidden }, window.localStorage));
    } catch {
      setStorageError(true);
    }
  }, [config.slug, progress, hidden]);
  const counts = useMemo(() => {
    const result = new Map<string, number>();
    for (const point of points) result.set(point.categoria, (result.get(point.categoria) ?? 0) + 1);
    for (const shape of [...(dataset?.zonas ?? []), ...(dataset?.lineas ?? [])])
      result.set(shape.categoria, (result.get(shape.categoria) ?? 0) + 1);
    return result;
  }, [dataset, points]);
  const selected = points.find((point) => point.id === selectedId);
  useEffect(() => {
    if (selected?.id)
      document
        .querySelector<HTMLButtonElement>('.atlas-marker-detail .atlas-detail-close')
        ?.focus({ preventScroll: true });
  }, [selected?.id]);
  const visible = useMemo(
    () =>
      points.filter(
        (point) =>
          point.capas.includes(floor) &&
          (point.id === selectedId ||
            (!hidden.includes(point.categoria) &&
              !(progress.hideFound && progress.found.includes(point.id)))),
      ),
    [points, floor, hidden, progress.hideFound, progress.found, selectedId],
  );
  const matches = useMemo(
    () =>
      points.filter((point) =>
        (point.titulo + ' ' + categoryFor(point.categoria).name)
          .toLocaleLowerCase('es')
          .includes(query.trim().toLocaleLowerCase('es')),
      ),
    [points, query],
  );
  const shapes = useMemo(
    () =>
      [...(dataset?.zonas ?? []), ...(dataset?.lineas ?? [])].filter(
        (shape) => shape.capa === floor && !hidden.includes(shape.categoria),
      ),
    [dataset, floor, hidden],
  );
  const choose = (point: AtlasPoint) => {
    setSelectedId(point.id);
    setFloor(point.capas.includes(floor) ? floor : point.capa);
    setHidden((values) => values.filter((id) => id !== point.categoria));
    setMobileFilters(false);
    const url = new URL(window.location.href);
    url.searchParams.delete('category');
    url.searchParams.set('mapa', config.slug);
    url.searchParams.set('marcador', point.id);
    window.history.replaceState(window.history.state, '', url);
  };
  const toggle = (ids: string[]) =>
    setHidden((values) =>
      ids.every((id) => values.includes(id))
        ? values.filter((id) => !ids.includes(id))
        : [...new Set([...values, ...ids])],
    );
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setMessage('Copiado.');
    } catch {
      setMessage(
        'No se pudo copiar automáticamente. Seleccioná el texto del campo de exportación.',
      );
    }
  };
  const exportData = () => exportedData;
  const download = () => {
    const url = URL.createObjectURL(new Blob([exportData()], { type: 'application/json' })),
      anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = config.slug + '.json';
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const draft = (value: InteractiveMapData) =>
    setProgress((current) => ({ ...current, draft: value }));
  const place = (x: number, y: number) => {
    if (tool === 'move' && selected && dataset) {
      draft({
        ...dataset,
        marcadores: points.map((point) =>
          point.id === selected.id
            ? {
                ...point,
                x,
                y,
                capa: floor,
                capas: [floor],
                evidencia: 'no confirmado',
                fuente: 'Borrador personal del editor; pendiente de verificar',
              }
            : point,
        ),
      });
      setTool(null);
      return;
    }
    if (tool === 'high' || tool === 'medium' || tool === 'low' || tool === 'zipline') {
      setVertices((values) => [...values, [x, y]]);
      return;
    }
    setForm({ x, y, categoria: 'misc', titulo: '', descripcion: '', note: tool === 'note' });
  };
  const saveForm = (event: FormEvent) => {
    event.preventDefault();
    if (!form || !dataset) return;
    if (form.note) {
      setProgress((value) => ({
        ...value,
        notes: [
          ...value.notes,
          { id: crypto.randomUUID(), x: form.x, y: form.y, capa: floor, text: form.titulo },
        ],
      }));
    } else if (
      form.geometry &&
      (tool === 'high' || tool === 'medium' || tool === 'low' || tool === 'zipline')
    ) {
      const shape = {
        id: crypto.randomUUID(),
        categoria: tool,
        capa: floor,
        titulo: form.titulo,
        puntos: vertices,
        fuente: 'Borrador personal del editor; pendiente de verificar',
        evidencia: 'no confirmado' as const,
      };
      draft({
        ...dataset,
        [tool === 'zipline' ? 'lineas' : 'zonas']: [
          ...(tool === 'zipline' ? dataset.lineas : dataset.zonas),
          shape,
        ],
      });
    } else {
      const point: AtlasPoint = {
        ...points.find((point) => point.id === form.id),
        id: form.id ?? crypto.randomUUID(),
        categoria: form.categoria,
        x: form.x,
        y: form.y,
        capa: floor,
        capas: [floor],
        titulo: form.titulo.trim(),
        descripcion: form.descripcion,
        fuente: 'Borrador personal del editor; pendiente de verificar',
        evidencia: 'no confirmado',
      };
      draft({
        ...dataset,
        marcadores: form.id
          ? points.map((item) => (item.id === form.id ? point : item))
          : [...points, point],
      });
      choose(point);
    }
    setForm(null);
    setTool(null);
    setVertices([]);
    setMessage('Guardado en este navegador. No se publica automáticamente.');
  };
  const closeDetail = () => {
    setSelectedId(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('marcador');
    window.history.replaceState(window.history.state, '', url);
  };
  if (error)
    return (
      <p role="alert">
        {error} <button onClick={() => setRetry((value) => value + 1)}>Reintentar</button>
      </p>
    );
  if (!dataset) return <p role="status">Cargando mapa y reportes…</p>;
  return (
    <>
      <p className="atlas-map-evidence">
        Reportes posibles: las posiciones originales se conservan y la aparición no está
        garantizada. Los dibujos y borradores personales son orientativos.{' '}
        <a href={data?.marcadores[0]?.fuente ?? config.sourceUrl} target="_blank" rel="noreferrer">
          Fuente del archivo ↗
        </a>
      </p>
      {storageError && (
        <p role="alert">
          El navegador no permite guardar cambios. Podés usar el mapa y descargar tus datos antes de
          salir.
        </p>
      )}
      <div
        className={`atlas-map-workspace ${left ? '' : 'filters-collapsed'} ${right ? '' : 'progress-collapsed'}`}
      >
        <button
          className="atlas-filter-tab"
          aria-label={left ? 'Plegar filtros' : 'Desplegar filtros'}
          aria-expanded={left}
          onClick={() => setLeft((value) => !value)}
        >
          {left ? '‹' : '›'}
        </button>
        <aside
          className={`atlas-filters ${mobileFilters ? 'drawer-open' : ''}`}
          aria-label="Filtros de mapas"
        >
          <div className="atlas-drawer-header">
            <strong>FILTROS</strong>
            <button aria-label="Cerrar filtros" onClick={() => setMobileFilters(false)}>
              ×
            </button>
          </div>
          <div className="atlas-map-picker">
            {mapManifest.maps.map((map) => (
              <button
                key={map.slug}
                aria-pressed={map.slug === config.slug}
                onClick={() => changeMap(map.slug)}
              >
                {map.name}
              </button>
            ))}
          </div>
          <div className="atlas-filter-actions">
            <button onClick={() => setHidden([])}>MOSTRAR TODO</button>
            <button onClick={() => setHidden(mapCategories.map((category) => category.id))}>
              OCULTAR TODO
            </button>
          </div>
          <label className="atlas-search">
            Buscar marcador
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setListLimit(30);
              }}
              placeholder="Nombre o categoría"
            />
          </label>
          {query && (
            <div className="atlas-search-results" aria-label="Resultados de búsqueda">
              <p>{matches.length} resultados</p>
              {matches.slice(0, listLimit).map((point) => (
                <button key={point.id} onClick={() => choose(point)}>
                  <MapSymbol category={point.categoria} />
                  <span>
                    {point.titulo}
                    <small>
                      {categoryFor(point.categoria).name} ·{' '}
                      {config.floors.find((layer) => layer.id === point.capa)?.label}
                    </small>
                  </span>
                </button>
              ))}
              {matches.length > listLimit && (
                <button onClick={() => setListLimit((value) => value + 30)}>
                  Ver más resultados
                </button>
              )}
            </div>
          )}
          {Object.entries(mapGroups).map(([id, group]) => {
            const categories = mapCategories.filter(
              (category) => category.group === id && counts.has(category.id),
            );
            if (!categories.length) return null;
            return (
              <section
                className="atlas-category-group"
                key={id}
                style={{ '--map-group-color': `var(--map-color-${id})` } as React.CSSProperties}
              >
                <button
                  className="atlas-group-title"
                  aria-pressed={!categories.every((category) => hidden.includes(category.id))}
                  onClick={() => toggle(categories.map((category) => category.id))}
                >
                  {group.name}
                </button>
                <div className="atlas-category-buttons">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      aria-pressed={!hidden.includes(category.id)}
                      onClick={() => toggle([category.id])}
                    >
                      <MapSymbol category={category.id} />
                      <span>{category.name}</span>
                      <small>{counts.get(category.id)}</small>
                    </button>
                  ))}
                </div>
              </section>
            );
          })}
          <details className="atlas-marker-list">
            <summary>Recorrer reportes con teclado ({points.length})</summary>
            {points.slice(0, listLimit).map((point) => (
              <button key={point.id} onClick={() => choose(point)}>
                {point.titulo}
              </button>
            ))}
            {points.length > listLimit && (
              <button onClick={() => setListLimit((value) => value + 50)}>Ver más reportes</button>
            )}
          </details>
        </aside>
        <div className="atlas-map-stage">
          <div className="atlas-layer-bar">
            <strong>{config.name}</strong>
            <label>
              Capa
              <select
                value={floor}
                onChange={(event) => {
                  setFloor(event.target.value);
                  closeDetail();
                  setVertices([]);
                }}
              >
                {config.floors.map((layer) => (
                  <option key={layer.id} value={layer.id}>
                    {layer.label === 'Subsuelo' ? 'Subterráneo' : layer.label}
                  </option>
                ))}
              </select>
            </label>
            <button aria-expanded={right} onClick={() => setRight((value) => !value)}>
              {right ? 'Ocultar progreso' : 'Progreso'}
            </button>
          </div>
          <AtlasMapCanvas
            config={config}
            floor={floor}
            points={visible}
            shapes={shapes}
            selected={selected}
            found={progress.found}
            notes={progress.notes}
            vertices={vertices}
            onSelect={choose}
            onPlace={place}
            placing={tool !== null}
          />
          <button className="atlas-mobile-filters" onClick={() => setMobileFilters(true)}>
            Filtros
          </button>
          {tool && (
            <div className="atlas-tool-status" role="status">
              <span>
                {tool === 'move'
                  ? 'Tocá la nueva posición.'
                  : tool === 'note'
                    ? 'Tocá el mapa para dejar una nota.'
                    : tool === 'point'
                      ? 'Tocá el mapa para agregar un marcador.'
                      : `Dibujando ${tool === 'zipline' ? 'línea' : 'zona'}: ${vertices.length} vértices. Tocá el mapa para agregar otro.`}
              </span>
              {['high', 'medium', 'low', 'zipline'].includes(tool) && (
                <button
                  disabled={vertices.length < (tool === 'zipline' ? 2 : 3)}
                  onClick={() =>
                    setForm({
                      x: 0,
                      y: 0,
                      categoria: tool,
                      titulo: '',
                      descripcion: '',
                      geometry: true,
                    })
                  }
                >
                  Terminar dibujo
                </button>
              )}
              <button
                onClick={() => {
                  setTool(null);
                  setVertices([]);
                }}
              >
                Cancelar
              </button>
            </div>
          )}
          {selected && !tool && (
            <section className="atlas-marker-detail" aria-label="Ficha del marcador">
              <button
                className="atlas-detail-close"
                aria-label="Cerrar marcador"
                onClick={closeDetail}
              >
                ×
              </button>
              {selected.imagen && (
                <button
                  className="atlas-marker-image"
                  onClick={() => setExpandedImage(selected.imagen!)}
                >
                  <img src={atlasAsset(selected.imagen)} alt={selected.titulo} />
                  <span>Ampliar imagen</span>
                </button>
              )}
              <div className="atlas-detail-title">
                <h2>{selected.titulo}</h2>
                <button
                  aria-label="Copiar enlace del marcador"
                  onClick={() => void copy(mapLink(window.location.href, config.slug, selected.id))}
                >
                  ↗
                </button>
              </div>
              <em>{categoryFor(selected.categoria).name}</em>
              <FormattedDescription text={selected.descripcion} />
              <small>
                {selected.evidencia} ·{' '}
                {selected.capas
                  .map((layer) => config.floors.find((item) => item.id === layer)?.label)
                  .join(' / ')}
              </small>
              <p>
                Fuente:{' '}
                {selected.fuente.startsWith('https:') ? (
                  <a href={selected.fuente} target="_blank" rel="noreferrer">
                    Consultar reporte ↗
                  </a>
                ) : (
                  selected.fuente
                )}
              </p>
              {selected.entityId &&
                catalog.entities.some((entity) => entity.id === selected.entityId) && (
                  <WikiLink entityId={selected.entityId}>Abrir ficha de la wiki →</WikiLink>
                )}
              <div className="atlas-detail-actions">
                <button
                  aria-pressed={progress.found.includes(selected.id)}
                  onClick={() =>
                    setProgress((value) => ({
                      ...value,
                      found: value.found.includes(selected.id)
                        ? value.found.filter((id) => id !== selected.id)
                        : [...value.found, selected.id],
                    }))
                  }
                >
                  {progress.found.includes(selected.id)
                    ? '✓ ENCONTRADO · Desmarcar'
                    : 'MARCAR COMO ENCONTRADO'}
                </button>
                <button
                  onClick={() => void copy(mapLink(window.location.href, config.slug, selected.id))}
                >
                  Copiar enlace
                </button>
              </div>
              {editor && (
                <div className="atlas-detail-actions">
                  <button
                    onClick={() =>
                      setForm({
                        x: selected.x,
                        y: selected.y,
                        categoria: selected.categoria,
                        titulo: selected.titulo,
                        descripcion: selected.descripcion,
                        id: selected.id,
                      })
                    }
                  >
                    Editar
                  </button>
                  <button onClick={() => setTool('move')}>Mover</button>
                  <button
                    onClick={() => {
                      draft({
                        ...dataset,
                        marcadores: points.filter((point) => point.id !== selected.id),
                      });
                      closeDetail();
                    }}
                  >
                    Borrar del borrador
                  </button>
                </div>
              )}
            </section>
          )}
        </div>
        <aside className="atlas-progress" aria-label="Progreso del mapa">
          <h2>PROGRESO</h2>
          <p>
            {points.filter((point) => progress.found.includes(point.id)).length}/{points.length}{' '}
            encontrados
          </p>
          <label>
            <input
              type="checkbox"
              checked={progress.hideFound}
              onChange={(event) =>
                setProgress((value) => ({ ...value, hideFound: event.target.checked }))
              }
            />{' '}
            Ocultar encontrados
          </label>
          {mapCategories
            .filter((category) => points.some((point) => point.categoria === category.id))
            .map((category) => {
              const total = points.filter((point) => point.categoria === category.id).length,
                found = points.filter(
                  (point) => point.categoria === category.id && progress.found.includes(point.id),
                ).length;
              return (
                <div className="atlas-progress-row" key={category.id}>
                  <span>
                    {category.name}{' '}
                    <small>
                      {found}/{total}
                    </small>
                  </span>
                  <progress aria-label={`Progreso de ${category.name}`} max={total} value={found} />
                </div>
              );
            })}
          <button onClick={() => setReset(true)}>Reiniciar progreso de este mapa</button>
          {reset && (
            <div className="atlas-confirm" role="group" aria-label="Confirmar reinicio">
              <p>¿Borrar los encontrados de {config.name}? Tus notas y borradores se conservan.</p>
              <button
                onClick={() => {
                  setProgress((value) => ({ ...value, found: [] }));
                  setReset(false);
                }}
              >
                Sí, reiniciar
              </button>
              <button onClick={() => setReset(false)}>Cancelar</button>
            </div>
          )}
          <button onClick={() => setTool('note')}>✎ Nota personal</button>
          {progress.notes.map((note) => (
            <div className="atlas-personal-note" key={note.id}>
              <p>{note.text}</p>
              <button
                onClick={() =>
                  setProgress((value) => ({
                    ...value,
                    notes: value.notes.filter((item) => item.id !== note.id),
                  }))
                }
              >
                Borrar nota
              </button>
            </div>
          ))}
          <p className="atlas-private-note">
            Tus encontrados, notas y borradores se guardan solo en este navegador, sin cuenta.
          </p>
          {editor && (
            <section className="atlas-editor">
              <h3>EDITOR PERSONAL</h3>
              <p>
                Los cambios aparecen al instante. No se publican y quedan pendientes de verificar.
              </p>
              <button onClick={() => setTool('point')}>Agregar marcador o nombre de lugar</button>
              <div className="atlas-editor-tools">
                {(['high', 'medium', 'low', 'zipline'] as const).map((value) => (
                  <button
                    key={value}
                    onClick={() => {
                      setTool(value);
                      setVertices([]);
                    }}
                  >
                    {value === 'zipline'
                      ? 'Dibujar tirolesa'
                      : `Zona ${categoryFor(value).name.toLowerCase()}`}
                  </button>
                ))}
              </div>
              {[...dataset.zonas, ...dataset.lineas].map((shape) => (
                <div key={shape.id}>
                  <span>{shape.titulo}</span>
                  <button
                    onClick={() =>
                      draft({
                        ...dataset,
                        zonas: dataset.zonas.filter((item) => item.id !== shape.id),
                        lineas: dataset.lineas.filter((item) => item.id !== shape.id),
                      })
                    }
                  >
                    Borrar dibujo
                  </button>
                </div>
              ))}
              <button onClick={() => void copy(exportData())}>Copiar datos</button>
              <button onClick={download}>Descargar JSON</button>
              {progress.draft && (
                <>
                  <button onClick={() => setRestoreDraft(true)}>Volver a datos publicados</button>
                  {restoreDraft && (
                    <div className="atlas-confirm" role="group" aria-label="Confirmar restauración">
                      <p>
                        Se reemplazará tu borrador por los reportes originales. Descargá el JSON si
                        querés conservarlo.
                      </p>
                      <button
                        onClick={() => {
                          setProgress((value) => {
                            const restored = { ...value };
                            delete restored.draft;
                            return restored;
                          });
                          setRestoreDraft(false);
                          setMessage('Reportes originales restaurados.');
                          closeDetail();
                        }}
                      >
                        Descartar borrador y restaurar
                      </button>
                      <button onClick={() => setRestoreDraft(false)}>Conservar borrador</button>
                    </div>
                  )}
                </>
              )}

              <label className="atlas-import">
                Importar JSON del mapa
                <input
                  type="file"
                  accept="application/json,.json"
                  onChange={async (event) => {
                    const file = event.currentTarget.files?.[0];
                    if (!file) return;
                    event.currentTarget.value = '';
                    try {
                      const imported = interactiveMapSchema.parse(JSON.parse(await file.text()));
                      if (
                        imported.slug !== config.slug ||
                        imported.marcadores.some((point) =>
                          point.capas.some(
                            (layer) => !config.floors.some((floor) => floor.id === layer),
                          ),
                        ) ||
                        [...imported.zonas, ...imported.lineas].some(
                          (shape) => !config.floors.some((floor) => floor.id === shape.capa),
                        )
                      )
                        throw new Error('Mapa o capa incorrectos');
                      draft({
                        ...imported,
                        marcadores: imported.marcadores.map((point) => ({
                          ...point,
                          evidencia: 'no confirmado',
                          fuente: 'Borrador personal importado; pendiente de verificar',
                        })),
                      });
                      closeDetail();
                      setMessage('JSON importado como borrador personal, pendiente de verificar.');
                    } catch {
                      setMessage(
                        'No se pudo importar: revisá el formato, el mapa y las capas del JSON.',
                      );
                    }
                  }}
                />
              </label>
              <details>
                <summary>Datos para copiar</summary>
                <textarea aria-label="Datos del mapa" readOnly value={exportData()} />
              </details>
            </section>
          )}
        </aside>
      </div>
      <p className="atlas-map-status" role="status">
        {message ||
          `${visible.length} reportes visibles en ${config.floors.find((layer) => layer.id === floor)?.label}.`}
      </p>
      {params.has('marcador') && !selected && (
        <p role="status">
          El marcador del enlace no existe en este mapa o fue retirado de tu borrador.
        </p>
      )}
      {form && (
        <div
          className="atlas-form-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Editor de mapas"
        >
          <form className="atlas-point-form" onSubmit={saveForm}>
            <h2>
              {form.note
                ? 'Nota personal'
                : form.geometry
                  ? 'Guardar dibujo'
                  : form.id
                    ? 'Editar marcador'
                    : 'Nuevo marcador'}
            </h2>
            <p>Solo se guarda en este navegador.</p>
            {!form.note && !form.geometry && (
              <label>
                Categoría
                <select
                  value={form.categoria}
                  onChange={(event) => setForm({ ...form, categoria: event.target.value })}
                >
                  {mapCategories
                    .filter(
                      (category) => !['high', 'medium', 'low', 'zipline'].includes(category.id),
                    )
                    .map((category) => (
                      <option key={category.id} value={category.id}>
                        {mapGroups[category.group].name} / {category.name}
                      </option>
                    ))}
                </select>
              </label>
            )}
            <label>
              {form.note ? 'Tu nota' : 'Título'}
              <input
                required
                maxLength={250}
                value={form.titulo}
                onChange={(event) => setForm({ ...form, titulo: event.target.value })}
              />
            </label>
            {!form.note && !form.geometry && (
              <label>
                Descripción (acepta **negrita** y listas con -)
                <textarea
                  value={form.descripcion}
                  maxLength={10000}
                  onChange={(event) => setForm({ ...form, descripcion: event.target.value })}
                />
              </label>
            )}
            <div>
              <button type="submit">Guardar</button>
              <button type="button" onClick={() => setForm(null)}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
      {expandedImage && (
        <div
          className="atlas-image-fullscreen"
          role="dialog"
          aria-modal="true"
          aria-label="Imagen del marcador"
        >
          <button aria-label="Cerrar imagen" onClick={() => setExpandedImage(null)}>
            ×
          </button>
          <img src={atlasAsset(expandedImage)} alt={selected?.titulo ?? 'Imagen del marcador'} />
        </div>
      )}
    </>
  );
}
