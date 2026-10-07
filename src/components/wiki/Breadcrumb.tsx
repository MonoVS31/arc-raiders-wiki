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
    <div className="breadcrumb">
      <button onClick={home}>{siteName}</button>
      <span>/</span>
      <span>{view === 'home' ? 'Portada' : (selected?.name ?? categories[activeCategory])}</span>
    </div>
  );
}
