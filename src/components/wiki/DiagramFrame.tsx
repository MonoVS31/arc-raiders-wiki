import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useMotionPreference } from '../../app/motion-preference';

export function DiagramFrame({
  children,
  className = '',
  scan = true,
  decorative = false,
}: {
  children: ReactNode;
  className?: string;
  scan?: boolean;
  decorative?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useMotionPreference();
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    if (reduced || !ref.current || !window.IntersectionObserver) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setEntered(true);
        observer.disconnect();
      },
      { threshold: 0.1 },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [reduced]);
  return (
    <div
      ref={ref}
      className={`diagram-frame ${className}`}
      data-entered={entered && !reduced ? '' : undefined}
      data-reduced-motion={reduced ? '' : undefined}
      aria-hidden={decorative ? true : undefined}
    >
      <span className="diagram-corner diagram-corner-start" aria-hidden="true" />
      <span className="diagram-corner diagram-corner-end" aria-hidden="true" />
      {scan && (
        <div className="diagram-scan-track" aria-hidden="true">
          <span className="diagram-scan" />
        </div>
      )}
      {children}
    </div>
  );
}
