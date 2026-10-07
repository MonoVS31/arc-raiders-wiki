import { useEffect, useState } from 'react';
const ids = ['detail-title', 'datos', 'fabricacion'];
export function useScrollSpy(entityId: string) {
  const [active, setActive] = useState('detail-title');
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      let current = 'detail-title';
      for (const id of ids) {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= 160) current = id;
      }
      setActive(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const observer = window.IntersectionObserver
      ? new IntersectionObserver(schedule, { rootMargin: '-100px 0px -55% 0px' })
      : null;
    const observed = new Set<Element>();
    const refresh = () => {
      for (const id of ids) {
        const node = document.getElementById(id);
        if (node && !observed.has(node)) {
          observer?.observe(node);
          observed.add(node);
        }
      }
      schedule();
    };
    const changes = new MutationObserver(refresh);
    changes.observe(document.getElementById('catalog') ?? document.body, {
      childList: true,
      subtree: true,
    });
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    refresh();
    return () => {
      observer?.disconnect();
      changes.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [entityId]);
  return active;
}
