import { localImage } from '../../domain/images';
import { readAtlasData } from '../../domain/data-loader';
import { AtlasImage } from './AtlasImage';
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
export const artFor = (id: string) => {
  const url = visuals.find((visual) => visual.entityId === id)?.url;
  return url ? localImage(url) : undefined;
};
export function EntityImage({ id, name }: { id: string; name: string }) {
  const url = artFor(id);
  return url ? <AtlasImage key={url} url={url} name={name} id={id} /> : null;
}
