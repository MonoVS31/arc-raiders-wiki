import { useCallback, useState } from 'react';
import { entityTransitionName } from '../../app/view-transitions';
export function AtlasImage({
  url,
  name,
  id,
  lazy = true,
}: {
  url: string;
  name: string;
  id?: string;
  lazy?: boolean;
}) {
  const [state, setState] = useState<'loading' | 'ready' | 'failed'>('loading');
  const ref = useCallback((node: HTMLImageElement | null) => {
    if (node?.complete && node.naturalWidth > 0) setState('ready');
  }, []);
  return (
    <span className={`atlas-image image-${state}`}>
      {state === 'loading' && <span className="image-skeleton" aria-hidden="true" />}
      {state !== 'failed' && (
        <img
          ref={ref}
          width={512}
          height={512}
          decoding="async"
          src={url}
          alt={name}
          loading={lazy ? 'lazy' : 'eager'}
          {...(id
            ? { 'data-view-art': id, style: { viewTransitionName: entityTransitionName(id) } }
            : {})}
          onLoad={() => setState('ready')}
          onError={() => setState('failed')}
        />
      )}
    </span>
  );
}
