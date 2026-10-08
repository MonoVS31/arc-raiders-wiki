import { useEffect, useRef, useState } from 'react';
import type * as Leaflet from 'leaflet';
import { calibration, type MapConfig } from '../../domain/maps';
import {
  categoryFor,
  mapGroups,
  type AtlasPoint,
  type AtlasShape,
  type MapProgress,
} from '../../domain/interactive-maps';
import { mapSymbolPaths } from './MapSymbols';
import '../../styles/leaflet.css';
type Props = {
  config: MapConfig;
  floor: string;
  points: AtlasPoint[];
  shapes: AtlasShape[];
  found: string[];
  selected?: AtlasPoint | undefined;
  notes: MapProgress['notes'];
  vertices: [number, number][];
  onSelect: (point: AtlasPoint) => void;
  onPlace: (x: number, y: number) => void;
  placing: boolean;
};
export default function AtlasMapCanvas(props: Props) {
  const host = useRef<HTMLDivElement>(null),
    mapRef = useRef<Leaflet.Map | null>(null),
    current = useRef(props),
    redraw = useRef<() => void>(() => {});
  current.current = props;
  const [ready, setReady] = useState(0),
    [warning, setWarning] = useState('');
  useEffect(() => {
    let disposed = false,
      frame = 0;
    let resize: ResizeObserver | undefined;
    const events: () => void = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => redraw.current());
    };
    void import('leaflet')
      .then((L) => {
        if (disposed || !host.current) return;
        const c = calibration(props.config),
          crs = L.extend({}, L.CRS.Simple, {
            transformation: new L.Transformation(c.sx, c.ox, c.sy, c.oy),
          });
        const bounds = L.latLngBounds([
          [-c.oy / c.sy, -c.ox / c.sx],
          [(props.config.tileSize - c.oy) / c.sy, (props.config.tileSize - c.ox) / c.sx],
        ]);
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const map = L.map(host.current, {
          crs,
          center: props.config.center,
          zoom: props.config.initialZoom,
          minZoom: props.config.minZoom,
          maxZoom: props.config.maxZoom + 2,
          maxBounds: bounds,
          maxBoundsViscosity: 1,
          preferCanvas: true,
          scrollWheelZoom: true,
          zoomControl: false,
          zoomAnimation: !reduced,
          fadeAnimation: !reduced,
          markerZoomAnimation: !reduced,
        });
        mapRef.current = map;
        L.control
          .zoom({ position: 'bottomright', zoomInTitle: 'Acercar', zoomOutTitle: 'Alejar' })
          .addTo(map);
        const canvas = L.DomUtil.create('canvas', 'atlas-pin-canvas', map.getPane('overlayPane'));
        canvas.setAttribute('aria-hidden', 'true');
        const context = canvas.getContext('2d')!;
        const icons = new Map<string, HTMLImageElement>();
        const sprites = new Map<string, HTMLCanvasElement>();
        let hits: { point: AtlasPoint; x: number; y: number }[] = [];
        const colors = Object.fromEntries(
          Object.entries(mapGroups).map(([group, value]) => [
            group,
            getComputedStyle(host.current!).getPropertyValue(`--map-color-${group}`).trim() ||
              value.color,
          ]),
        );
        const color = (category: string) => colors[categoryFor(category).group]!;
        const icon = (category: string) => {
          if (!icons.has(category)) {
            const image = new Image();
            image.onload = () => {
              sprites.delete(category);
              if (!disposed) events();
            };
            image.src =
              'data:image/svg+xml,' +
              encodeURIComponent(
                `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${getComputedStyle(host.current!).getPropertyValue('--map-icon-color').trim()}" fill-rule="evenodd" d="${mapSymbolPaths[category]}"/></svg>`,
              );
            icons.set(category, image);
          }
          return icons.get(category)!;
        };
        redraw.current = () => {
          if (disposed) return;
          const started = performance.now();
          const palette = getComputedStyle(host.current!);
          const token = (name: string) => palette.getPropertyValue(name).trim();
          const found = new Set(current.current.found);
          const size = map.getSize(),
            ratio = Math.min(window.devicePixelRatio || 1, 2);
          canvas.width = size.x * ratio;
          canvas.height = size.y * ratio;
          canvas.style.width = `${size.x}px`;
          canvas.style.height = `${size.y}px`;
          L.DomUtil.setPosition(canvas, map.containerPointToLayerPoint([0, 0]));
          context.scale(ratio, ratio);
          hits = [];
          const labels: { x: number; y: number; w: number }[] = [];
          for (const point of current.current.points) {
            const position = map.latLngToContainerPoint([point.y, point.x]),
              x = position.x,
              y = position.y;
            if (x < -35 || y < -35 || x > size.x + 35 || y > size.y + 35) continue;
            const collected = found.has(point.id);
            context.globalAlpha = collected ? 0.4 : 1;
            if (point.categoria === 'location') {
              const font = map.getZoom() < props.config.initialZoom ? 17 : 14;
              context.font = `bold ${font}px ${token('--font-family-mono')}`;
              const text = point.titulo.toUpperCase(),
                w = context.measureText(text).width;
              if (
                labels.some(
                  (rect) => Math.abs(rect.y - y) < 22 && Math.abs(rect.x - x) < (rect.w + w) / 2,
                )
              )
                continue;
              labels.push({ x, y, w });
              context.textAlign = 'center';
              context.lineWidth = 4;
              context.strokeStyle = token('--map-label-outline');
              context.strokeText(text, x, y);
              context.fillStyle = token('--color-text');
              context.fillText(text, x, y);
              hits.push({ point, x, y });
              continue;
            }
            hits.push({ point, x, y });
            let sprite = sprites.get(point.categoria);
            if (!sprite) {
              sprite = document.createElement('canvas');
              sprite.width = 96;
              sprite.height = 96;
              const pin = sprite.getContext('2d')!;
              pin.scale(2, 2);
              pin.translate(24, 40);
              pin.beginPath();
              pin.moveTo(0, 2);
              pin.bezierCurveTo(-19, -14, -16, -32, 0, -32);
              pin.bezierCurveTo(16, -32, 19, -14, 0, 2);
              pin.fillStyle = color(point.categoria);
              pin.shadowColor = token('--map-pin-shadow');
              pin.shadowBlur = 4;
              pin.shadowOffsetY = 2;
              pin.fill();
              pin.shadowBlur = 0;
              pin.shadowOffsetY = 0;
              pin.strokeStyle = token('--map-label-outline');
              pin.lineWidth = 1;
              pin.stroke();
              const image = icon(point.categoria);
              if (image.complete && image.naturalWidth) pin.drawImage(image, -8, -27, 16, 16);
              sprites.set(point.categoria, sprite);
            }
            context.drawImage(sprite, x - 24, y - 40, 48, 48);
            if (current.current.selected?.id === point.id) {
              context.beginPath();
              context.arc(x, y - 17, 19, 0, Math.PI * 2);
              context.strokeStyle = token('--color-text');
              context.lineWidth = 2;
              context.stroke();
            }
            if (collected) {
              context.font = `bold 13px ${token('--font-family-body')}`;
              context.fillStyle = token('--map-zone-low');
              context.fillText('✓', x + 8, y - 25);
            }
          }
          if (import.meta.env.DEV && host.current)
            host.current.dataset.drawMs = (performance.now() - started).toFixed(2);
          context.globalAlpha = 1;
          context.fillStyle = token('--color-accent');
          context.font = `bold 17px ${token('--font-family-mono')}`;
          for (const note of current.current.notes) {
            if (note.capa !== current.current.floor) continue;
            const p = map.latLngToContainerPoint([note.y, note.x]);
            context.fillText('✎', p.x, p.y);
          }
        };
        const hit = (position: Leaflet.Point) =>
          [...hits]
            .reverse()
            .find((item) => Math.hypot(item.x - position.x, item.y - 15 - position.y) < 20);
        const tooltip = L.tooltip({
          direction: 'right',
          offset: [18, -18],
          className: 'atlas-pin-tooltip',
        });
        map.on('mousemove', (event: Leaflet.LeafletMouseEvent) => {
          const selected = hit(event.containerPoint);
          if (selected) {
            const span = document.createElement('span');
            span.textContent = selected.point.titulo;
            tooltip.setLatLng([selected.point.y, selected.point.x]).setContent(span).addTo(map);
          } else tooltip.remove();
        });
        map.on('click', (event: Leaflet.LeafletMouseEvent) => {
          tooltip.remove();
          if (current.current.placing) {
            current.current.onPlace(event.latlng.lng, event.latlng.lat);
            return;
          }
          const selected = hit(event.containerPoint);
          if (selected) current.current.onSelect(selected.point);
        });
        let hold: ReturnType<typeof setTimeout> | undefined;
        const pointerDown = (event: PointerEvent) => {
          if (event.pointerType === 'mouse') return;
          const position = map.mouseEventToContainerPoint(event),
            selected = hit(position);
          if (selected)
            hold = setTimeout(() => {
              const span = document.createElement('span');
              span.textContent = selected.point.titulo;
              tooltip.setLatLng([selected.point.y, selected.point.x]).setContent(span).addTo(map);
            }, 450);
        };
        const cancelHold = () => clearTimeout(hold);
        host.current.addEventListener('pointerdown', pointerDown);
        host.current.addEventListener('pointerup', cancelHold);
        host.current.addEventListener('pointermove', cancelHold);
        map.on('move zoom resize', events);
        resize = new ResizeObserver(() => map.invalidateSize({ animate: false }));
        resize.observe(host.current);
        setReady((value) => value + 1);
        events();
        // La limpieza de los eventos nativos acompaña el ciclo de Leaflet.
        map.on('unload', () => {
          cancelHold();
          host.current?.removeEventListener('pointerdown', pointerDown);
          host.current?.removeEventListener('pointerup', cancelHold);
          host.current?.removeEventListener('pointermove', cancelHold);
        });
      })
      .catch(
        () =>
          !disposed &&
          setWarning(
            'No se pudo iniciar la cartografía. Usá la lista de reportes o reintentá la carga.',
          ),
      );
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resize?.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
      redraw.current = () => {};
    };
  }, [props.config]);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    let layer: Leaflet.TileLayer | undefined,
      disposed = false;
    setWarning('');
    void import('leaflet').then((L) => {
      if (disposed) return;
      const floor = props.config.floors.find((floor) => floor.id === props.floor)!;
      const c = calibration(props.config);
      const bounds = L.latLngBounds([
        [-c.oy / c.sy, -c.ox / c.sx],
        [(props.config.tileSize - c.oy) / c.sy, (props.config.tileSize - c.ox) / c.sx],
      ]);
      layer = L.tileLayer(floor.tiles, {
        tileSize: props.config.tileSize,
        minZoom: props.config.minZoom,
        maxNativeZoom: props.config.maxZoom,
        maxZoom: props.config.maxZoom + 2,
        noWrap: true,
        bounds,
        keepBuffer: 1,
        attribution:
          '<a href="https://metaforge.app/arc-raiders">Cartografía existente: MetaForge</a> · Embark Studios',
      }).addTo(map);
      layer.on('tileerror', () =>
        setWarning(
          'No se pudo cargar una parte de la cartografía externa. Los reportes siguen disponibles en la lista.',
        ),
      );
    });
    return () => {
      disposed = true;
      layer?.remove();
    };
  }, [props.config, props.floor, ready]);
  useEffect(
    () => redraw.current(),
    [props.points, props.found, props.selected, props.notes, props.floor, ready],
  );
  useEffect(() => {
    const map = mapRef.current,
      point = props.selected;
    if (map && point)
      map.flyTo([point.y, point.x], Math.max(map.getZoom(), props.config.initialZoom + 0.5), {
        animate: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        duration: 0.4,
      });
  }, [props.selected, props.config, ready]);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    let group: Leaflet.LayerGroup | undefined,
      disposed = false;
    void import('leaflet').then((L) => {
      if (disposed) return;
      group = L.layerGroup().addTo(map);
      for (const shape of props.shapes) {
        const style = getComputedStyle(host.current!);
        const color = style
          .getPropertyValue(
            shape.categoria === 'high'
              ? '--map-zone-high'
              : shape.categoria === 'medium'
                ? '--map-zone-medium'
                : shape.categoria === 'low'
                  ? '--map-zone-low'
                  : '--map-color-other',
          )
          .trim();
        const positions = shape.puntos.map(([x, y]) => [y, x] as [number, number]);
        const layer =
          shape.categoria === 'zipline'
            ? L.polyline(positions, { color, weight: 3, dashArray: '7 7' })
            : L.polygon(positions, {
                color,
                weight: 3,
                fillOpacity:
                  shape.categoria === 'high' ? 0.3 : shape.categoria === 'medium' ? 0.2 : 0.15,
              });
        const label = document.createElement('span');
        label.textContent = shape.titulo + ' · borrador personal, sin verificar';
        layer.bindTooltip(label);
        layer.addTo(group);
      }
      if (props.vertices.length)
        L.polyline(
          props.vertices.map(([x, y]) => [y, x]),
          {
            color: getComputedStyle(host.current!).getPropertyValue('--color-accent').trim(),
            dashArray: '4 4',
          },
        ).addTo(group);
    });
    return () => {
      disposed = true;
      group?.remove();
    };
  }, [props.shapes, props.vertices, ready]);
  return (
    <>
      <div
        ref={host}
        className="atlas-map-canvas"
        role="region"
        aria-label={`Mapa interactivo de ${props.config.name}`}
      />
      {warning && (
        <p className="atlas-map-warning" role="status">
          {warning}
        </p>
      )}
    </>
  );
}
