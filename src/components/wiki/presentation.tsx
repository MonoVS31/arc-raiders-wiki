import { entityTransitionName } from '../../app/view-transitions';
import { readAtlasData } from '../../domain/data-loader';
import { useState } from 'react';
import type { Category } from '../../domain/schema';
import { catalog } from '../../domain/catalog';
const visuals =
  readAtlasData<typeof import('../../../public/data/atlas/entity-visuals.json')>(
    'entity-visuals.json',
  );
export const descriptions: Record<Category, string> = {
  map: 'Cartografía, pisos y reportes de botín',
  weapon: 'Arsenal, niveles y mantenimiento',
  arc: 'Máquinas, zonas débiles y combate',
  grenade: 'Explosivos, efectos y alcance',
  blueprint: 'Recetas, misiones y obtención',
  project: 'Etapas, materiales y recompensas',
  container: 'Cajas y contenedores de la incursión',
};
export const formatCount = (count: number) => String(count).padStart(2, '0');
export const availableCount = (category: Category) =>
  formatCount(
    catalog.entities.filter(
      (entity) => entity.category === category && entity.availability === 'disponible',
    ).length,
  );
export const artFor = (id: string) => visuals.find((visual) => visual.entityId === id)?.url;
export function EntityImage({ id, name }: { id: string; name: string }) {
  const [failed, setFailed] = useState(false);
  const url = artFor(id);
  return url && !failed ? (
    <img
      width={512}
      height={512}
      decoding="async"
      data-view-art={id}
      style={{ viewTransitionName: entityTransitionName(id) }}
      src={url}
      alt={name}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  ) : null;
}
