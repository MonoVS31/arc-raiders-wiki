import { mapCategories } from '../../domain/interactive-maps';
const outlines = {
  locations: 'M4 21V4H20V21H14V14H10V21ZM8 7H10V10H8ZM14 7H16V10H14Z',
  services: 'M8 7A4 4 0 1 0 16 7A4 4 0 1 0 8 7ZM3 22C3 10 21 10 21 22Z',
  loot: 'M2 6H22V21H2ZM6 2H18V5H6ZM9 10V17H15V10Z',
  nature: 'M11 22V13C1 14 1 4 2 3C11 3 12 8 12 10C13 3 18 1 22 1C23 10 18 14 14 14V22Z',
  missions: 'M12 1L23 12 12 23 1 12ZM12 6L6 12 12 18 18 12Z',
  enemies: 'M6 3H18L21 13 17 16 21 23H17L13 17H11L7 23H3L7 16 3 13ZM8 7V11H11V7ZM13 7V11H16V7Z',
  other: 'M9 1H15V9H23V15H15V23H9V15H1V9H9Z',
  events: 'M13 1L3 14H10L8 23 21 9H14Z',
  zones: 'M1 4L8 1 16 4 23 1V20L16 23 8 20 1 23ZM8 5V17H10V5ZM15 7V19H17V7Z',
};
// Dibujos propios: silueta del grupo y pequeños cortes distintos por categoría.
// Se rasterizan una sola vez por categoría para los pines del canvas.
export const mapSymbolPaths: Record<string, string> = Object.fromEntries(
  mapCategories.map((category, index) => [
    category.id,
    outlines[category.group] +
      `M${3 + (index % 6) * 3} 18h2v2h-2Z` +
      `M${3 + (Math.floor(index / 6) % 6) * 3} 4h1v2h-1Z`,
  ]),
);
Object.assign(mapSymbolPaths, {
  key: 'M2 7A5 5 0 1 0 12 7A5 5 0 1 0 2 7ZM5 7A2 2 0 1 1 9 7A2 2 0 1 1 5 7ZM11 9L23 21 20 24 17 21 17 18 14 18 10 13Z',
  'weapon-crate': 'M2 4H22V21H2ZM5 8V11H14V14H18V8ZM9 11L7 17H11L13 11Z',
  'medical-box': 'M2 5H22V22H2ZM7 1H17V4H7ZM10 8V12H6V16H10V20H14V16H18V12H14V8Z',
  zipline: 'M1 3H23V5H1ZM10 5H14V9H10ZM6 11H18L16 22H8Z',
  location: 'M3 5H21V9H14V23H10V9H3Z',
  airshaft: 'M2 2H22V22H2ZM5 5V8H19V5ZM5 11V14H19V11ZM5 17V19H19V17Z',
  mushroom: 'M1 13C1-3 23-3 23 13H15V23H9V13Z',
  'bunker-antenna':
    'M11 8H13V22H11ZM4 2L6 4C2 8 2 12 6 16L4 18C-2 12-2 8 4 2ZM20 2C26 8 26 12 20 18L18 16C22 12 22 8 18 4Z',
});
export function MapSymbol({ category }: { category: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={mapSymbolPaths[category]} fill="currentColor" fillRule="evenodd" />
    </svg>
  );
}
