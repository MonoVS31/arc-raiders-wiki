import type { Category } from '../domain/schema';
const paths: Record<Category, string> = {
  map: 'M4 5l6-2 6 2 4-2v16l-4 2-6-2-6 2V5m6-2v16m6-14v16',
  weapon: 'M3 10h11l4-5h3v6l-6 2-2 6H9l1-6H3v-3m11 0v3',
  arc: 'M6 9l-3-4m15 4l3-4M6 15l-3 4m15-4l3 4M7 7h10l2 5-2 5H7l-2-5 2-5m3 5h4',
  grenade: 'M9 4h6v4m-7 1l-3 5 2 6h10l2-6-3-5H8m7-5h5',
  blueprint: 'M5 3h10l4 4v14H5V3m10 0v5h4M8 12h8m-8 4h5',
  project: 'M4 7h16v14H4V7m4 0V3h8v4m-4 0v14m-8-7h16',
  container: 'M3 7l9-4 9 4v13H3V7m0 0h18m-9 0v13m-3-7h6',
};
export function WikiIcon({ category }: { category: Category }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[category]} />
    </svg>
  );
}
