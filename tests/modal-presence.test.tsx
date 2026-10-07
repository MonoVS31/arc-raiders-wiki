// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import ModalStack from '../src/components/ModalStack';
const prototype = HTMLDialogElement.prototype;
const originalShow = Object.getOwnPropertyDescriptor(prototype, 'showModal');
const originalClose = Object.getOwnPropertyDescriptor(prototype, 'close');
beforeEach(() => {
  Object.defineProperty(prototype, 'showModal', {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    },
  });
  Object.defineProperty(prototype, 'close', {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.removeAttribute('open');
    },
  });
});
afterEach(() => {
  if (originalShow) Object.defineProperty(prototype, 'showModal', originalShow);
  else delete (prototype as unknown as { showModal?: unknown }).showModal;
  if (originalClose) Object.defineProperty(prototype, 'close', originalClose);
  else delete (prototype as unknown as { close?: unknown }).close;
  vi.unstubAllGlobals();
});
it('la pila conserva el diálogo durante la salida y después devuelve el scroll', async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  );
  vi.stubGlobal('CSS', { supports: () => true });
  const show = vi.spyOn(HTMLDialogElement.prototype, 'showModal').mockImplementation(function (
    this: HTMLDialogElement,
  ) {
    this.setAttribute('open', '');
  });
  const close = vi.spyOn(HTMLDialogElement.prototype, 'close').mockImplementation(function (
    this: HTMLDialogElement,
  ) {
    this.removeAttribute('open');
  });
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () =>
      root.render(<ModalStack panels={[{ kind: 'news' }]} onClose={() => {}} />),
    );
    expect(host.querySelector('dialog[open]')).not.toBeNull();
    expect(document.body.style.overflow).toBe('hidden');
    await act(async () => root.render(<ModalStack panels={[]} onClose={() => {}} />));
    expect(host.querySelector('dialog[open]')).toBeNull();
    expect(host.querySelector('dialog')).not.toBeNull();
    await act(async () => new Promise((resolve) => setTimeout(resolve, 300)));
    expect(host.querySelector('dialog')).toBeNull();
    expect(document.body.style.overflow).toBe('');
  } finally {
    await act(async () => root.unmount());
    host.remove();
    show.mockRestore();
    close.mockRestore();
    vi.unstubAllGlobals();
  }
});
it('el movimiento reducido evita esperar la animación de salida', async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  );
  vi.stubGlobal('CSS', { supports: () => true });
  const show = vi.spyOn(HTMLDialogElement.prototype, 'showModal').mockImplementation(function (
    this: HTMLDialogElement,
  ) {
    this.setAttribute('open', '');
  });
  const close = vi.spyOn(HTMLDialogElement.prototype, 'close').mockImplementation(function (
    this: HTMLDialogElement,
  ) {
    this.removeAttribute('open');
  });
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () =>
      root.render(<ModalStack panels={[{ kind: 'news' }]} onClose={() => {}} />),
    );
    await act(async () => root.render(<ModalStack panels={[]} onClose={() => {}} />));
    expect(host.querySelector('dialog')).toBeNull();
    expect(document.body.style.overflow).toBe('');
  } finally {
    await act(async () => root.unmount());
    host.remove();
    show.mockRestore();
    close.mockRestore();
    vi.unstubAllGlobals();
  }
});
