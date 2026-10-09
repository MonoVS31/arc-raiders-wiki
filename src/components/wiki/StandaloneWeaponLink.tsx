import type { ReactNode } from 'react';
import { standaloneWeaponCodes, standaloneWeaponLink } from '../../domain/standalone-weapons';
export function StandaloneWeaponLink({ entityId }: { entityId: string }) {
  return standaloneWeaponCodes[entityId] ? (
    <a className="standalone-weapon-link" href={standaloneWeaponLink(entityId)}>
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
  return standaloneWeaponCodes[entityId] ? (
    <div className="gallery-item">
      {children}
      <StandaloneWeaponLink entityId={entityId} />
    </div>
  ) : (
    <>{children}</>
  );
}
