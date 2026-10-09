import type { Category } from '../../domain/schema';
import { HomeCategoryIcon, type HomeCategoryIconName } from './HomeCategoryIcon';

const items: [Category, string, HomeCategoryIconName][] = [
  ['weapon', 'Armas', 'weapon'],
  ['map', 'Mapas', 'map'],
  ['arc', 'ARC', 'arc'],
  ['grenade', 'Granadas', 'equipment'],
];

// Barra inferior del celular, según el boceto móvil de ARC Atlas.
export function MobileNav({
  view,
  activeCategory,
  home,
  category,
}: {
  view: string;
  activeCategory: Category;
  home: () => void;
  category: (value: Category) => void;
}) {
  return (
    <nav className="mobile-nav" aria-label="Navegación rápida">
      <button onClick={home} aria-current={view === 'home' ? 'page' : undefined}>
        <HomeCategoryIcon name="home" />
        <span>Portada</span>
      </button>
      {items.map(([value, label, icon]) => (
        <button
          key={value}
          onClick={() => category(value)}
          aria-current={view !== 'home' && activeCategory === value ? 'page' : undefined}
        >
          <HomeCategoryIcon name={icon} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
