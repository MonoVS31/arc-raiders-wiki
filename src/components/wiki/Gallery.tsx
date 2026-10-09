import { StandaloneWeaponGalleryEntry } from './StandaloneWeaponLink';
import { entityTransitionName } from '../../app/view-transitions';
import { weaponStudyFor } from '../../domain/weapon-studies';
import { atlasAsset } from '../../domain/assets';
import type { Entity } from '../../domain/schema';
import { categories } from '../EntityDetail';
import { WikiIcon } from '../WikiIcon';
import { WikiLink } from '../../app/WikiContext';
import { EntityImage } from './presentation';
export function GalleryCardContent({ entity }: { entity: Entity }) {
  const study = entity.category === 'weapon' ? weaponStudyFor(entity.id) : undefined;
  return (
    <div className="card-tilt">
      <span className="card-light-clip" aria-hidden="true">
        <span className="card-spotlight" />
      </span>
      <div className="gallery-art">
        <WikiIcon category={entity.category} />
        {study ? (
          <img
            className="weapon-study-thumbnail"
            style={{ viewTransitionName: entityTransitionName(entity.id) }}
            src={atlasAsset('weapons3d/' + study.preview)}
            alt={`Diseño original orientativo de ${entity.name}`}
            width={960}
            height={480}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <EntityImage id={entity.id} name={entity.name} />
        )}
      </div>
      <div className="gallery-body">
        <small>{categories[entity.category]}</small>
        <h2>{entity.name}</h2>
        <span className={`availability ${entity.availability}`}>{entity.availability}</span>
        <span className="gallery-arrow">→</span>
      </div>
    </div>
  );
}
export function Gallery({ entities }: { entities: Entity[] }) {
  return (
    <div className="entity-gallery">
      {entities.map((entity) => (
        <StandaloneWeaponGalleryEntry key={entity.id} entityId={entity.id}>
          <WikiLink
            entityId={entity.id}
            className={`gallery-card category-${entity.category} status-${entity.availability}`}
          >
            <GalleryCardContent entity={entity} />
          </WikiLink>
        </StandaloneWeaponGalleryEntry>
      ))}
    </div>
  );
}
