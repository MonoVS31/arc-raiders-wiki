import type { BlueprintRoute } from './acquisition-schema';
import type { MapConfig, MapMarker } from './maps';

export function traceForMap(
  route: BlueprintRoute | undefined,
  config: MapConfig,
  floorId: string,
  markers: MapMarker[],
): MapMarker[] {
  const trace = route?.traces?.find(
    (trace) => trace.mapSlug === config.slug && trace.floorId === floorId,
  );
  if (!trace) return [];
  const byId = new Map(markers.map((marker) => [marker.id, marker]));
  const points = trace.orderedMarkerIds.map((id) => byId.get(id));
  // Never infer an order from quest markers, truncate a filtered route or connect different floors.
  const floor = config.floors.find((floor) => floor.id === floorId);
  if (!floor || points.some((point) => !point || !(point.layerMask & (1 << floor.index))))
    return [];
  return points as MapMarker[];
}
export function pointInsideMap(point: { x: number; y: number }, size: { x: number; y: number }) {
  return (
    Number.isFinite(point.x) &&
    Number.isFinite(point.y) &&
    point.x >= 0 &&
    point.y >= 0 &&
    point.x <= size.x &&
    point.y <= size.y
  );
}
