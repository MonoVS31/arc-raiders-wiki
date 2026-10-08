import type { Category } from '../../domain/schema';
import { categories } from '../EntityDetail';
import { catalog } from '../../domain/catalog';
import type { GuideSection } from '../../domain/category-guides';
import { categoryGuides } from '../../domain/category-guides';
import { HomeCategoryIcon, type HomeCategoryIconName } from './HomeCategoryIcon';

const categoryIcons: Record<Category, HomeCategoryIconName> = {
  map: 'map',
  weapon: 'weapon',
  arc: 'arc',
  grenade: 'equipment',
  blueprint: 'science',
  project: 'projects',
  container: 'container',
};

export function Sidebar({
  menu,
  setMenu,
  view,
  activeCategory,
  home,
  category,
  openMaterials,
  openGuide,
}: {
  menu: boolean;
  setMenu: (value: boolean) => void;
  view: string;
  activeCategory: Category;
  home: () => void;
  category: (value: Category) => void;
  openMaterials: () => void;
  openGuide: (value: GuideSection) => void;
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
            <HomeCategoryIcon name="home" />
            <span>Portada</span>
          </button>
          {(Object.keys(categoryIcons) as Category[]).map((value) => (
            <button
              key={value}
              onClick={() => category(value)}
              aria-current={view !== 'home' && activeCategory === value ? 'page' : undefined}
            >
              <HomeCategoryIcon name={categoryIcons[value]} />
              <span>{categories[value]}</span>
              <small>{catalog.entities.filter((entity) => entity.category === value).length}</small>
            </button>
          ))}
          <button onClick={openMaterials}>
            <HomeCategoryIcon name="loot" />
            <span>Botín y materiales</span>
          </button>
          {categoryGuides.sections.map((section) => (
            <button key={section.id} onClick={() => openGuide(section.id)}>
              <HomeCategoryIcon name={section.id} />
              <span>{section.title}</span>
            </button>
          ))}
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
