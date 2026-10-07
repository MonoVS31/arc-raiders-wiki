import { useEffect } from 'react';
const selector =
  '.banner-grid, .banner-orbit, .banner-machine img, .signal-dot, .material-portrait, .article-visual img, .zone-point, .effect-pulse';
export function useVisibleAnimations() {
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const seen = new Set<Element>();
    const visible = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
        entry.target.classList.toggle('animation-paused', !entry.isIntersecting || document.hidden);
      }
    });
    const refresh = () => {
      for (const element of document.querySelectorAll(selector))
        if (!seen.has(element)) {
          seen.add(element);
          element.classList.add('animation-paused');
          observer.observe(element);
        }
      for (const element of seen)
        if (!element.isConnected) {
          observer.unobserve(element);
          seen.delete(element);
          visible.delete(element);
        }
    };
    const visibility = () => {
      for (const element of seen)
        element.classList.toggle('animation-paused', !visible.has(element) || document.hidden);
    };
    document.addEventListener('visibilitychange', visibility);
    refresh();
    const changes = new MutationObserver(refresh);
    changes.observe(document.getElementById('root') ?? document.body, {
      childList: true,
      subtree: true,
    });
    return () => {
      document.removeEventListener('visibilitychange', visibility);
      changes.disconnect();
      observer.disconnect();
    };
  }, []);
}
