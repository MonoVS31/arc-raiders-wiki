// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { readLocation, useWikiNavigation } from '../src/app/useWikiNavigation';
import { blueprintRoutes } from '../src/domain/blueprints';
import { mapManifest } from '../src/domain/maps';
import { arcMapReports } from '../src/domain/arc-links';

let root: Root;
let host: HTMLDivElement;
let navigation: ReturnType<typeof useWikiNavigation>;
const closePanels = vi.fn();
function Harness() {
  navigation = useWikiNavigation(closePanels);
  return (
    <main id="catalog" tabIndex={-1}>
      {navigation.view}
    </main>
  );
}
function scroll(top: number) {
  Object.defineProperty(window, 'scrollY', { configurable: true, value: top });
  window.dispatchEvent(new Event('scroll'));
}
async function traverse(direction: 'back' | 'forward') {
  await act(async () => {
    const changed = new Promise<void>((resolve) =>
      window.addEventListener('popstate', () => resolve(), { once: true }),
    );
    window.history[direction]();
    await changed;
  });
}
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  Object.defineProperty(window, 'scrollX', { configurable: true, value: 0 });
  Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });
  window.history.scrollRestoration = 'auto';
  vi.spyOn(window, 'scrollTo').mockImplementation((options: ScrollToOptions | number = 0) => {
    if (typeof options === 'object') {
      Object.defineProperty(window, 'scrollY', { configurable: true, value: options.top ?? 0 });
      Object.defineProperty(window, 'scrollX', { configurable: true, value: options.left ?? 0 });
    }
  });
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.restoreAllMocks();
  closePanels.mockClear();
});
it('conserva los parámetros de categoría, ficha, plano y ARC de las URLs existentes', () => {
  window.history.replaceState(null, '', '?category=project');
  expect(readLocation()).toMatchObject({
    view: 'category',
    category: 'project',
    availability: 'all',
  });
  window.history.replaceState(null, '', '?entity=weapon-kettle');
  expect(readLocation()).toMatchObject({
    view: 'article',
    id: 'weapon-kettle',
    category: 'weapon',
  });
  const route = blueprintRoutes.find((route) => route.maps.length > 0)!;
  const map = mapManifest.maps.find((map) => map.slug === route.maps[0])!;
  window.history.replaceState(null, '', `?entity=${map.id}&blueprint=${route.blueprintId}`);
  expect(readLocation()).toMatchObject({ id: map.id, blueprintId: route.blueprintId, arcId: null });
  const report = arcMapReports.find((report) => report.maps.length > 0)!;
  window.history.replaceState(null, '', `?entity=${report.maps[0]!.mapId}&arc=${report.entityId}`);
  expect(readLocation()).toMatchObject({ arcId: report.entityId, blueprintId: null });
  window.history.replaceState(null, '', '?category=invalid&entity=missing');
  expect(readLocation()).toMatchObject({ view: 'home', id: null });
});
it('vuelve al inicio en navegación nueva y restaura el scroll al ir atrás y adelante', async () => {
  await act(async () => root.render(<Harness />));
  scroll(430);
  await act(async () => navigation.category('weapon'));
  expect(window.location.search).toBe('?category=weapon');
  expect(window.scrollY).toBe(0);
  scroll(650);
  await act(async () => navigation.navigate('weapon-kettle'));
  expect(window.location.search).toBe('?entity=weapon-kettle');
  expect(window.scrollY).toBe(0);
  scroll(270);
  vi.mocked(window.scrollTo).mockClear();
  await traverse('back');
  expect(navigation.view).toBe('category');
  expect(navigation.filters.category).toBe('weapon');
  expect(window.scrollY).toBe(650);
  expect(window.scrollTo).toHaveBeenCalledExactlyOnceWith({
    left: 0,
    top: 650,
    behavior: 'instant',
  });
  vi.mocked(window.scrollTo).mockClear();
  await traverse('forward');
  expect(navigation.selected?.id).toBe('weapon-kettle');
  expect(window.scrollY).toBe(270);
  expect(window.scrollTo).toHaveBeenCalledExactlyOnceWith({
    left: 0,
    top: 270,
    behavior: 'instant',
  });
  await traverse('back');
  await traverse('back');
  expect(navigation.view).toBe('home');
  expect(window.scrollY).toBe(430);
  expect(window.history.scrollRestoration).toBe('manual');
  await act(async () => root.unmount());
  expect(window.history.scrollRestoration).toBe('auto');
});
it('genera URLs de mapa con contexto de plano o ARC y cierra los paneles', async () => {
  await act(async () => root.render(<Harness />));
  const route = blueprintRoutes.find((route) => route.maps.length > 0)!;
  const map = mapManifest.maps.find((map) => map.slug === route.maps[0])!;
  await act(async () => navigation.navigate(map.id, { blueprintId: route.blueprintId }));
  expect(new URLSearchParams(window.location.search).get('blueprint')).toBe(route.blueprintId);
  const report = arcMapReports.find((report) => report.maps.length > 0)!;
  await act(async () => navigation.navigate(report.maps[0]!.mapId, { arcId: report.entityId }));
  expect(new URLSearchParams(window.location.search).get('arc')).toBe(report.entityId);
  await act(async () => navigation.home());
  expect(window.location.search).toBe('');
  expect(window.location.hash).toBe('');
  expect(closePanels).toHaveBeenCalledTimes(3);
});

it('una ficha estática conserva el historial al visitar la portada y volver', async () => {
  window.history.replaceState(
    null,
    '',
    'https://monovs31.github.io/arc-raiders-wiki/fichas/arc-hornet/',
  );
  await act(async () => root.render(<Harness />));
  expect(navigation.selected?.id).toBe('arc-hornet');
  scroll(480);
  await act(async () => navigation.home());
  expect(window.location.pathname).toBe('/arc-raiders-wiki/');
  expect(navigation.view).toBe('home');
  await traverse('back');
  expect(navigation.selected?.id).toBe('arc-hornet');
  expect(window.scrollY).toBe(480);
});
