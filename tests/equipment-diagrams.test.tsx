// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { catalog } from '../src/domain/catalog';
import { diagramFor, diagramHotspots } from '../src/domain/diagram-hotspots';
import { combatClaim, weaponTierMetric, grenadeGeometry } from '../src/domain/combat';
import { numericBarScale } from '../src/domain/numeric-scale';
import { EntityDetail } from '../src/components/EntityDetail';
import { WeaponComparison, GrenadeEffectPanel } from '../src/components/CombatTools';
import { StatBars } from '../src/components/wiki/StatBars';
import { WikiContext } from '../src/app/WikiContext';

let host: HTMLDivElement, root: Root;
const entity = (id: string) => catalog.entities.find((entity) => entity.id === id)!;
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
it('los puntos de objetos leen campos originales del mismo sujeto', () => {
  const objects = diagramHotspots.filter((diagram) =>
    ['weapon', 'grenade'].includes(entity(diagram.entityId).category),
  );
  expect(objects.length).toBeGreaterThan(0);
  for (const diagram of objects) {
    expect(entity(diagram.entityId).availability).toBe('disponible');
    for (const point of diagram.puntos) {
      const ref = point.ref;
      expect('field' in ref).toBe(true);
      if ('field' in ref) expect(combatClaim(diagram.entityId, ref.field)).toBeDefined();
    }
  }
});
it('el visor 3D de Rattler reemplaza la imagen y conserva el cargador, evidencia y fuente originales', async () => {
  const references = vi.fn(),
    claim = combatClaim('weapon-rattler', 'Magazine Size')!,
    before = JSON.stringify(claim);
  await act(async () =>
    root.render(
      <WikiContext.Provider value={{ navigate: vi.fn(), material: vi.fn(), references }}>
        <EntityDetail entity={entity('weapon-rattler')} />
      </WikiContext.Provider>,
    ),
  );
  expect(host.querySelector('.viewer-embed iframe')?.getAttribute('src')).toContain(
    'armas-3d.html?embed#rattler',
  );
  expect(host.querySelector('.diagram-hotspot')).toBeNull();
  const field = Array.from(host.querySelectorAll('.weapon-study-summary>div')).find(
    (field) => field.querySelector('dt')?.textContent === 'Cargador',
  )!;
  expect(field.textContent).toContain(String(claim.value));
  expect(field.textContent).toContain(claim.confidence);
  await act(async () => field.querySelector<HTMLButtonElement>('button')!.click());
  expect(references).toHaveBeenCalledWith(claim.sourceIds);
  expect(JSON.stringify(claim)).toBe(before);
});
it('sin relación pieza-campo muestra el visor 3D y no agrega puntos de diagrama', async () => {
  for (const [id, page] of [
    ['weapon-kettle', 'armas-3d.html?embed#kettle'],
    ['grenade-heavy-fuze-grenade', 'arrojadizos-3d.html?embed#pesada'],
  ] as const) {
    expect(diagramFor(id)).toBeUndefined();
    await act(async () => root.render(<EntityDetail key={id} entity={entity(id)} />));
    expect(host.querySelector('.article-hero-diagram')).toBeNull();
    expect(host.querySelector('.viewer-embed iframe')?.getAttribute('src')).toContain(page);
    expect(host.querySelector('.diagram-hotspot')).toBeNull();
  }
});
it('el marco del comparador conserva la selección I–IV y sus números', async () => {
  const original = JSON.stringify(combatClaim('weapon-rattler', 'Magazine Size'));
  await act(async () => root.render(<WeaponComparison entity={entity('weapon-rattler')} />));
  expect(host.querySelector('.diagram-tool-frame')).not.toBeNull();
  expect(host.querySelector('.diagram-scan')).toBeNull();
  const tier = host.querySelector<HTMLSelectElement>('.tier-card select')!;
  await act(async () => {
    tier.value = 'IV';
    tier.dispatchEvent(new Event('change', { bubbles: true }));
  });
  const row = [...host.querySelectorAll('.combat-table tbody tr')].find(
    (row) => row.querySelector('th')!.textContent === 'Cargador',
  )!;
  expect(row.querySelector('td strong')!.textContent).toBe(
    String(weaponTierMetric('weapon-rattler', 'Magazine Size', 'IV')!.value),
  );
  expect(JSON.stringify(combatClaim('weapon-rattler', 'Magazine Size'))).toBe(original);
});
it('el visor conserva radios y advertencias de granadas sin convertirlos a daño', async () => {
  await act(async () =>
    root.render(<GrenadeEffectPanel entity={entity('grenade-heavy-fuze-grenade')} />),
  );
  expect(host.querySelector('.diagram-tool-frame')).not.toBeNull();
  expect(host.querySelector('input')!.max).toBe(
    String(grenadeGeometry('grenade-heavy-fuze-grenade')!.radius * 1.5),
  );
  expect(host.querySelector('svg')!.getAttribute('viewBox')).toBe('0 0 240 180');
  expect(host.textContent).toContain('No garantiza impacto');
  for (const id of ['grenade-wolfpack', 'grenade-trailblazer']) {
    await act(async () => root.render(<GrenadeEffectPanel key={id} entity={entity(id)} />));
    expect(host.querySelector('.effect-diagram')).toBeNull();
    expect(host.textContent).toContain('No hay un radio circular verificado');
    expect(host.textContent).toContain('No debe interpretarse automáticamente como una explosión');
  }
});
it('las barras usan el mismo valor final con movimiento reducido y son decorativas', async () => {
  const observer = vi.fn();
  vi.stubGlobal('IntersectionObserver', observer);
  const claim = combatClaim('weapon-tempest', 'Magazine Size')!;
  await act(async () => root.render(<StatBars claim={claim} category="weapon" />));
  const frame = host.querySelector('.diagram-stat-frame')!;
  expect(frame.getAttribute('aria-hidden')).toBe('true');
  expect(frame.hasAttribute('data-reduced-motion')).toBe(true);
  expect(host.querySelector('.stat-bar > span')!.getAttribute('style')).toContain(
    `scaleX(${numericBarScale(claim, 'weapon')})`,
  );
  expect(host.querySelector('.diagram-scan')).toBeNull();
  expect(observer).not.toHaveBeenCalled();
});
