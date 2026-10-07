// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { transitionNavigation, entityTransitionName } from '../src/app/view-transitions';
import { catalog } from '../src/domain/catalog';
import { renderToStaticMarkup } from 'react-dom/server';
import { Gallery } from '../src/components/wiki/Gallery';
import { EntityDetail } from '../src/components/EntityDetail';
const originalTransition = Object.getOwnPropertyDescriptor(document, 'startViewTransition');
afterEach(() => {
  if (originalTransition)
    Object.defineProperty(document, 'startViewTransition', originalTransition);
  else delete (document as unknown as { startViewTransition?: unknown }).startViewTransition;
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
function media(reduced: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: reduced, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  );
}
it('navega inmediatamente cuando falta la API nativa', () => {
  const update = vi.fn();
  transitionNavigation(update);
  expect(update).toHaveBeenCalledTimes(1);
});
it('el movimiento reducido omite las transiciones nativas', () => {
  media(true);
  const start = vi.fn();
  Object.defineProperty(document, 'startViewTransition', { configurable: true, value: start });
  const update = vi.fn();
  transitionNavigation(update);
  expect(start).not.toHaveBeenCalled();
  expect(update).toHaveBeenCalledTimes(1);
  delete (document as unknown as { startViewTransition?: unknown }).startViewTransition;
});
it('la API confirma el cambio una sola vez y espera la imagen compartida', async () => {
  media(false);
  let callback!: () => Promise<void>;
  const start = vi.fn((update: () => Promise<void>) => {
    callback = update;
    return { ready: Promise.resolve(), updateCallbackDone: Promise.resolve() };
  });
  Object.defineProperty(document, 'startViewTransition', { configurable: true, value: start });
  const image = document.createElement('img');
  image.dataset.viewArt = 'weapon-kettle';
  image.decode = vi.fn().mockResolvedValue(undefined);
  document.body.append(image);
  try {
    const update = vi.fn();
    transitionNavigation(update, 'weapon-kettle');
    expect(update).not.toHaveBeenCalled();
    await callback();
    await callback();
    expect(update).toHaveBeenCalledTimes(1);
    expect(image.decode).toHaveBeenCalledTimes(1);
  } finally {
    image.remove();
    delete (document as unknown as { startViewTransition?: unknown }).startViewTransition;
  }
});
it('un rechazo de captura o una API que lance no rompe la navegación', async () => {
  media(false);
  const update = vi.fn();
  Object.defineProperty(document, 'startViewTransition', {
    configurable: true,
    value: () => {
      throw new Error('unsupported');
    },
  });
  transitionNavigation(update);
  expect(update).toHaveBeenCalledTimes(1);
  Object.defineProperty(document, 'startViewTransition', {
    configurable: true,
    value: (callback: () => Promise<void>) => {
      void callback();
      return {
        ready: Promise.reject(new Error('snapshot')),
        updateCallbackDone: Promise.resolve(),
      };
    },
  });
  transitionNavigation(update);
  await Promise.resolve();
  expect(update).toHaveBeenCalledTimes(2);
  delete (document as unknown as { startViewTransition?: unknown }).startViewTransition;
});
it('las imágenes de tarjeta y ficha comparten nombres únicos del catálogo', () => {
  expect(new Set(catalog.entities.map((entity) => entityTransitionName(entity.id))).size).toBe(
    catalog.entities.length,
  );
  for (const id of ['weapon-kettle', 'arc-hornet']) {
    const entity = catalog.entities.find((entity) => entity.id === id)!;
    expect(renderToStaticMarkup(<Gallery entities={[entity]} />)).toContain(
      `view-transition-name:${entityTransitionName(id)}`,
    );
    expect(renderToStaticMarkup(<EntityDetail entity={entity} />)).toContain(
      `view-transition-name:${entityTransitionName(id)}`,
    );
  }
});
