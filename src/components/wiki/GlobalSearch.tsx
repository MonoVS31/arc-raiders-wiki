import { useId, useState, useEffect, useRef } from 'react';
import type { KeyboardEvent } from 'react';
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
  const listRef = useRef<HTMLUListElement>(null);
  const listId = `wiki-search-${useId()}`;
  const [interaction, setInteraction] = useState({ query: globalSearch, open: true, index: -1 });
  const queried = globalSearch.trim().length > 1;
  const show = queried && (interaction.query !== globalSearch || interaction.open);
  const expanded = show && globalResults.length > 0;
  const activeIndex = interaction.query === globalSearch ? interaction.index : -1;
  const active = expanded ? globalResults[activeIndex] : undefined;
  useEffect(() => {
    const list = listRef.current;
    const option = list?.children[activeIndex];
    if (!active || !list || !option) return;
    const bounds = list.getBoundingClientRect();
    const selected = option.getBoundingClientRect();
    if (selected.top < bounds.top) list.scrollTop += selected.top - bounds.top;
    else if (selected.bottom > bounds.bottom) list.scrollTop += selected.bottom - bounds.bottom;
  }, [active, activeIndex]);
  const optionId = (id: string) => `${listId}-${id}`;
  const choose = (entity: Entity) => {
    setInteraction({ query: '', open: false, index: -1 });
    setGlobalSearch('');
    navigate(entity.id);
  };
  const keyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      setInteraction({ query: globalSearch, open: false, index: -1 });
    } else if (
      (event.key === 'ArrowDown' || event.key === 'ArrowUp') &&
      queried &&
      globalResults.length
    ) {
      event.preventDefault();
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      const index =
        !expanded || activeIndex < 0
          ? direction === 1
            ? 0
            : globalResults.length - 1
          : Math.max(0, Math.min(globalResults.length - 1, activeIndex + direction));
      setInteraction({ query: globalSearch, open: true, index });
    } else if (event.key === 'Enter' && active) {
      event.preventDefault();
      choose(active);
    }
  };
  return (
    <div className="portal-search">
      <label>
        <span className="sr-only">Buscar en toda la wiki</span>
        <input
          type="search"
          role="combobox"
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-expanded={expanded}
          aria-controls={listId}
          aria-activedescendant={active ? optionId(active.id) : undefined}
          value={globalSearch}
          onChange={(event) => {
            setInteraction({ query: event.target.value, open: true, index: -1 });
            setGlobalSearch(event.target.value);
          }}
          onKeyDown={keyDown}
          onFocus={() => setInteraction({ query: globalSearch, open: true, index: -1 })}
          onBlur={() => setInteraction({ query: globalSearch, open: false, index: -1 })}
          placeholder="Buscar armas, ARC, mapas o planos…"
        />
      </label>
      <span className="search-shortcut" aria-hidden="true">
        ⌕
      </span>
      <div className="global-results" hidden={!show}>
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label="Resultados de búsqueda"
          hidden={!expanded}
        >
          {globalResults.map((entity) => (
            <li
              key={entity.id}
              id={optionId(entity.id)}
              role="option"
              aria-selected={active?.id === entity.id}
              onPointerDown={(event) => event.preventDefault()}
              tabIndex={-1}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  choose(entity);
                }
              }}
              onClick={() => choose(entity)}
            >
              <strong>{entity.name}</strong>
              <small>
                {categories[entity.category]} · {entity.availability}
              </small>
            </li>
          ))}
        </ul>
        {show && !globalResults.length && <p role="status">No hay coincidencias en el archivo.</p>}
      </div>
    </div>
  );
}
