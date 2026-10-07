import type { Category, Entity } from '../../domain/schema';
import { categories } from '../EntityDetail';
export function Breadcrumb({
  siteName,
  home,
  view,
  selected,
  activeCategory,
}: {
  siteName: string;
  home: () => void;
  view: string;
  selected: Entity | undefined;
  activeCategory: Category;
}) {
  return (
    <nav className="breadcrumb" aria-label="Ruta de navegación">
      <ol>
        <li>
          <button onClick={home}>{siteName}</button>
        </li>
        <li aria-current="page">
          <span aria-hidden="true">/</span>
          <span>
            {view === 'home' ? 'Portada' : (selected?.name ?? categories[activeCategory])}
          </span>
        </li>
      </ol>
    </nav>
  );
}
