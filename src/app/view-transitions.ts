import { flushSync } from 'react-dom';
import { prefersReducedMotion } from './motion-preference';
export const entityTransitionName = (id: string) => `art-${id}`;
export function transitionNavigation(update: () => void, entityId?: string) {
  if (prefersReducedMotion() || typeof document.startViewTransition !== 'function') {
    update();
    return;
  }
  let committed = false;
  const commit = async () => {
    if (committed) return;
    committed = true;
    flushSync(update);
    if (entityId) {
      const image = Array.from(document.querySelectorAll<HTMLImageElement>('[data-view-art]')).find(
        (image) => image.dataset.viewArt === entityId,
      );
      await image?.decode?.().catch(() => {});
    }
  };
  try {
    const transition = document.startViewTransition(commit);
    void transition.ready.catch(() => {});
    void transition.updateCallbackDone.catch(() => {});
  } catch {
    void commit();
  }
}
