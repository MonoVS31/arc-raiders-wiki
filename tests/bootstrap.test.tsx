// @vitest-environment jsdom
import { expect, it, vi } from 'vitest';
import { startAtlas } from '../src/app/bootstrap';
it('muestra carga, error y reintento antes de descargar la interfaz', async () => {
  let reject!: (error: Error) => void;
  const load = vi
    .fn()
    .mockReturnValueOnce(
      new Promise((_, fail) => {
        reject = fail;
      }),
    )
    .mockResolvedValueOnce([]);
  const render = vi.fn(async (root: HTMLElement) => {
    root.textContent = 'Wiki lista';
  });
  const host = document.createElement('div');
  document.body.append(host);
  const dispose = startAtlas(host, { load, render });
  try {
    expect(host.querySelector('[role=status]')?.textContent).toContain('Cargando');
    expect(render).not.toHaveBeenCalled();
    reject(new Error('offline'));
    await vi.waitFor(() =>
      expect(host.querySelector('[role=alert]')?.textContent).toContain('No se pudo cargar'),
    );
    const button = host.querySelector('button')!;
    expect(button.textContent).toBe('Reintentar');
    button.click();
    await vi.waitFor(() => expect(host.textContent).toBe('Wiki lista'));
    expect(load).toHaveBeenCalledTimes(2);
    expect(render).toHaveBeenCalledExactlyOnceWith(host);
  } finally {
    dispose();
    host.remove();
  }
});
it('un arranque cancelado no monta la wiki al terminar la solicitud', async () => {
  let resolve!: (data: unknown) => void;
  const load = () =>
    new Promise((done) => {
      resolve = done;
    });
  const render = vi.fn(async () => {});
  const host = document.createElement('div');
  const dispose = startAtlas(host, { load, render });
  dispose();
  resolve([]);
  await Promise.resolve();
  expect(render).not.toHaveBeenCalled();
});
