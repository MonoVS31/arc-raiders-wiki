import type { Entity } from '../../domain/schema';
import { categories } from '../EntityDetail';
import { WikiIcon } from '../WikiIcon';
import { WikiLink } from '../../app/WikiContext';
import { EntityImage } from './presentation';
export function GalleryCardContent({ entity }: { entity: Entity }) {
  return (
    <>
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
    </>
  );
}
export function Gallery({ entities }: { entities: Entity[] }) {
  return (
    <div className="entity-gallery">
      {entities.map((entity) => (
        <WikiLink
          key={entity.id}
          entityId={entity.id}
          className={`gallery-card category-${entity.category}`}
        >
          <GalleryCardContent entity={entity} />
        </WikiLink>
      ))}
    </div>
  );
}
