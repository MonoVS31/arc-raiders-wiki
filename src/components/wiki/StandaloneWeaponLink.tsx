import type { ReactNode } from 'react';
import { standaloneViewer } from '../../domain/standalone-weapons';
export function StandaloneWeaponLink({ entityId }: { entityId: string }) {
  const viewer = standaloneViewer(entityId);
  return viewer ? (
    <a className="standalone-weapon-link" href={viewer.link}>
      Ver en 3D
    </a>
  ) : null;
}

export function StandaloneWeaponGalleryEntry({
  entityId,
  children,
}: {
  entityId: string;
  children: ReactNode;
}) {
  return standaloneViewer(entityId) ? (
    <div className="gallery-item">
      {children}
      <StandaloneWeaponLink entityId={entityId} />
    </div>
  ) : (
    <>{children}</>
  );
}
