import { useEffect } from 'react';
import { useMotionPreference } from './motion-preference';
export function useVisualEffects() {
  const reduced = useMotionPreference();
  useEffect(() => {
    const fine = window.matchMedia?.('(hover: hover) and (pointer: fine) and (min-width: 900px)');
    if (reduced || !fine) return;
    let frame = 0;
    let target: HTMLElement | null = null;
    let x = 0,
      y = 0;
    const reset = (element: HTMLElement) => {
      element.style.removeProperty('--pointer-x');
      element.style.removeProperty('--pointer-y');
      element.style.removeProperty('--tilt-x');
      element.style.removeProperty('--tilt-y');
      element.style.removeProperty('--parallax-x');
      element.style.removeProperty('--parallax-y');
      element.removeAttribute('data-pointer-active');
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || !fine.matches) return;
      const next =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>('.gallery-card, .portal-tile, .welcome-banner')
          : null;
      if (target && target !== next) reset(target);
      target = next;
      x = event.clientX;
      y = event.clientY;
      if (!target || frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!target) return;
        const rect = target.getBoundingClientRect();
        const nx = (x - rect.left) / rect.width - 0.5,
          ny = (y - rect.top) / rect.height - 0.5;
        target.style.setProperty('--pointer-x', `${x - rect.left}px`);
        target.style.setProperty('--pointer-y', `${y - rect.top}px`);
        target.style.setProperty('--tilt-x', `${-ny * 5}deg`);
        target.style.setProperty('--tilt-y', `${nx * 5}deg`);
        target.style.setProperty('--parallax-x', `${nx * 14}px`);
        target.style.setProperty('--parallax-y', `${ny * 10}px`);
        target.setAttribute('data-pointer-active', '');
      });
    };
    const out = (event: PointerEvent) => {
      if (
        target &&
        !(event.relatedTarget instanceof Node && target.contains(event.relatedTarget))
      ) {
        reset(target);
        target = null;
      }
    };
    const disable = () => {
      if (target) reset(target);
      target = null;
      cancelAnimationFrame(frame);
      frame = 0;
    };
    document.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerout', out, { passive: true });
    fine.addEventListener('change', disable);
    return () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerout', out);
      fine.removeEventListener('change', disable);
      disable();
    };
  }, [reduced]);
}
