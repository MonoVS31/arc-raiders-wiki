import { localImage } from '../domain/images';
import { atlasAsset } from '../domain/assets';
import { usePresence } from 'motion/react';
import { useMotionPreference } from '../app/motion-preference';
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import { sourceById, catalog } from '../domain/catalog';
import { materialArcHints } from '../domain/arc-links';
import { WikiLink, Sources } from '../app/WikiContext';
export type WikiPanel =
  | { kind: 'references'; ids: string[] }
  | { kind: 'material'; name: string }
  | { kind: 'materials' }
  | { kind: 'news' };
const materialsSchema = z.array(
  z
    .object({
      id: z.string(),
      name: z.string(),
      type: z.string(),
      rarity: z.string().nullable(),
      icon: z.string().nullable(),
      lootArea: z.string().nullable(),
      value: z.number().nullable(),
      sourceId: z.string(),
    })
    .strict(),
);
type Material = z.infer<typeof materialsSchema>[number];
let materialCache: Material[] | null = null;
export default function WikiModal({ panel, onClose }: { panel: WikiPanel; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [present, safeToRemove] = usePresence();
  const reduced = useMotionPreference();
  const [items, setItems] = useState<Material[]>(materialCache ?? []);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<string | null>(
    panel.kind === 'material' ? panel.name : null,
  );
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    const before = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = before;
      dialog?.close();
    };
  }, []);
  useEffect(() => {
    if (present) return;
    ref.current?.close();
    if (reduced || !window.CSS?.supports?.('transition-behavior: allow-discrete')) {
      safeToRemove?.();
      return;
    }
    const timer = window.setTimeout(() => safeToRemove?.(), 260);
    return () => window.clearTimeout(timer);
  }, [present, reduced, safeToRemove]);
  useEffect(() => {
    if (!['material', 'materials'].includes(panel.kind) || materialCache) return;
    const abort = new AbortController();
    fetch(atlasAsset('data/dossiers/materials.json'), { signal: abort.signal })
      .then((response) => {
        if (!response.ok) throw Error();
        return response.json();
      })
      .then((data) => {
        materialCache = materialsSchema.parse(data);
        setItems(materialCache);
      })
      .catch((error) => {
        if (error.name !== 'AbortError')
          setError('No se pudo cargar el catálogo local de materiales.');
      });
    return () => abort.abort();
  }, [panel.kind]);
  const typeLabels: Record<string, string> = {
    'Basic Material': 'Material básico',
    'Refined Material': 'Material refinado',
    'Topside Material': 'Material de incursión',
    Nature: 'Recurso natural',
    Trinket: 'Objeto de valor',
    Recyclable: 'Reciclable',
    Key: 'Llave',
    'Quest Item': 'Objeto de misión',
    Ammunition: 'Munición',
    Material: 'Material',
  };
  const name = selected ?? '';
  const material = items.find((item) => item.name.toLowerCase() === name.toLowerCase());
  const related = catalog.entities.find(
    (entity) => entity.name === name || entity.name === name.replace(/ (I|II|III|IV)$/, ''),
  );
  const hint = materialArcHints.find((hint) => hint.material === name);
  return (
    <dialog
      ref={ref}
      className="wiki-modal"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onTransitionEnd={(event) => {
        if (!present && event.target === event.currentTarget && event.propertyName === 'opacity')
          safeToRemove?.();
      }}
      aria-labelledby="modal-title"
    >
      <div className="modal-top">
        <span className="section-kicker">ARC ATLAS / LECTURA LOCAL</span>
        <button type="button" onClick={onClose} aria-label="Cerrar panel">
          ×
        </button>
      </div>
      {panel.kind === 'references' ? (
        <>
          <h2 id="modal-title">Fuentes y verificación</h2>
          <p className="muted">
            La información del artículo se muestra dentro de ARC Atlas. Estos enlaces originales son
            opcionales, para revisar su procedencia.
          </p>
          {panel.ids.map((id) => {
            const source = sourceById.get(id);
            return (
              source && (
                <section className="reference-record" key={id}>
                  <h3>{source.title}</h3>
                  <dl>
                    <div>
                      <dt>Tipo</dt>
                      <dd>{source.kind === 'official' ? 'Oficial' : 'Comunitaria / técnica'}</dd>
                    </div>
                    <div>
                      <dt>Captura</dt>
                      <dd>{source.retrievedAt.slice(0, 10)}</dd>
                    </div>
                    <div>
                      <dt>Revisión</dt>
                      <dd>{source.revision ?? 'Captura versionada'}</dd>
                    </div>
                  </dl>
                  <p>{source.locator}</p>
                  <details>
                    <summary>Consultar documento original · opcional</summary>
                    <a href={source.url} target="_blank" rel="noreferrer">
                      {source.title} ↗
                    </a>
                  </details>
                </section>
              )
            );
          })}
        </>
      ) : panel.kind === 'news' ? (
        <>
          <h2 id="modal-title">Frozen Trail · contenido anunciado</h2>
          <p>
            Embark anunció la actualización para el 8 de octubre de 2026. Pendola Pass, nuevos ARC y
            equipamiento permanecen separados del catálogo disponible en esta captura.
          </p>
          <p>
            Los artículos anunciados tienen su propia etiqueta y conservan sin confirmar las
            estadísticas o ubicaciones aún no documentadas.
          </p>
          <h3>Explorar lo anunciado</h3>
          <div className="announcement-links">
            {catalog.entities
              .filter((entity) => entity.availability === 'anunciado')
              .map((entity) => (
                <WikiLink key={entity.id} entityId={entity.id}>
                  {entity.name}
                </WikiLink>
              ))}
          </div>
          <Sources
            ids={[...sourceById.values()]
              .filter((source) => source.kind === 'official')
              .map((source) => source.id)}
          />
        </>
      ) : (
        <>
          <h2 id="modal-title">{selected ?? 'Materiales y recursos'}</h2>
          {items.length === 0 && !error && <p role="status">Cargando catálogo local…</p>}
          {error && <p role="alert">{error}</p>}
          {selected ? (
            <>
              <button className="text-button" onClick={() => setSelected(null)}>
                ← Catálogo de recursos
              </button>
              {material?.icon && (
                <img
                  width={512}
                  height={512}
                  decoding="async"
                  className="material-portrait"
                  src={localImage(material.icon)}
                  alt={material.name}
                />
              )}
              <dl className="material-data">
                <div>
                  <dt>Nombre</dt>
                  <dd>{name}</dd>
                </div>
                <div>
                  <dt>Tipo</dt>
                  <dd>
                    {material
                      ? (typeLabels[material.type] ?? material.type)
                      : 'Objeto asociado a una receta'}
                  </dd>
                </div>
                <div>
                  <dt>Rareza reportada</dt>
                  <dd>{material?.rarity ?? 'Sin verificar'}</dd>
                </div>
                <div>
                  <dt>Tipos de zona reportados</dt>
                  <dd>
                    {material?.lootArea || 'Sin una zona específica documentada'}{' '}
                    <span className="confidence posible">posible</span>
                  </dd>
                </div>
                <div>
                  <dt>Valor publicado</dt>
                  <dd>
                    {material?.value && material.value > 0 ? material.value : 'Sin verificar'}{' '}
                    <span
                      className={`confidence ${material?.value && material.value > 0 ? 'probable' : 'no-confirmado'}`}
                    >
                      {material?.value && material.value > 0 ? 'probable' : 'no confirmado'}
                    </span>
                  </dd>
                </div>
              </dl>
              {hint && (
                <p>
                  Botín reportado de <WikiLink entityId={hint.entityId}>{hint.enemyName}</WikiLink>.
                  Sus mapas y zonas de combate se abren aquí mismo.{' '}
                  <span className="confidence posible">posible</span>
                </p>
              )}
              {related && (
                <WikiLink className="primary-link" entityId={related.id}>
                  Abrir ficha de {related.name} →
                </WikiLink>
              )}
              <p className="muted">
                Los datos del proveedor no confirman todas las ubicaciones ni garantizan una
                aparición. Los campos ausentes se conservan sin verificar.
              </p>
              <Sources ids={material ? [material.sourceId] : hint ? [hint.sourceId] : []} />
            </>
          ) : (
            <>
              <p className="muted">
                Catálogo local de recursos del proveedor. La vigencia de cada entrada y sus lugares
                concretos de aparición siguen sujetos a revisión.
              </p>
              <label className="modal-search">
                Buscar material
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  type="search"
                  placeholder="Mechanical Components, Chemicals…"
                />
              </label>
              {error && <p role="alert">{error}</p>}
              <div className="material-grid">
                {items
                  .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
                  .map((item) => (
                    <button key={item.id} onClick={() => setSelected(item.name)}>
                      {item.icon && (
                        <img
                          width={512}
                          height={512}
                          decoding="async"
                          src={localImage(item.icon)}
                          alt=""
                          loading="lazy"
                        />
                      )}
                      <strong>{item.name}</strong>
                      <small>{typeLabels[item.type] ?? item.type}</small>
                    </button>
                  ))}
              </div>
            </>
          )}
        </>
      )}
    </dialog>
  );
}
