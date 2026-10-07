// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { useVisibleAnimations } from '../src/app/useVisibleAnimations';
it('pausa elementos fuera de pantalla y limpia el observer al desmontar', async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  let callback!: (entries: { target: Element; isIntersecting: boolean }[]) => void;
  const observe = vi.fn(),
    disconnect = vi.fn();
  class FakeObserver {
    constructor(next: typeof callback) {
      callback = next;
    }
    observe = observe;
    unobserve = vi.fn();
    disconnect = disconnect;
  }
  vi.stubGlobal('IntersectionObserver', FakeObserver);
  const host = document.createElement('div');
  host.id = 'root';
  document.body.append(host);
  const root = createRoot(host);
  function Harness() {
    useVisibleAnimations();
    return <div className="banner-orbit" />;
  }
  try {
    await act(async () => root.render(<Harness />));
    const element = host.querySelector('.banner-orbit')!;
    expect(observe).toHaveBeenCalledWith(element);
    expect(element.classList.contains('animation-paused')).toBe(true);
    callback([{ target: element, isIntersecting: true }]);
    expect(element.classList.contains('animation-paused')).toBe(false);
    callback([{ target: element, isIntersecting: false }]);
    expect(element.classList.contains('animation-paused')).toBe(true);
  } finally {
    await act(async () => root.unmount());
    host.remove();
    vi.unstubAllGlobals();
  }
  expect(disconnect).toHaveBeenCalledTimes(1);
});
