// @vitest-environment jsdom
import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { GlobalSearch } from '../src/components/wiki/GlobalSearch';
import { App } from '../src/app/WikiApp';
import { catalog } from '../src/domain/catalog';
let host: HTMLDivElement;
let root: Root;
const navigate = vi.fn();
const results = catalog.entities.filter((entity) => entity.name.includes('Hullcracker'));
function SearchHarness({ empty = false }: { empty?: boolean }) {
  const [query, setQuery] = useState('Hull');
  return (
    <>
      <GlobalSearch
        globalSearch={query}
        setGlobalSearch={setQuery}
        globalResults={empty ? [] : results}
        navigate={navigate}
      />
      <button>Después de la búsqueda</button>
    </>
  );
}
async function key(input: HTMLInputElement, value: string) {
  await act(async () => {
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true }),
    );
  });
}
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.restoreAllMocks();
  navigate.mockReset();
});
it('el combobox mantiene el foco y permite seleccionar con flechas y Enter', async () => {
  await act(async () => root.render(<SearchHarness />));
  const input = host.querySelector<HTMLInputElement>('[role=combobox]')!;
  await act(async () => input.focus());
  expect(input.getAttribute('aria-expanded')).toBe('true');
  expect(document.getElementById(input.getAttribute('aria-controls')!)?.getAttribute('role')).toBe(
    'listbox',
  );
  expect(host.querySelectorAll('[role=option]')).toHaveLength(results.length);
  expect(input.hasAttribute('aria-activedescendant')).toBe(false);
  await key(input, 'ArrowDown');
  let active = document.getElementById(input.getAttribute('aria-activedescendant')!)!;
  expect(active.textContent).toContain(results[0]!.name);
  expect(active.getAttribute('aria-selected')).toBe('true');
  expect(document.activeElement).toBe(input);
  await key(input, 'ArrowDown');
  expect(
    document.getElementById(input.getAttribute('aria-activedescendant')!)!.textContent,
  ).toContain(results[1]!.name);
  await key(input, 'ArrowUp');
  active = document.getElementById(input.getAttribute('aria-activedescendant')!)!;
  expect(active.textContent).toContain(results[0]!.name);
  await key(input, 'Enter');
  expect(navigate).toHaveBeenCalledExactlyOnceWith(results[0]!.id);
  expect(input.value).toBe('');
  expect(input.getAttribute('aria-expanded')).toBe('false');
  expect(input.hasAttribute('aria-activedescendant')).toBe(false);
});
it('Escape cierra sin borrar la consulta, las flechas reabren y Tab no se intercepta', async () => {
  await act(async () => root.render(<SearchHarness />));
  const input = host.querySelector<HTMLInputElement>('[role=combobox]')!;
  await act(async () => input.focus());
  await key(input, 'ArrowDown');
  await key(input, 'Escape');
  expect(input.value).toBe('Hull');
  expect(input.getAttribute('aria-expanded')).toBe('false');
  expect(input.hasAttribute('aria-activedescendant')).toBe(false);
  expect(navigate).not.toHaveBeenCalled();
  await key(input, 'ArrowUp');
  expect(input.getAttribute('aria-expanded')).toBe('true');
  expect(
    document.getElementById(input.getAttribute('aria-activedescendant')!)!.textContent,
  ).toContain(results.at(-1)!.name);
  const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
  await act(async () => input.dispatchEvent(tab));
  expect(tab.defaultPrevented).toBe(false);
  await act(async () => host.querySelector<HTMLButtonElement>('button')!.focus());
  expect(input.getAttribute('aria-expanded')).toBe('false');
});
it('una búsqueda sin resultados anuncia el estado y no abre opciones inexistentes', async () => {
  await act(async () => root.render(<SearchHarness empty />));
  const input = host.querySelector<HTMLInputElement>('[role=combobox]')!;
  expect(input.getAttribute('aria-expanded')).toBe('false');
  expect(host.querySelector('[role=status]')?.textContent).toContain('No hay coincidencias');
  await key(input, 'ArrowDown');
  await key(input, 'Enter');
  expect(navigate).not.toHaveBeenCalled();
  expect(input.hasAttribute('aria-activedescendant')).toBe(false);
});
it('las opciones también se pueden abrir con un clic', async () => {
  await act(async () => root.render(<SearchHarness />));
  await act(async () => host.querySelector<HTMLElement>('[role=option]')!.click());
  expect(navigate).toHaveBeenCalledExactlyOnceWith(results[0]!.id);
});
it.each([
  ['', 'Archivo de campo · ARC Atlas'],
  ['?category=weapon', 'Armas · ARC Atlas'],
  ['?entity=weapon-kettle', 'Kettle · ARC Atlas'],
  ['?entity=arc-hornet', 'Hornet · ARC Atlas'],
])('el título corresponde a la URL inicial %s', async (url, title) => {
  window.history.replaceState(null, '', url || '/arc-raiders-wiki/');
  await act(async () => root.render(<App />));
  expect(document.title).toBe(title);
});
it('el título sigue la navegación y el historial, con breadcrumb y enlaces reales', async () => {
  await act(async () => root.render(<App />));
  const arsenal = Array.from(host.querySelectorAll<HTMLButtonElement>('button')).find((button) =>
    button.textContent?.startsWith('Armas'),
  )!;
  await act(async () => arsenal.click());
  expect(document.title).toBe('Armas · ARC Atlas');
  const breadcrumb = host.querySelector('nav[aria-label="Ruta de navegación"]')!;
  expect(breadcrumb.querySelector('ol')).not.toBeNull();
  expect(breadcrumb.querySelector('[aria-current=page]')?.textContent).toContain('Armas');
  const card = host.querySelector<HTMLAnchorElement>('.gallery-card')!;
  expect(card.tagName).toBe('A');
  expect(new URL(card.href).searchParams.get('entity')).toBe('weapon-kettle');
  await act(async () => card.click());
  expect(document.title).toBe('Kettle · ARC Atlas');
  await act(async () => {
    const changed = new Promise<void>((resolve) =>
      window.addEventListener('popstate', () => resolve(), { once: true }),
    );
    window.history.back();
    await changed;
  });
  expect(document.title).toBe('Armas · ARC Atlas');
});

it('la opción activa se mantiene visible dentro de una lista con scroll', async () => {
  await act(async () => root.render(<SearchHarness />));
  const input = host.querySelector<HTMLInputElement>('[role=combobox]')!;
  const list = host.querySelector<HTMLUListElement>('[role=listbox]')!;
  const options = host.querySelectorAll<HTMLElement>('[role=option]');
  const bounds = (top: number, bottom: number) => ({
    top,
    bottom,
    left: 0,
    right: 200,
    width: 200,
    height: bottom - top,
    x: 0,
    y: top,
    toJSON: () => ({}),
  });
  vi.spyOn(list, 'getBoundingClientRect').mockReturnValue(bounds(0, 20));
  vi.spyOn(options[0]!, 'getBoundingClientRect').mockReturnValue(bounds(0, 20));
  vi.spyOn(options[1]!, 'getBoundingClientRect').mockReturnValue(bounds(20, 40));
  await key(input, 'ArrowDown');
  expect(list.scrollTop).toBe(0);
  await key(input, 'ArrowDown');
  expect(list.scrollTop).toBe(20);
});
