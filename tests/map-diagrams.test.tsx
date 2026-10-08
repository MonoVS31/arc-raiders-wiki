// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import type { Map as LeafletMap } from 'leaflet';
import { mapConfigSchema, mapManifest, parseSnapshot, markerMatches } from '../src/domain/maps';
import { blueprintRoutes, type BlueprintRoute } from '../src/domain/blueprints';
import { pointInsideMap, traceForMap } from '../src/domain/map-diagrams';
import { MapDiagramOverlay } from '../src/components/wiki/MapDiagramOverlay';

const config = mapManifest.maps[0]!;
const snapshot = parseSnapshot(
  JSON.parse(readFileSync(`public/data/maps/${config.slug}.json`, 'utf8')),
  config,
);
const floor = config.floors.find((floor) => floor.id === config.defaultFloorId)!;
const markers = snapshot.markers.filter((marker) =>
  markerMatches(marker, {
    kind: 'weapon-case',
    floorIndex: floor.index,
    conditionBit: null,
    query: '',
  }),
);
it('las rutas actuales no se convierten en polilíneas por inferencia', () => {
  for (const route of blueprintRoutes) {
    expect(route.traces ?? []).toEqual([]);
    expect(traceForMap(route, config, floor.id, markers)).toEqual([]);
  }
});
it('un trazo con referencias explícitas conserva orden y coordenadas; los filtros no lo truncarán', () => {
  // Orden sintético de prueba: no se añade al JSON ni se presenta como recorrido real.
  const route: BlueprintRoute = {
    ...blueprintRoutes[0]!,
    traces: [
      {
        mapSlug: config.slug,
        floorId: floor.id,
        orderedMarkerIds: [markers[1]!.id, markers[0]!.id],
        sourceIds: blueprintRoutes[0]!.sourceIds,
      },
    ],
  };
  const original = JSON.stringify(markers);
  const trace = traceForMap(route, config, floor.id, markers);
  expect(trace).toEqual([markers[1], markers[0]]);
  expect(trace[0]).toBe(markers[1]);
  expect(traceForMap(route, config, 'otro-piso', markers)).toEqual([]);
  expect(traceForMap(route, config, floor.id, [markers[0]!])).toEqual([]);
  expect(JSON.stringify(markers)).toBe(original);
});
it('no hay etiquetas de región nuevas y una etiqueta futura requiere texto, fuente y coordenadas finitas', () => {
  expect(mapManifest.maps.every((map) => (map.regionLabels ?? []).length === 0)).toBe(true);
  const label = {
    lat: markers[0]!.lat,
    lng: markers[0]!.lng,
    texto: 'Etiqueta de prueba',
    fuente: `metaforge-${config.slug}`,
  };
  expect(mapConfigSchema.parse({ ...config, regionLabels: [label] }).regionLabels).toEqual([label]);
  for (const invalid of [
    { ...label, texto: '' },
    { ...label, fuente: '' },
    { ...label, fuente: 'fuente-inexistente' },
    { ...label, lat: Infinity },
  ])
    expect(mapConfigSchema.safeParse({ ...config, regionLabels: [invalid] }).success).toBe(false);
});
it('el pulso solo se muestra dentro de la superficie del mapa', () => {
  expect(pointInsideMap({ x: 0, y: 0 }, { x: 300, y: 200 })).toBe(true);
  expect(pointInsideMap({ x: 300, y: 200 }, { x: 300, y: 200 })).toBe(true);
  for (const point of [
    { x: -1, y: 0 },
    { x: 301, y: 0 },
    { x: 0, y: 201 },
    { x: NaN, y: 1 },
  ])
    expect(pointInsideMap(point, { x: 300, y: 200 })).toBe(false);
});
it('el overlay reproyecta con Leaflet, actualiza la guía y limpia listeners sin modificar el mapa', async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const layout = document.createElement('div'),
    host = document.createElement('div'),
    detail = document.createElement('section'),
    container = document.createElement('div');
  detail.innerHTML = '<h4>Reporte de prueba</h4>';
  layout.append(host, detail, container);
  document.body.append(layout);
  vi.spyOn(layout, 'getBoundingClientRect').mockReturnValue({
    left: 5,
    top: 15,
    width: 500,
    height: 250,
  } as DOMRect);
  vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
    left: 10,
    top: 20,
    width: 302,
    height: 202,
  } as DOMRect);
  vi.spyOn(detail, 'getBoundingClientRect').mockReturnValue({
    left: 400,
    top: 50,
    width: 100,
    height: 100,
  } as DOMRect);
  vi.spyOn(detail.querySelector('h4')!, 'getBoundingClientRect').mockReturnValue({
    top: 55,
    height: 20,
  } as DOMRect);
  Object.defineProperties(container, { clientLeft: { value: 1 }, clientTop: { value: 2 } });
  let callback: FrameRequestCallback | undefined, listener: (() => void) | undefined;
  vi.stubGlobal('requestAnimationFrame', (next: FrameRequestCallback) => {
    callback = next;
    return 123;
  });
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  const project = vi.fn().mockReturnValue({ x: 60, y: 70 }),
    off = vi.fn();
  const map = {
    getContainer: () => container,
    getSize: () => ({ x: 300, y: 200 }),
    latLngToContainerPoint: project,
    on: vi.fn((_events: string, next: () => void) => {
      listener = next;
    }),
    off,
  } as unknown as LeafletMap;
  const root = createRoot(host);
  try {
    await act(async () =>
      root.render(
        <MapDiagramOverlay
          map={map}
          selected={markers[0]!}
          trace={[]}
          layoutRef={{ current: layout }}
          detailRef={{ current: detail }}
        />,
      ),
    );
    await act(async () => callback?.(0));
    expect(project).toHaveBeenCalledWith([markers[0]!.lat, markers[0]!.lng]);
    const pulse = host.querySelector<HTMLElement>('.map-selection-position')!;
    expect(pulse.style.transform).toBe('translate3d(61px, 72px, 0)');
    expect(pulse.style.opacity).toBe('1');
    const line = layout.querySelector('.map-selection-guide line')!;
    expect(line.getAttribute('x1')).toBe('66');
    expect(line.getAttribute('y1')).toBe('77');
    expect(line.getAttribute('x2')).toBe('395');
    expect(line.getAttribute('y2')).toBe('50');
    project.mockReturnValue({ x: 350, y: 70 });
    listener?.();
    await act(async () => callback?.(1));
    expect(pulse.style.opacity).toBe('0');
    expect(container.style.transform).toBe('');
  } finally {
    await act(async () => root.unmount());
    layout.remove();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  }
  expect(off).toHaveBeenCalledWith('move zoom resize', expect.any(Function));
});
