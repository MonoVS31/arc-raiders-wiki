import type { Category, Entity } from '../../domain/schema';
import { categories } from '../EntityDetail';
import type { CSSProperties, Dispatch, SetStateAction } from 'react';
import { availabilitySchema, confidenceSchema } from '../../domain/schema';
import type { Filters } from '../../domain/query';
import { WikiIcon } from '../WikiIcon';
import { descriptions, EntityImage } from './presentation';

export function CategoryView({
  filters,
  setFilters,
  entities,
  navigate,
}: {
  filters: Filters;
  setFilters: Dispatch<SetStateAction<Filters>>;
  entities: Entity[];
  navigate: (id: string) => void;
}) {
  return (
    <>
      <div className="category-heading">
        <span className="section-kicker">
          ENCICLOPEDIA / {categories[filters.category as Category]}
        </span>
        <h1>{categories[filters.category as Category]}</h1>
        <p>{descriptions[filters.category as Category]}</p>
      </div>
      <div className="filters">
        <label className="search-label">
          Buscar
          <input
            type="search"
            value={filters.query}
            onChange={(event) =>
              setFilters((current) => ({ ...current, query: event.target.value }))
            }
            placeholder="Buscar por nombre…"
          />
        </label>
        <label>
          Disponibilidad
          <select
            value={filters.availability}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                availability:
                  event.target.value === 'all'
                    ? 'all'
                    : availabilitySchema.parse(event.target.value),
              }))
            }
          >
            <option value="all">Todos los estados</option>
            {availabilitySchema.options.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          Evidencia
          <select
            value={filters.confidence}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                confidence:
                  event.target.value === 'all' ? 'all' : confidenceSchema.parse(event.target.value),
              }))
            }
          >
            <option value="all">Todos los niveles</option>
            {confidenceSchema.options.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
      </div>
      <p role="status" className="result-count">
        {entities.length} fichas encontradas
      </p>
      <div className="entity-gallery">
        {entities.map((entity, index) => (
          <button
            key={entity.id}
            className={`gallery-card category-${entity.category}`}
            style={{ '--delay': `${Math.min(index, 12) * 35}ms` } as CSSProperties}
            onClick={() => navigate(entity.id)}
          >
            <div className="gallery-art">
              <WikiIcon category={entity.category} />
              <EntityImage id={entity.id} name={entity.name} />
            </div>
            <div className="gallery-body">
              <small>{categories[entity.category]}</small>
              <h2>{entity.name}</h2>
              <span className={`availability ${entity.availability}`}>{entity.availability}</span>
              <span className="gallery-arrow">→</span>
            </div>
          </button>
        ))}
      </div>
      {entities.length === 0 && (
        <p className="empty-state">No hay coincidencias. Cambiá el nombre o los filtros.</p>
      )}
    </>
  );
}
