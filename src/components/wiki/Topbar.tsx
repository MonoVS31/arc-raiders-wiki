import type { Category, Entity } from '../../domain/schema';
import { Breadcrumb } from './Breadcrumb';

export function Topbar({
  menu,
  setMenu,
  siteName,
  home,
  view,
  selected,
  activeCategory,
  openNews,
}: {
  menu: boolean;
  setMenu: (value: boolean) => void;
  siteName: string;
  home: () => void;
  view: string;
  selected: Entity | undefined;
  activeCategory: Category;
  openNews: () => void;
}) {
  return (
    <header className="wiki-topbar">
      <button
        className="menu-toggle"
        onClick={() => setMenu(!menu)}
        aria-label="Abrir menú"
        aria-expanded={menu}
      >
        ☰
      </button>
      <Breadcrumb
        siteName={siteName}
        home={home}
        view={view}
        selected={selected}
        activeCategory={activeCategory}
      />
      <div className="topbar-actions">
        <button onClick={openNews}>
          Frozen Trail <span className="new-label">ANUNCIADO</span>
        </button>
        <span className="edition-chip">EDICIÓN 2.0</span>
      </div>
    </header>
  );
}
