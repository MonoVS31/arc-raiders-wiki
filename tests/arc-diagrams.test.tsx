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
it('con boceto 3D propio, las opciones y el panel se sincronizan sin el retrato del juego', async () => {
  const references = vi.fn();
  await act(async () =>
    root.render(
      <WikiContext.Provider value={{ navigate: vi.fn(), material: vi.fn(), references }}>
        <ARCZoneExplorer entityId="arc-firefly" />
      </WikiContext.Provider>,
    ),
  );
  expect(host.querySelector('.diagram-image-plane')).toBeNull();
  expect(host.querySelector('.arc-schematic-frame')).not.toBeNull();
  expect(host.textContent).not.toContain('Embark Studios');
  const protection = host.querySelector<HTMLButtonElement>('.zone-option.protected')!;
  await act(async () => protection.click());
  expect(host.querySelector('.zone-detail h5')!.textContent).toBe('Cuatro propulsores blindados');
  expect(protection.getAttribute('aria-pressed')).toBe('true');
  const tank = [...host.querySelectorAll<HTMLButtonElement>('.zone-option.weak')].find((button) =>
    button.textContent!.includes('Depósito amarillo'),
  )!;
  await act(async () => tank.click());
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
it('el núcleo oculto de Fireball conserva su condición sin dibujarse sobre una foto', async () => {
  await act(async () => root.render(<ARCZoneExplorer entityId="arc-fireball" />));
  expect(host.querySelector('.diagram-hotspot.zone-point img')).toBeNull();
  expect(host.querySelector('.diagram-image-plane')).toBeNull();
  expect(host.querySelector('.zone-condition')!.textContent).toContain('Panel frontal abierto');
  await act(async () =>
    (host.querySelector('.zone-option.protected') as HTMLButtonElement).click(),
  );
  expect(host.querySelector('.zone-condition')!.textContent).toContain(
    'Mientras el panel está cerrado',
  );
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
it('el panel de combate no muestra retratos del juego cuando hay boceto 3D', async () => {
  const entity = catalog.entities.find((entity) => entity.id === 'arc-firefly')!;
  await act(async () => root.render(<ARCCombatPanel entity={entity} />));
  await vi.waitFor(() => expect(host.querySelector('.arc-zones')).not.toBeNull());
  expect(host.querySelector('.arc-portrait')).toBeNull();
  expect(host.querySelector('img')).toBeNull();
  expect(host.textContent).not.toContain('Embark Studios');
});
