export interface SelectableMarker {
  setStyle(style: { color: string }): unknown;
  setRadius(radius: number): unknown;
}
export function updateMarkerSelection(
  markers: ReadonlyMap<string, SelectableMarker>,
  colors: ReadonlyMap<string, string>,
  previous: string | null,
  selected: string | null,
) {
  if (previous === selected) return;
  if (previous) {
    const marker = markers.get(previous);
    if (marker) {
      marker.setStyle({ color: colors.get(previous) ?? '#fff' });
      marker.setRadius(6);
    }
  }
  if (selected) {
    const marker = markers.get(selected);
    if (marker) {
      marker.setStyle({ color: '#fff' });
      marker.setRadius(10);
    }
  }
}
