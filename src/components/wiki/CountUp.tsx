import { useEffect, useRef } from 'react';
import { useMotionPreference } from '../../app/motion-preference';
export function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useMotionPreference();
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (reduced || !window.IntersectionObserver) return;
    // Keep the final number stable: only opacity/transform animate on entry.
    node.classList.add('counter-pending');
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        node.classList.remove('counter-pending');
      },
      { threshold: 0.5 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      node.classList.remove('counter-pending');
    };
  }, [value, reduced]);
  return (
    <strong aria-label={value}>
      <span ref={ref} className="counter-value" aria-hidden="true">
        {value}
      </span>
    </strong>
  );
}
