import { useEffect, useRef, type CSSProperties, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import type { Map as LeafletMap } from 'leaflet';
import type { MapMarker } from '../../domain/maps';
import { pointInsideMap } from '../../domain/map-diagrams';

export function MapDiagramOverlay({
  map,
  selected,
  trace,
  layoutRef,
  detailRef,
}: {
  map: LeafletMap | null;
  selected: MapMarker | undefined;
  trace: MapMarker[];
  layoutRef: RefObject<HTMLDivElement | null>;
  detailRef: RefObject<HTMLElement | null>;
}) {
  const positionRef = useRef<HTMLSpanElement>(null);
  const guideRef = useRef<SVGSVGElement>(null),
    guideLineRef = useRef<SVGLineElement>(null);
  const traceRef = useRef<SVGSVGElement>(null);
  useEffect(() => {
    if (!map) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const container = map.getContainer(),
        size = map.getSize();
      const pulse = positionRef.current,
        guide = guideRef.current,
        line = guideLineRef.current;
      const point = selected ? map.latLngToContainerPoint([selected.lat, selected.lng]) : undefined;
      const visible = point && pointInsideMap(point, size);
      if (pulse) {
        pulse.style.opacity = visible ? '1' : '0';
        if (point)
          pulse.style.transform = `translate3d(${point.x + container.clientLeft}px, ${point.y + container.clientTop}px, 0)`;
      }
      const root = layoutRef.current,
        detail = detailRef.current;
      if (guide && line) {
        guide.style.opacity = visible && root && detail ? '1' : '0';
        if (visible && point && root && detail) {
          const rootBox = root.getBoundingClientRect(),
            box = container.getBoundingClientRect(),
            target = detail.getBoundingClientRect();
          const heading = detail.querySelector('h4')?.getBoundingClientRect();
          guide.setAttribute('viewBox', `0 0 ${rootBox.width} ${rootBox.height}`);
          line.setAttribute('x1', String(box.left - rootBox.left + point.x + container.clientLeft));
          line.setAttribute('y1', String(box.top - rootBox.top + point.y + container.clientTop));
          line.setAttribute('x2', String(target.left - rootBox.left));
          line.setAttribute(
            'y2',
            String((heading ? heading.top + heading.height / 2 : target.top) - rootBox.top),
          );
        }
      }
      const svg = traceRef.current;
      if (svg) {
        const bounds = container.getBoundingClientRect();
        svg.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
        const projected = trace.map((marker) =>
          map.latLngToContainerPoint([marker.lat, marker.lng]),
        );
        for (const [index, segment] of [...svg.querySelectorAll('line')].entries()) {
          const from = projected[index]!,
            to = projected[index + 1]!;
          segment.setAttribute('x1', String(from.x + container.clientLeft));
          segment.setAttribute('y1', String(from.y + container.clientTop));
          segment.setAttribute('x2', String(to.x + container.clientLeft));
          segment.setAttribute('y2', String(to.y + container.clientTop));
        }
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    map.on('move zoom resize', schedule);
    window.addEventListener('resize', schedule);
    const observer =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : undefined;
    if (layoutRef.current) observer?.observe(layoutRef.current);
    if (detailRef.current) observer?.observe(detailRef.current);
    schedule();
    return () => {
      map.off('move zoom resize', schedule);
      window.removeEventListener('resize', schedule);
      observer?.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [map, selected, trace, layoutRef, detailRef]);
  return (
    <>
      <div className="map-diagram-overlay" aria-hidden="true">
        {selected && (
          <span ref={positionRef} className="map-selection-position">
            <span className="map-selection-pulse" />
          </span>
        )}
        {trace.length > 1 && (
          <svg ref={traceRef} className="map-route-trace" preserveAspectRatio="none">
            {trace.slice(1).map((marker, index) => (
              <line
                key={marker.id}
                className="map-route-segment"
                vectorEffect="non-scaling-stroke"
                style={{ '--diagram-order': index } as CSSProperties}
              />
            ))}
          </svg>
        )}
      </div>
      {selected &&
        layoutRef.current &&
        createPortal(
          <svg
            ref={guideRef}
            className="map-selection-guide"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <line ref={guideLineRef} vectorEffect="non-scaling-stroke" />
          </svg>,
          layoutRef.current,
        )}
    </>
  );
}
