import { readFileSync, readdirSync } from 'node:fs';
import { expect, it, vi } from 'vitest';
import { createJsonCache } from '../src/domain/data-loader';
import { updateMarkerSelection } from '../src/domain/map-markers';
it('comparte la solicitud en curso y reutiliza el JSON en memoria', async () => {
  let resolve!: (value: Response) => void;
  const request = vi.fn<typeof fetch>().mockReturnValue(
    new Promise<Response>((done) => {
      resolve = done;
    }),
  );
  const cache = createJsonCache(request);
  expect(() => cache.read('catalog.json')).toThrow('todavía');
  const first = cache.load('catalog.json'),
    second = cache.load('catalog.json');
  expect(request).toHaveBeenCalledTimes(1);
  resolve(new Response(JSON.stringify({ entities: [] })));
  const data = await first;
  expect(await second).toBe(data);
  expect(await cache.load('catalog.json')).toBe(data);
  expect(cache.read('catalog.json')).toBe(data);
  expect(request).toHaveBeenCalledTimes(1);
  expect(request.mock.calls[0]![0]).toBe(`${import.meta.env.BASE_URL}data/atlas/catalog.json`);
});
it('una respuesta fallida no queda cacheada y permite reintentar', async () => {
  const request = vi
    .fn<typeof fetch>()
    .mockResolvedValueOnce(new Response('', { status: 503 }))
    .mockResolvedValueOnce(new Response('{"ready":true}'));
  const cache = createJsonCache(request);
  await expect(cache.load('catalog.json')).rejects.toThrow('No se pudo cargar');
  expect(await cache.load('catalog.json')).toEqual({ ready: true });
  expect(request).toHaveBeenCalledTimes(2);
});
it('un JSON inválido también se puede reintentar', async () => {
  const request = vi
    .fn<typeof fetch>()
    .mockResolvedValueOnce(new Response('html'))
    .mockResolvedValueOnce(new Response('[]'));
  const cache = createJsonCache(request);
  await expect(cache.load('sources.json')).rejects.toThrow();
  expect(await cache.load('sources.json')).toEqual([]);
  expect(request).toHaveBeenCalledTimes(2);
});
it('al seleccionar se actualizan solo el marcador anterior y el nuevo', () => {
  const old = { setStyle: vi.fn(), setRadius: vi.fn() },
    next = { setStyle: vi.fn(), setRadius: vi.fn() },
    other = { setStyle: vi.fn(), setRadius: vi.fn() };
  const markers = new Map([
    ['old', old],
    ['next', next],
    ['other', other],
  ]);
  updateMarkerSelection(markers, new Map([['old', '#d9ed99']]), 'old', 'next');
  expect(old.setStyle).toHaveBeenCalledExactlyOnceWith({ color: '#d9ed99' });
  expect(old.setRadius).toHaveBeenCalledExactlyOnceWith(6);
  expect(next.setStyle).toHaveBeenCalledExactlyOnceWith({ color: '#fff' });
  expect(next.setRadius).toHaveBeenCalledExactlyOnceWith(10);
  expect(other.setStyle).not.toHaveBeenCalled();
  expect(other.setRadius).not.toHaveBeenCalled();
  old.setStyle.mockClear();
  next.setStyle.mockClear();
  updateMarkerSelection(markers, new Map(), 'next', 'next');
  expect(next.setStyle).not.toHaveBeenCalled();
  expect(old.setStyle).not.toHaveBeenCalled();
  updateMarkerSelection(markers, new Map(), 'missing', null);
});

it('las animaciones CSS propias modifican solo transform y opacity', () => {
  for (const name of readdirSync('src/styles').filter((name) => name.endsWith('.css'))) {
    const css = readFileSync(`src/styles/${name}`, 'utf8');
    for (const block of css.matchAll(/@keyframes [^{]+\{([\s\S]*?)\n {2}\}/g)) {
      for (const declaration of block[1]!.matchAll(/([a-z-]+)\s*:/g))
        expect(['transform', 'opacity'], `${name}: ${declaration[1]}`).toContain(declaration[1]);
    }
  }
});
