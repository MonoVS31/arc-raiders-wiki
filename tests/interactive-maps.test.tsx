// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  interactiveMapSchema,
  mapLink,
  readProgress,
  saveProgress,
  emptyProgress,
  type AtlasPoint,
} from '../src/domain/interactive-maps';
import InteractiveMaps from '../src/components/InteractiveMaps';
import { mapManifest } from '../src/domain/maps';
vi.mock('../src/components/wiki/AtlasMapCanvas', () => ({
  default: ({
    points,
    placing,
    onPlace,
    onSelect,
  }: {
    points: AtlasPoint[];
    placing: boolean;
    onPlace: (x: number, y: number) => void;
    onSelect: (point: AtlasPoint) => void;
  }) => (
    <div>
      <button onClick={() => (placing ? onPlace(100, 200) : onSelect(points[0]!))}>
        Punto del visor
      </button>
      <span data-testid="visible">{points.length}</span>
    </div>
  ),
}));
let host: HTMLDivElement, root: Root;
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  localStorage.clear();
  window.history.replaceState({}, '', '/?mapa=dam');
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string) => ({
      ok: true,
      json: async () =>
        JSON.parse(
          readFileSync(
            `public/${new URL(input, window.location.href).pathname.replace(/^\//, '')}`,
            'utf8',
          ),
        ),
    })),
  );
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});
const click = async (name: string) => {
  const button = Array.from(host.querySelectorAll<HTMLButtonElement>('button')).find(
    (button) => button.textContent === name,
  )!;
  expect(button).toBeDefined();
  await act(async () => button.click());
};
const mount = async () => {
  await act(async () => root.render(<InteractiveMaps />));
};
const first = interactiveMapSchema.parse(
  JSON.parse(readFileSync('public/data/mapas/dam.json', 'utf8')),
).marcadores[0]!;
it.each(mapManifest.maps.map((map) => [map.slug, map.markerCount] as const))(
  'carga %s con sus categorías y pisos existentes',
  async (slug, total) => {
    window.history.replaceState({}, '', `/?mapa=${slug}`);
    await mount();
    const config = mapManifest.maps.find((map) => map.slug === slug)!;
    const data = interactiveMapSchema.parse(
      JSON.parse(readFileSync(`public/data/mapas/${slug}.json`, 'utf8')),
    );
    expect(data.marcadores).toHaveLength(total);
    expect(host.querySelector('[data-testid="visible"]')?.textContent).toBe(
      String(data.marcadores.filter((point) => point.capas.includes(config.defaultFloorId)).length),
    );
    expect(host.querySelectorAll('.atlas-map-picker button')).toHaveLength(6);
    expect(host.querySelector('select')?.querySelectorAll('option')).toHaveLength(
      mapManifest.maps.find((map) => map.slug === slug)!.floors.length,
    );
  },
);
it('el enlace directo abre un marcador aunque su categoría estuviera oculta', async () => {
  window.history.replaceState(
    {},
    '',
    `/?mapa=dam&marcador=${first.id}&categorias=${first.categoria}`,
  );
  await mount();
  expect(host.querySelector('.atlas-marker-detail')?.textContent).toContain(first.titulo);
  await click('MARCAR COMO ENCONTRADO');
  expect(readProgress('dam', localStorage).found).toContain(first.id);
  await act(async () => {
    const checkbox = host.querySelector<HTMLInputElement>('.atlas-progress input')!;
    checkbox.click();
  });
  expect(readProgress('dam', localStorage).hideFound).toBe(true);
  await click('Reiniciar progreso de este mapa');
  expect(host.querySelector('.atlas-confirm')).not.toBeNull();
  await click('Sí, reiniciar');
  expect(readProgress('dam', localStorage).found).toEqual([]);
});
it('ocultar y mostrar todo filtra los pines y recuerda las categorías por mapa', async () => {
  await mount();
  await click('OCULTAR TODO');
  expect(host.querySelector('[data-testid="visible"]')?.textContent).toBe('0');
  expect(readProgress('dam', localStorage).hidden.length).toBeGreaterThan(0);
  await click('MOSTRAR TODO');
  expect(host.querySelector('[data-testid="visible"]')?.textContent).toBe('464');
});
it('el editor guarda, mueve y borra marcadores personales sin cambiar los datos originales', async () => {
  window.history.replaceState({}, '', '/?mapa=dam&editor=1');
  await mount();
  await click('Agregar marcador o nombre de lugar');
  await click('Punto del visor');
  await act(async () => {
    const title = host.querySelector<HTMLInputElement>('.atlas-point-form input')!;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
    setter.call(title, 'Prueba personal');
    title.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await act(async () =>
    host
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })),
  );
  expect(readProgress('dam', localStorage).draft?.marcadores).toHaveLength(465);
  const added = readProgress('dam', localStorage).draft!.marcadores.at(-1)!;
  expect(added.evidencia).toBe('no confirmado');
  expect([added.x, added.y]).toEqual([100, 200]);
  await click('Mover');
  await click('Punto del visor');
  await click('Borrar del borrador');
  expect(readProgress('dam', localStorage).draft?.marcadores).toHaveLength(464);
});
it('exporta enlaces relativos correctos y tolera almacenamiento bloqueado o corrupto', () => {
  expect(mapLink('https://example.com/wiki/fichas/map-spaceport/', 'spaceport', 'abc', true)).toBe(
    'https://example.com/wiki/?mapa=spaceport&marcador=abc&editor=1',
  );
  expect(readProgress('dam', { getItem: () => '{oops' })).toEqual(emptyProgress());
  expect(
    readProgress('dam', {
      getItem: () => {
        throw new Error();
      },
    }),
  ).toEqual(emptyProgress());
  expect(
    saveProgress('dam', emptyProgress(), {
      setItem: () => {
        throw new Error();
      },
    }),
  ).toBe(false);
});
