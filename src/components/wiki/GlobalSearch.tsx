import type { Entity } from '../../domain/schema';
import { categories } from '../EntityDetail';

export function GlobalSearch({
  globalSearch,
  setGlobalSearch,
  globalResults,
  navigate,
}: {
  globalSearch: string;
  setGlobalSearch: (value: string) => void;
  globalResults: Entity[];
  navigate: (id: string) => void;
}) {
  return (
    <div className="portal-search">
      <label>
        <span className="sr-only">Buscar en toda la wiki</span>
        <input
          type="search"
          value={globalSearch}
          onChange={(event) => setGlobalSearch(event.target.value)}
          placeholder="Buscar armas, ARC, mapas o planos…"
        />
      </label>
      <span className="search-shortcut" aria-hidden="true">
        ⌕
      </span>
      {globalSearch.trim().length > 1 && (
        <div className="global-results">
          {globalResults.length ? (
            globalResults.map((entity) => (
              <button
                key={entity.id}
                onClick={() => {
                  setGlobalSearch('');
                  navigate(entity.id);
                }}
              >
                <strong>{entity.name}</strong>
                <small>
                  {categories[entity.category]} · {entity.availability}
                </small>
              </button>
            ))
          ) : (
            <p>No hay coincidencias en el archivo.</p>
          )}
        </div>
      )}
    </div>
  );
}
