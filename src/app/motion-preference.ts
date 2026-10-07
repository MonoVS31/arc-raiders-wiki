import { useSyncExternalStore } from 'react';
export const prefersReducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
function subscribe(change: () => void) {
  const query = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  query?.addEventListener('change', change);
  return () => query?.removeEventListener('change', change);
}
export function useMotionPreference() {
  return useSyncExternalStore(subscribe, prefersReducedMotion, () => false);
}
