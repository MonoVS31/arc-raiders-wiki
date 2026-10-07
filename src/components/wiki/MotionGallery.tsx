import { LazyMotion, domMax, MotionConfig } from 'motion/react';
import * as m from 'motion/react-m';
import type { Entity } from '../../domain/schema';
import { WikiLink } from '../../app/WikiContext';
import { useMotionPreference } from '../../app/motion-preference';
import { GalleryCardContent } from './Gallery';
const MotionWikiLink = m.create(WikiLink);
export default function MotionGallery({ entities }: { entities: Entity[] }) {
  const reduced = useMotionPreference();
  return (
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion={reduced ? 'always' : 'never'}>
        <div className="entity-gallery">
          {entities.map((entity) => (
            <MotionWikiLink
              key={entity.id}
              entityId={entity.id}
              className={`gallery-card category-${entity.category} status-${entity.availability}`}
              layout={reduced ? false : 'position'}
              initial={false}
              transition={{ layout: { duration: reduced ? 0 : 0.25, ease: 'easeOut' } }}
            >
              <GalleryCardContent entity={entity} />
            </MotionWikiLink>
          ))}
        </div>
      </MotionConfig>
    </LazyMotion>
  );
}
