import { transitionNavigation } from './view-transitions';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { catalog } from '../domain/catalog';
import { requestedEntity, entityLink, atlasRoot } from '../domain/navigation';
import { categorySchema, type Category } from '../domain/schema';
import type { Filters } from '../domain/query';
import { mapManifest } from '../domain/maps';
import { blueprintRoutes } from '../domain/blueprints';
import { arcMapReports } from '../domain/arc-links';

export interface NavigationFocus {
  blueprintId?: string;
  arcId?: string;
}
const defaultFilters: Filters = {
  category: 'map',
  query: '',
  availability: 'disponible',
  confidence: 'all',
};
export function readLocation() {
  const params = new URLSearchParams(window.location.search);
  const entity = requestedEntity(params.toString(), catalog.entities, window.location.pathname);
  const category = categorySchema.safeParse(params.has('mapa') ? 'map' : params.get('category'));
  const map = entity && mapManifest.maps.find((map) => map.id === entity.id);
  const blueprintId = params.get('blueprint');
  const arcId = params.get('arc');
  const validBlueprint =
    map &&
    blueprintId &&
    blueprintRoutes.some(
      (route) => route.blueprintId === blueprintId && route.maps.includes(map.slug),
    );
  const validARC =
    !validBlueprint &&
    map &&
    arcId &&
    arcMapReports.some(
      (report) =>
        report.entityId === arcId && report.maps.some((report) => report.mapId === map.id),
    );
  return {
    view: entity ? 'article' : category.success ? 'category' : 'home',
    id: entity?.id ?? null,
    category: entity?.category ?? (category.success ? category.data : 'map'),
    availability:
      entity?.availability ??
      (category.success && category.data === 'project' ? 'all' : 'disponible'),
    blueprintId: validBlueprint ? blueprintId : null,
    arcId: validARC ? arcId : null,
  } as const;
}

export function useWikiNavigation(onNavigate: () => void) {
  const [initial] = useState(readLocation);
  const [view, setView] = useState<'home' | 'category' | 'article'>(initial.view);
  const [selectedId, setSelectedId] = useState<string | null>(initial.id);
  const [filters, setFilters] = useState<Filters>({
    ...defaultFilters,
    category: initial.category,
    availability: initial.availability,
  });
  const [focus, setFocus] = useState({ blueprintId: initial.blueprintId, arcId: initial.arcId });
  const [transition, setTransition] = useState({
    revision: 0,
    kind: 'push' as 'push' | 'pop',
    x: 0,
    y: 0,
  });
  const entryKey = useRef<string | null>(null);
  const positions = useRef(new Map<string, { x: number; y: number }>());

  useEffect(() => {
    // Cada entrada conserva su scroll, sin cambiar los parámetros públicos de la URL.
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    const key = window.history.state?.arcAtlasEntry ?? crypto.randomUUID();
    entryKey.current = key;
    window.history.replaceState(
      { ...window.history.state, arcAtlasEntry: key },
      '',
      window.location.href,
    );
    const saveScroll = () => {
      if (entryKey.current)
        positions.current.set(entryKey.current, { x: window.scrollX, y: window.scrollY });
    };
    const back = () => {
      const location = readLocation();
      const key = window.history.state?.arcAtlasEntry ?? crypto.randomUUID();
      entryKey.current = key;
      window.history.replaceState(
        { ...window.history.state, arcAtlasEntry: key },
        '',
        window.location.href,
      );
      const position = positions.current.get(key) ?? { x: window.scrollX, y: window.scrollY };
      setView(location.view);
      setSelectedId(location.id);
      setFilters({
        ...defaultFilters,
        category: location.category,
        availability: location.availability,
      });
      setFocus({ blueprintId: location.blueprintId, arcId: location.arcId });
      setTransition((current) => ({ revision: current.revision + 1, kind: 'pop', ...position }));
      onNavigate();
    };
    window.addEventListener('scroll', saveScroll, { passive: true });
    window.addEventListener('popstate', back);
    return () => {
      window.history.scrollRestoration = previousRestoration;
      window.removeEventListener('scroll', saveScroll);
      window.removeEventListener('popstate', back);
    };
  }, [onNavigate]);

  useLayoutEffect(() => {
    if (transition.kind === 'pop') {
      window.scrollTo({ left: transition.x, top: transition.y, behavior: 'instant' });
      return;
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (view === 'article') document.getElementById('catalog')?.focus({ preventScroll: true });
  }, [transition, view]);

  const push = (url: string) => {
    if (entryKey.current)
      positions.current.set(entryKey.current, { x: window.scrollX, y: window.scrollY });
    const key = crypto.randomUUID();
    entryKey.current = key;
    window.history.pushState({ arcAtlasEntry: key }, '', url);
    setTransition((current) => ({ revision: current.revision + 1, kind: 'push', x: 0, y: 0 }));
    onNavigate();
  };
  const home = () =>
    transitionNavigation(() => {
      setView('home');
      setSelectedId(null);
      setFocus({ blueprintId: null, arcId: null });
      const url = atlasRoot(window.location.href);
      url.search = '';
      url.hash = '';
      push(url.toString());
    });
  const category = (value: Category) =>
    transitionNavigation(() => {
      setFilters({
        ...defaultFilters,
        category: value,
        availability: value === 'project' ? 'all' : 'disponible',
      });
      setView('category');
      setSelectedId(null);
      setFocus({ blueprintId: null, arcId: null });
      const url = atlasRoot(window.location.href);
      url.search = '';
      url.searchParams.set('category', value);
      url.hash = 'catalog';
      push(url.toString());
    });
  const navigate = (id: string, next?: NavigationFocus) => {
    const entity = catalog.entities.find((entity) => entity.id === id);
    if (!entity) return;
    transitionNavigation(() => {
      setSelectedId(id);
      setFilters({
        ...defaultFilters,
        category: entity.category,
        availability: entity.availability,
      });
      setFocus({ blueprintId: next?.blueprintId ?? null, arcId: next?.arcId ?? null });
      setView('article');
      push(entityLink(window.location.href, id, next?.blueprintId, next?.arcId));
    }, id);
  };
  return {
    view,
    selected: catalog.entities.find((entity) => entity.id === selectedId),
    filters,
    setFilters,
    focus,
    home,
    category,
    navigate,
  };
}
