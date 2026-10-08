// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WeaponStudyViewer } from '../src/components/wiki/WeaponStudyViewer';
import { loadWeaponViewer } from '../src/domain/weapon-viewer-loader';
vi.mock('../src/domain/weapon-viewer-loader', () => ({ loadWeaponViewer: vi.fn() }));
let host: HTMLDivElement,
  root: Root,
  notify: (visible: boolean) => void,
  reduced = false;
const controls = {
  setSpin: vi.fn(),
  profile: vi.fn(),
  reset: vi.fn(),
  setVisible: vi.fn(),
  dispose: vi.fn(),
};
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  vi.clearAllMocks();
  reduced = false;
  vi.stubGlobal('matchMedia', () => ({
    matches: reduced,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: (entries: { isIntersecting: boolean }[]) => void) {
        notify = (visible) => callback([{ isIntersecting: visible }]);
      }
      observe() {}
      disconnect() {}
    },
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
const mount = async () =>
  act(async () => root.render(<WeaponStudyViewer entityId="weapon-tempest" name="Tempest" />));
it('espera a ser visible, conecta controles y libera el visor al cerrar', async () => {
  vi.mocked(loadWeaponViewer).mockResolvedValue({
    model: {},
    viewer: {
      createWeaponViewer: (_host, _design, callbacks) => {
        callbacks.onReady();
        callbacks.onSpin(true);
        return controls;
      },
    },
  });
  await mount();
  expect(loadWeaponViewer).not.toHaveBeenCalled();
  await act(async () => notify(true));
  expect(loadWeaponViewer).toHaveBeenCalledOnce();
  const buttons = host.querySelectorAll<HTMLButtonElement>('button');
  await act(async () => buttons[0]!.click());
  expect(controls.setSpin).toHaveBeenCalledWith(false);
  await act(async () => buttons[1]!.click());
  expect(controls.profile).toHaveBeenCalledOnce();
  await act(async () => buttons[2]!.click());
  expect(controls.reset).toHaveBeenCalledOnce();
  await act(async () => notify(false));
  expect(controls.setVisible).toHaveBeenLastCalledWith(false);
  await act(async () => root.render(<span />));
  expect(controls.dispose).toHaveBeenCalledOnce();
});
it('mantiene el perfil SVG si no hay WebGL o falla la carga', async () => {
  vi.mocked(loadWeaponViewer).mockRejectedValue(new Error('No WebGL'));
  await mount();
  await act(async () => notify(true));
  expect(host.querySelector('[data-viewer-state]')?.getAttribute('data-viewer-state')).toBe(
    'fallback',
  );
  expect(host.querySelector('img')?.alt).toContain('orientativo');
  expect(host.querySelector('button')?.disabled).toBe(true);
});
it('la preferencia de movimiento reducido desactiva el botón de giro automático', async () => {
  reduced = true;
  vi.mocked(loadWeaponViewer).mockResolvedValue({
    model: {},
    viewer: {
      createWeaponViewer: (_host, _design, callbacks) => {
        callbacks.onReady();
        callbacks.onSpin(false);
        return controls;
      },
    },
  });
  await mount();
  await act(async () => notify(true));
  expect(host.querySelector('button')?.disabled).toBe(true);
  expect(host.querySelectorAll<HTMLButtonElement>('button')[1]?.disabled).toBe(false);
});

it('la comprobación de rectángulo activa un visor visible aunque el observador falle con las esquinas recortadas', async () => {
  vi.useFakeTimers();
  const rect = vi
    .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    .mockReturnValue(new DOMRect(0, 0, 300, 200));
  vi.mocked(loadWeaponViewer).mockResolvedValue({
    model: {},
    viewer: {
      createWeaponViewer: (_host, _design, callbacks) => {
        callbacks.onReady();
        return controls;
      },
    },
  });
  try {
    await mount();
    await act(async () => {
      notify(false);
      await vi.advanceTimersByTimeAsync(20);
    });
    expect(loadWeaponViewer).toHaveBeenCalledOnce();
    expect(host.querySelector('[data-viewer-state]')?.getAttribute('data-viewer-state')).toBe(
      'ready',
    );
  } finally {
    rect.mockRestore();
    vi.useRealTimers();
  }
});
