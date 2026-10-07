import { useEffect, useRef } from 'react';
import { useMotionPreference } from '../../app/motion-preference';
export function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useMotionPreference();
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.textContent = value;
    if (reduced || !window.IntersectionObserver) return;
    let frame = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (time: number) => {
          const progress = Math.min(1, (time - start) / 1100);
          node.textContent = String(Math.round(Number(value) * (1 - (1 - progress) ** 3))).padStart(
            2,
            '0',
          );
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      node.textContent = value;
    };
  }, [value, reduced]);
  return (
    <strong aria-label={value}>
      <span ref={ref} aria-hidden="true">
        {value}
      </span>
    </strong>
  );
}
