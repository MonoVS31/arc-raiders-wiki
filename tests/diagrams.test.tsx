// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { catalog } from '../src/domain/catalog';
import { readAtlasData } from '../src/domain/data-loader';
import { resolveDiagramPoint, type Diagram } from '../src/domain/diagram-hotspots';
import { DiagramFrame } from '../src/components/wiki/DiagramFrame';
import { HotspotLayer } from '../src/components/wiki/HotspotLayer';
import { AtlasImage } from '../src/components/wiki/AtlasImage';
import { WikiContext } from '../src/app/WikiContext';
import { useVisibleAnimations } from '../src/app/useVisibleAnimations';
const image = readAtlasData<{ entityId: string; url: string }[]>('entity-visuals.json').find(
  (image) => image.entityId === 'weapon-kettle',
)!;
// Coordenadas sintéticas de controles, excluidas de los datos del sitio.
const diagram: Diagram = {
  entityId: image.entityId,
  imageUrl: image.url,
  puntos: [
    { id: 'cargador-prueba', x: 25, y: 55, lx: 25, ly: 20, ref: { field: 'Magazine Size' } },
    { id: 'dato-prueba', x: 75, y: 55, lx: 75, ly: 20, ref: { field: 'Damage' } },
  ],
};
let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});
async function loadImage() {
  const node = host.querySelector('img')!;
  Object.defineProperties(node, {
    complete: { value: true, configurable: true },
    naturalWidth: { value: 512, configurable: true },
    naturalHeight: { value: 256, configurable: true },
  });
  await act(async () => node.dispatchEvent(new Event('load')));
}
it('sin entrada o sin puntos conserva la imagen de hoy, sin marco ni capa', async () => {
  const fallback = <AtlasImage url={image.url} name="Kettle" />;
  await act(async () => root.render(fallback));
  const original = host.innerHTML;
  for (const entry of [undefined, { ...diagram, puntos: [] }]) {
    await act(async () => root.render(<HotspotLayer diagram={entry} fallback={fallback} />));
    expect(host.innerHTML).toBe(original);
    expect(host.querySelector('.diagram-frame')).toBeNull();
  }
});
it('los puntos son botones nativos enfocables y seleccionan datos y fuentes originales', async () => {
  const references = vi.fn(),
    select = vi.fn();
  await act(async () =>
    root.render(
      <WikiContext.Provider value={{ navigate: vi.fn(), material: vi.fn(), references }}>
        <HotspotLayer diagram={diagram} fallback={null} onSelect={select} />
      </WikiContext.Provider>,
    ),
  );
  await loadImage();
  const buttons = host.querySelectorAll<HTMLButtonElement>('.diagram-hotspot');
  expect(buttons).toHaveLength(2);
  expect(buttons[1]!.type).toBe('button');
  buttons[1]!.focus();
  expect(document.activeElement).toBe(buttons[1]);
  await act(async () => buttons[1]!.click());
  expect(select).toHaveBeenCalledWith(diagram.puntos[1]);
  expect(buttons[1]!.getAttribute('aria-pressed')).toBe('true');
  expect(buttons[0]!.getAttribute('aria-pressed')).toBe('false');
  const panel = host.querySelector('.diagram-panel')!;
  const original = resolveDiagramPoint(diagram.entityId, diagram.puntos[1]!).claim!;
  expect(original).toBe(
    catalog.claims.find(
      (claim) => claim.subjectId === diagram.entityId && claim.field === 'Damage',
    ),
  );
  expect(panel.textContent).toContain(String(original.value));
  expect(panel.getAttribute('aria-live')).toBe('polite');
  expect(buttons[1]!.getAttribute('aria-controls')).toBe(panel.id);
  await act(async () => (panel.querySelector('button') as HTMLButtonElement).click());
  expect(references).toHaveBeenCalledWith(original.sourceIds);
  expect(host.querySelector('img')!.getAttribute('height')).toBe('256');
});
it('una selección controlada se sincroniza con el panel externo', async () => {
  const select = vi.fn();
  await act(async () =>
    root.render(
      <HotspotLayer
        diagram={diagram}
        selectedId="dato-prueba"
        onSelect={select}
        renderPanel={(data) => <p>{data.label}</p>}
        fallback={null}
      />,
    ),
  );
  await loadImage();
  await act(async () => (host.querySelector('.diagram-hotspot') as HTMLButtonElement).click());
  expect(select).toHaveBeenCalledWith(diagram.puntos[0]);
  expect(host.querySelector('.diagram-panel')!.textContent).toBe('Daño declarado');
});
it('si falla la imagen se retiran los puntos y siguen los datos y las fuentes', async () => {
  await act(async () => root.render(<HotspotLayer diagram={diagram} fallback={null} />));
  await loadImage();
  await act(async () => host.querySelector('img')!.dispatchEvent(new Event('error')));
  expect(host.querySelector('.diagram-hotspot')).toBeNull();
  expect(host.querySelector('.image-skeleton')).toBeNull();
  expect(host.querySelector('[role=status]')!.textContent).toContain('No se pudo cargar');
  expect(host.querySelector('.diagram-panel')!.textContent).toContain('20');
  expect(host.querySelector('.diagram-panel .evidence-button')).not.toBeNull();
});
it('reduced motion no programa entrada y conserva controles y valores', async () => {
  const observer = vi.fn();
  vi.stubGlobal('IntersectionObserver', observer);
  vi.stubGlobal('matchMedia', () => ({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  await act(async () => root.render(<HotspotLayer diagram={diagram} fallback={null} />));
  await loadImage();
  expect(observer).not.toHaveBeenCalled();
  expect(host.querySelector('.diagram-frame')!.hasAttribute('data-reduced-motion')).toBe(true);
  expect(host.querySelectorAll('.diagram-hotspot')).toHaveLength(2);
  expect(host.querySelector('.diagram-panel')!.textContent).toContain('20');
  const css = readFileSync('src/styles/redesign.css', 'utf8');
  expect(css).toMatch(
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.diagram-panel \.stat-bar > span[\s\S]*animation: none/,
  );
});
it('el marco entra una vez y se pausa fuera de pantalla', async () => {
  const observers: {
    callback: (entries: { target: Element; isIntersecting: boolean }[]) => void;
    targets: Element[];
    disconnect: ReturnType<typeof vi.fn>;
  }[] = [];
  class Observer {
    targets: Element[] = [];
    disconnect = vi.fn();
    unobserve = vi.fn();
    constructor(
      public callback: (entries: { target: Element; isIntersecting: boolean }[]) => void,
    ) {
      observers.push(this);
    }
    observe = (node: Element) => this.targets.push(node);
  }
  vi.stubGlobal('IntersectionObserver', Observer);
  function Harness() {
    useVisibleAnimations();
    return (
      <DiagramFrame>
        <div className="diagram-reveal">Dato</div>
      </DiagramFrame>
    );
  }
  await act(async () => root.render(<Harness />));
  const frame = host.querySelector('.diagram-frame')!;
  const entry = observers[0]!,
    visibility = observers[1]!;
  await act(async () => entry.callback([{ target: frame, isIntersecting: true }]));
  expect(frame.hasAttribute('data-entered')).toBe(true);
  expect(entry.disconnect).toHaveBeenCalledOnce();
  visibility.callback([{ target: frame, isIntersecting: false }]);
  expect(frame.classList.contains('animation-paused')).toBe(true);
  visibility.callback([{ target: frame, isIntersecting: true }]);
  expect(frame.classList.contains('animation-paused')).toBe(false);
});
it('el editor de desarrollo muestra y copia porcentajes del área real de imagen', async () => {
  const copy = vi.fn().mockResolvedValue(undefined);
  vi.stubGlobal('navigator', { clipboard: { writeText: copy } });
  window.history.replaceState(null, '', '?editar-diagrama=1');
  await act(async () => root.render(<HotspotLayer diagram={diagram} fallback={null} />));
  await loadImage();
  const button = host.querySelector<HTMLButtonElement>('.diagram-editor-plane')!;
  vi.spyOn(button, 'getBoundingClientRect').mockReturnValue({
    left: 10,
    top: 20,
    width: 200,
    height: 100,
  } as DOMRect);
  await act(async () =>
    button.dispatchEvent(
      new MouseEvent('click', { bubbles: true, detail: 1, clientX: 50, clientY: 45 }),
    ),
  );
  expect(host.querySelector('output')!.textContent).toBe('x: 20.00, y: 25.00');
  expect(copy).toHaveBeenCalledWith('x: 20.00, y: 25.00');
});
it('el editor no aparece en producción aunque la URL pida editar', async () => {
  vi.stubEnv('DEV', false);
  window.history.replaceState(null, '', '?editar-diagrama=1');
  await act(async () => root.render(<HotspotLayer diagram={diagram} fallback={null} />));
  await loadImage();
  expect(host.querySelector('.diagram-editor')).toBeNull();
  expect(host.querySelector('.diagram-editor-plane')).toBeNull();
});
it('el editor puede registrar el primer punto desde una entrada vacía y muestra un fallo de copia', async () => {
  vi.stubGlobal('navigator', {
    clipboard: { writeText: vi.fn().mockRejectedValue(new Error('No disponible')) },
  });
  window.history.replaceState(null, '', '?editar-diagrama=1');
  await act(async () =>
    root.render(<HotspotLayer diagram={{ ...diagram, puntos: [] }} fallback={null} />),
  );
  await loadImage();
  const button = host.querySelector<HTMLButtonElement>('.diagram-editor-plane')!;
  vi.spyOn(button, 'getBoundingClientRect').mockReturnValue({
    left: 0,
    top: 0,
    width: 100,
    height: 100,
  } as DOMRect);
  await act(async () => button.click());
  expect(host.querySelector('output')!.textContent).toBe('x: 50.00, y: 50.00');
  expect(host.querySelector('.diagram-editor [role=status]')!.textContent).toContain(
    'No se pudo copiar',
  );
  expect(host.querySelector('.diagram-hotspot')).toBeNull();
});
