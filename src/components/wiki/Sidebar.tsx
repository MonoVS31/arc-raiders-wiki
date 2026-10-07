import type { Category } from '../../domain/schema';
import { categories } from '../EntityDetail';
import { catalog } from '../../domain/catalog';
import { categorySchema } from '../../domain/schema';
import { WikiIcon } from '../WikiIcon';

export function Sidebar({
  menu,
  setMenu,
  view,
  activeCategory,
  home,
  category,
  openMaterials,
}: {
  menu: boolean;
  setMenu: (value: boolean) => void;
  view: string;
  activeCategory: Category;
  home: () => void;
  category: (value: Category) => void;
  openMaterials: () => void;
}) {
  return (
    <>
      {menu && (
        <button
          className="menu-backdrop"
          aria-label="Cerrar navegación"
          onClick={() => setMenu(false)}
        />
      )}
      <aside className={`wiki-sidebar ${menu ? 'is-open' : ''}`}>
        <button className="sidebar-close" aria-label="Cerrar menú" onClick={() => setMenu(false)}>
          ×
        </button>
        <button className="wiki-brand" onClick={home}>
          <span className="atlas-symbol" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>
            ARC <b>ATLAS</b>
            <small>ARCHIVO DEL RUST BELT</small>
          </span>
        </button>
        <div className="sidebar-label">EXPLORAR</div>
        <nav aria-label="Categorías del catálogo">
          <button onClick={home} aria-current={view === 'home' ? 'page' : undefined}>
            <span className="home-icon" aria-hidden="true">
              ⌂
            </span>
            Portada
          </button>
          {categorySchema.options.map((value) => (
            <button
              key={value}
              onClick={() => category(value)}
              aria-current={view !== 'home' && activeCategory === value ? 'page' : undefined}
            >
              <WikiIcon category={value} />
              <span>{categories[value]}</span>
              <small>{catalog.entities.filter((entity) => entity.category === value).length}</small>
            </button>
          ))}
          <button onClick={openMaterials}>
            <span aria-hidden="true">◈</span> Materiales y recursos
          </button>
        </nav>
        <div className="sidebar-bottom">
          <span className="signal-dot" /> ARCHIVO EN LÍNEA
          <small>
            Datos con evidencia por campo
            <br />
            Comunidad independiente
          </small>
        </div>
      </aside>
    </>
  );
}
