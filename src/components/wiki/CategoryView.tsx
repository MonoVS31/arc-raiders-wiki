import { standaloneWeaponLink } from '../../domain/standalone-weapons';
import { lazy, Suspense } from 'react';
import { Gallery } from './Gallery';
const MotionGallery = lazy(() => import('./MotionGallery'));
import type { Category, Entity } from '../../domain/schema';
import { categories } from '../EntityDetail';
import type { Dispatch, SetStateAction } from 'react';
import { availabilitySchema, confidenceSchema } from '../../domain/schema';
import type { Filters } from '../../domain/query';
import { descriptions } from './presentation';

export function CategoryView({
  filters,
  setFilters,
  entities,
}: {
  filters: Filters;
  setFilters: Dispatch<SetStateAction<Filters>>;
  entities: Entity[];
}) {
  return (
    <>
      <div className="category-heading">
        <span className="section-kicker">
          ENCICLOPEDIA / {categories[filters.category as Category]}
        </span>
        <h1>{categories[filters.category as Category]}</h1>
        <p>{descriptions[filters.category as Category]}</p>
        {filters.category === 'weapon' && (
          <a className="standalone-weapon-link" href={standaloneWeaponLink()}>
            Armas en 3D →
          </a>
        )}
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
      <Suspense fallback={<Gallery entities={entities} />}>
        {' '}
        <MotionGallery entities={entities} />{' '}
      </Suspense>
      {entities.length === 0 && (
        <p className="empty-state">No hay coincidencias. Cambiá el nombre o los filtros.</p>
      )}
    </>
  );
}
