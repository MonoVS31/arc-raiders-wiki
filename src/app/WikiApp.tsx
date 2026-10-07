import { lazy, Suspense, useCallback, useMemo, useState, useEffect } from 'react';
import { catalog } from '../domain/catalog';
import { findEntities } from '../domain/query';
import type { Category } from '../domain/schema';
import { categories } from '../components/EntityDetail';
import { WikiContext } from './WikiContext';
import type { WikiPanel } from '../components/WikiModal';
import { useWikiNavigation } from './useWikiNavigation';
import { Sidebar } from '../components/wiki/Sidebar';
import { Topbar } from '../components/wiki/Topbar';
import { HomeView } from '../components/wiki/HomeView';
import { CategoryView } from '../components/wiki/CategoryView';
import { ArticleView } from '../components/wiki/ArticleView';
const WikiModal = lazy(() => import('../components/WikiModal'));
export function App() {
  const [panels, setPanels] = useState<WikiPanel[]>([]);
  const panel = panels.at(-1);
  const [menu, setMenu] = useState(false);
  const closeNavigationPanels = useCallback(() => {
    setPanels([]);
    setMenu(false);
  }, []);
  const { view, selected, filters, setFilters, focus, home, category, navigate } =
    useWikiNavigation(closeNavigationPanels);
  const [globalSearch, setGlobalSearch] = useState('');
  const globalResults = useMemo(
    () =>
      globalSearch.trim().length > 1
        ? findEntities(catalog, {
            category: 'all',
            query: globalSearch,
            availability: 'all',
            confidence: 'all',
          }).slice(0, 7)
        : [],
    [globalSearch],
  );
  const entities = useMemo(() => findEntities(catalog, filters), [filters]);
  const siteName = import.meta.env.VITE_SITE_NAME || 'ARC Atlas';
  useEffect(() => {
    const name =
      view === 'article'
        ? selected?.name
        : view === 'category'
          ? categories[filters.category as Category]
          : 'Archivo de campo';
    document.title = `${name ?? 'Archivo de campo'} · ARC Atlas`;
  }, [view, selected?.name, filters.category]);
  const open = (value: WikiPanel) => setPanels((current) => [...current, value]);
  const actions = {
    navigate,
    references: (ids: string[]) => open({ kind: 'references', ids }),
    material: (name: string) => open({ kind: 'material', name }),
  };
  return (
    <WikiContext.Provider value={actions}>
      <a className="skip-link" href="#catalog">
        Ir al contenido
      </a>
      <Sidebar
        menu={menu}
        setMenu={setMenu}
        view={view}
        activeCategory={filters.category as Category}
        home={home}
        category={category}
        openMaterials={() => open({ kind: 'materials' })}
      />
      <div className="wiki-shell">
        <Topbar
          menu={menu}
          setMenu={setMenu}
          siteName={siteName}
          home={home}
          view={view}
          selected={selected}
          activeCategory={filters.category as Category}
          openNews={() => open({ kind: 'news' })}
        />
        <main id="catalog" className="wiki-main" tabIndex={-1}>
          {view === 'home' ? (
            <HomeView
              category={category}
              open={open}
              globalSearch={globalSearch}
              setGlobalSearch={setGlobalSearch}
              globalResults={globalResults}
              navigate={navigate}
            />
          ) : view === 'category' ? (
            <CategoryView filters={filters} setFilters={setFilters} entities={entities} />
          ) : selected ? (
            <ArticleView
              selected={selected}
              focus={focus}
              category={category}
              navigate={navigate}
            />
          ) : null}
        </main>
        <footer className="wiki-footer">
          <span className="footer-brand">
            ARC <b>ATLAS</b>
          </span>
          <p>
            Wiki comunitaria independiente. ARC Raiders y sus assets pertenecen a Embark Studios.
            Datos y referencias visuales con atribución a sus fuentes.
          </p>
          <button
            onClick={() =>
              open({
                kind: 'references',
                ids: ['metaforge-local-item-catalog', 'metaforge-calibration'],
              })
            }
          >
            Créditos y fuentes
          </button>
          <span>V2.0 / ARCHIVO EN ESPAÑOL</span>
        </footer>
      </div>
      {panel && (
        <Suspense
          fallback={
            <div className="panel-loading" role="status">
              Abriendo archivo…
            </div>
          }
        >
          <WikiModal
            key={panels.length + panel.kind}
            panel={panel}
            onClose={() => setPanels((current) => current.slice(0, -1))}
          />
        </Suspense>
      )}
    </WikiContext.Provider>
  );
}
