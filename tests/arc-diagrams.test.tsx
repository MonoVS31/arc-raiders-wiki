// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import ARCZoneExplorer from '../src/components/ARCZoneExplorer';
import { ARCCombatPanel } from '../src/components/CombatTools';
import { diagramFor, diagramHotspots } from '../src/domain/diagram-hotspots';
import { zonesForARC } from '../src/domain/arc-zones';
import { catalog } from '../src/domain/catalog';
import { WikiContext } from '../src/app/WikiContext';

let host: HTMLDivElement, root: Root;
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  vi.stubGlobal('matchMedia', () => ({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});
async function loadImage() {
  const image = host.querySelector('.diagram-image-plane img')!;
  Object.defineProperties(image, {
    complete: { value: true, configurable: true },
    naturalWidth: { value: 792, configurable: true },
    naturalHeight: { value: 630, configurable: true },
  });
  await act(async () => image.dispatchEvent(new Event('load')));
}
it('las entradas ARC apuntan solo a zonas originales, sin campos ni estados anunciados', () => {
  const arcDiagrams = diagramHotspots.filter(
    (diagram) =>
      catalog.entities.find((entity) => entity.id === diagram.entityId)?.category === 'arc',
  );
  expect(arcDiagrams.length).toBeGreaterThan(0);
  for (const diagram of arcDiagrams) {
    const entity = catalog.entities.find((entity) => entity.id === diagram.entityId)!;
    expect(entity.category).toBe('arc');
    expect(entity.availability).toBe('disponible');
    for (const point of diagram.puntos) {
      expect('zoneId' in point.ref).toBe(true);
      const ref = point.ref;
      if ('zoneId' in ref)
        expect(zonesForARC(diagram.entityId)!.zones.some((zone) => zone.id === ref.zoneId)).toBe(
          true,
        );
    }
  }
});
it('el retrato, las opciones y el panel se sincronizan sin señalar una zona no mapeada', async () => {
  const references = vi.fn();
  await act(async () =>
    root.render(
      <WikiContext.Provider value={{ navigate: vi.fn(), material: vi.fn(), references }}>
        <ARCZoneExplorer entityId="arc-firefly" />
      </WikiContext.Provider>,
    ),
  );
  await loadImage();
  const point = host.querySelector<HTMLButtonElement>('.diagram-hotspot')!;
  expect(point.getAttribute('aria-pressed')).toBe('true');
  const protection = host.querySelector<HTMLButtonElement>('.zone-option.protected')!;
  await act(async () => protection.click());
  expect(host.querySelector('.zone-detail h5')!.textContent).toBe('Cuatro propulsores blindados');
  expect(point.getAttribute('aria-pressed')).toBe('false');
  expect(protection.getAttribute('aria-pressed')).toBe('true');
  point.focus();
  expect(document.activeElement).toBe(point);
  await act(async () => point.click());
  expect(host.querySelector('.zone-detail h5')!.textContent).toBe('Depósito amarillo');
  expect(host.querySelector('.zone-condition')!.textContent).toContain('Lanzallamas extendido');
  expect(protection.getAttribute('aria-pressed')).toBe('false');
  const zone = zonesForARC('arc-firefly')!.zones.find((zone) => zone.id === 'tank')!;
  expect(host.querySelector('.zone-detail')!.textContent).toContain(zone.description);
  await act(async () =>
    (host.querySelector('.zone-detail .evidence-button') as HTMLButtonElement).click(),
  );
  expect(references).toHaveBeenCalledWith(zonesForARC('arc-firefly')!.sourceIds);
  expect(host.querySelectorAll('[aria-live=polite]')).toHaveLength(1);
  expect(host.textContent).toContain('Reportes posibles');
  expect(host.textContent).toContain('Los dibujos son orientativos');
});
it('seleccionar un núcleo oculto no crea un punto sobre la carcasa de Fireball', async () => {
  await act(async () => root.render(<ARCZoneExplorer entityId="arc-fireball" />));
  await loadImage();
  const point = host.querySelector<HTMLButtonElement>('.diagram-hotspot')!;
  expect(point.getAttribute('aria-pressed')).toBe('false');
  expect(host.querySelector('.zone-condition')!.textContent).toContain('Panel frontal abierto');
  expect(host.querySelector('.zone-detail')!.textContent).toContain(
    'Posición en este retrato: Pendiente de verificar.',
  );
  await act(async () =>
    (host.querySelector('.zone-option.protected') as HTMLButtonElement).click(),
  );
  expect(point.getAttribute('aria-pressed')).toBe('true');
  expect(host.querySelector('.zone-condition')!.textContent).toContain(
    'Mientras el panel está cerrado',
  );
});
it('una imagen fallida conserva la selección, fuentes y opciones ARC', async () => {
  await act(async () => root.render(<ARCZoneExplorer entityId="arc-firefly" />));
  await act(async () => host.querySelector('img')!.dispatchEvent(new Event('error')));
  expect(host.querySelector('.diagram-hotspot')).toBeNull();
  await act(async () =>
    (host.querySelector('.zone-option.protected') as HTMLButtonElement).click(),
  );
  expect(host.querySelector('.zone-detail h5')!.textContent).toBe('Cuatro propulsores blindados');
  expect(host.querySelector('.zone-detail .evidence-button')).not.toBeNull();
});
it('los ARC sin entrada mantienen sus esquemas y la distinción textual de las zonas', async () => {
  for (const [entityId, selector] of [
    ['arc-hornet', '.drone-diagram svg'],
    ['arc-surveyor', '.shell-diagram svg'],
    ['arc-tick', '.diagram-components .zone-options'],
  ]) {
    expect(diagramFor(entityId!)).toBeUndefined();
    await act(async () => root.render(<ARCZoneExplorer key={entityId} entityId={entityId!} />));
    expect(host.querySelector(selector!)).not.toBeNull();
    expect(host.querySelector('.arc-schematic-frame')).not.toBeNull();
    expect(host.querySelector('.diagram-image-plane')).toBeNull();
    expect(host.textContent).toContain('Los dibujos son orientativos');
  }
  expect(host.textContent).toContain('Sin dato específico');
  expect(host.textContent).toContain('Sin blindaje declarado');
});
it('el panel de combate evita repetir el retrato cuando hay diagrama y mantiene la atribución', async () => {
  const entity = catalog.entities.find((entity) => entity.id === 'arc-firefly')!;
  await act(async () => root.render(<ARCCombatPanel entity={entity} />));
  expect(host.querySelector('.arc-portrait')).toBeNull();
  await vi.waitFor(() => expect(host.querySelector('.diagram-image-plane img')).not.toBeNull());
  expect(host.querySelector('.diagram-attribution')!.textContent).toContain('Embark Studios');
  expect(host.querySelector('.diagram-attribution .evidence-button')).not.toBeNull();
});
