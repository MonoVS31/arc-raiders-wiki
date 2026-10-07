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
      element.style.removeProperty('transform');
      for (const layer of element.querySelectorAll<HTMLElement>(
        '.card-spotlight, .card-tilt, .banner-machine img',
      ))
        layer.style.removeProperty('transform');
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
        // Update the moving layers without invalidating inherited variables across the card.
        const light = target.querySelector<HTMLElement>('.card-spotlight');
        const image = target.querySelector<HTMLElement>('.banner-machine img');
        const tilt = target.matches('.portal-tile')
          ? target
          : target.querySelector<HTMLElement>('.card-tilt');
        if (light)
          light.style.transform = `translate3d(${x - rect.left - 175}px, ${y - rect.top - 175}px, 0)`;
        if (image)
          image.style.transform = `translate3d(${nx * 14}px, ${ny * 10}px, 0) scale(1.035)`;
        if (tilt) tilt.style.transform = `rotateX(${-ny * 5}deg) rotateY(${nx * 5}deg)`;
        if (!target.hasAttribute('data-pointer-active'))
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
