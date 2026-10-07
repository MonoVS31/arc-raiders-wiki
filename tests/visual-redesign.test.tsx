// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { CountUp } from '../src/components/wiki/CountUp';
import { AtlasImage } from '../src/components/wiki/AtlasImage';
import { useVisualEffects } from '../src/app/useVisualEffects';
import { useScrollSpy } from '../src/app/useScrollSpy';
import { numericBarScale, numericBarSeries } from '../src/domain/numeric-scale';
import { weaponTierMetric } from '../src/domain/combat';
import { catalog } from '../src/domain/catalog';
let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
function ReducedHarness() {
  useVisualEffects();
  return (
    <>
      <CountUp value="24" />
      <button className="portal-tile">Tarjeta</button>
    </>
  );
}
it('movimiento reducido conserva el contador final y no activa pointer ni requestAnimationFrame', async () => {
  const frames = vi.fn();
  const observer = vi.fn();
  vi.stubGlobal('requestAnimationFrame', frames);
  vi.stubGlobal('IntersectionObserver', observer);
  vi.stubGlobal('matchMedia', () => ({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  await act(async () => root.render(<ReducedHarness />));
  expect(host.querySelector('strong')?.getAttribute('aria-label')).toBe('24');
  expect(host.querySelector('strong')?.textContent).toBe('24');
  host
    .querySelector('button')!
    .dispatchEvent(new MouseEvent('pointermove', { bubbles: true, clientX: 50, clientY: 30 }));
  expect(frames).not.toHaveBeenCalled();
  expect(observer).not.toHaveBeenCalled();
  expect(host.querySelector('button')!.style.getPropertyValue('--tilt-x')).toBe('');
});
it('el skeleton conserva la imagen accesible y desaparece cuando carga', async () => {
  await act(async () => root.render(<AtlasImage url="/imagen-de-prueba.png" name="Kettle" />));
  expect(host.querySelector('.image-skeleton')?.getAttribute('aria-hidden')).toBe('true');
  const image = host.querySelector('img')!;
  expect(image.alt).toBe('Kettle');
  expect(image.getAttribute('width')).toBe('512');
  await act(async () => image.dispatchEvent(new Event('load')));
  expect(host.querySelector('.image-skeleton')).toBeNull();
  expect(host.querySelector('.image-ready')).not.toBeNull();
});
it('una imagen fallida no queda ocultando el icono de respaldo', async () => {
  await act(async () => root.render(<AtlasImage url="/imagen-inexistente.png" name="Kettle" />));
  await act(async () => host.querySelector('img')!.dispatchEvent(new Event('error')));
  expect(host.querySelector('img')).toBeNull();
  expect(host.querySelector('.image-skeleton')).toBeNull();
});
it('las barras no interpretan escalas mixtas, porcentajes ni valores desconocidos', () => {
  const claim = catalog.claims.find(
    (claim) => claim.field === 'Damage' && claim.subjectId === 'weapon-kettle',
  )!;
  const original = JSON.stringify(claim);
  expect(numericBarScale(claim, 'weapon')).toBeGreaterThan(0);
  expect(numericBarScale(claim, 'weapon')).toBeLessThanOrEqual(1);
  for (const value of ['30 (450 RPM)', '625 | 698 shots', '25%', null])
    expect(numericBarScale({ ...claim, value }, 'weapon')).toBeNull();
  expect(JSON.stringify(claim)).toBe(original);
});
it('las series de durabilidad y los multiplicadores conservan sus unidades y valores', () => {
  const durability = catalog.claims.find(
    (claim) => claim.subjectId === 'weapon-kettle' && claim.field === 'Durability',
  )!;
  const headshot = catalog.claims.find(
    (claim) => claim.subjectId === 'weapon-kettle' && claim.field === 'Headshot Multiplier',
  )!;
  const snapshot = JSON.stringify([durability, headshot]);
  const bars = numericBarSeries(durability, 'weapon')!;
  expect(bars).toHaveLength(4);
  expect(bars[3]).toBeGreaterThan(bars[0]!);
  expect(numericBarScale(weaponTierMetric('weapon-kettle', 'Durability', 'IV')!, 'weapon')).toBe(
    bars[3],
  );
  expect(numericBarScale(headshot, 'weapon')).toBeGreaterThan(0);
  expect(numericBarScale({ ...headshot, value: '2.5x' }, 'arc')).toBeGreaterThan(0);
  expect(numericBarScale({ ...headshot, field: 'Fire Rate' }, 'weapon')).toBeNull();
  expect(
    numericBarSeries({ ...durability, value: '625 | ? | 781 | 898 shots' }, 'weapon'),
  ).toBeNull();
  expect(JSON.stringify([durability, headshot])).toBe(snapshot);
});
function SpyHarness() {
  const active = useScrollSpy('weapon-kettle');
  return (
    <>
      <h2 id="detail-title">Kettle</h2>
      <dl id="datos" />
      <section id="fabricacion" />
      <a href="#datos" aria-current={active === 'datos' ? 'location' : undefined}>
        Estadísticas
      </a>
      <output>{active}</output>
    </>
  );
}
it('el índice resalta la sección visible y limpia sus callbacks al salir', async () => {
  let callback: FrameRequestCallback | undefined;
  vi.stubGlobal('requestAnimationFrame', (next: FrameRequestCallback) => {
    callback = next;
    return 42;
  });
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  await act(async () => root.render(<SpyHarness />));
  vi.spyOn(host.querySelector('#datos')!, 'getBoundingClientRect').mockReturnValue({
    top: 120,
  } as DOMRect);
  vi.spyOn(host.querySelector('#fabricacion')!, 'getBoundingClientRect').mockReturnValue({
    top: 800,
  } as DOMRect);
  await act(async () => callback?.(0));
  expect(host.querySelector('a')?.getAttribute('aria-current')).toBe('location');
  vi.spyOn(host.querySelector('#fabricacion')!, 'getBoundingClientRect').mockReturnValue({
    top: 110,
  } as DOMRect);
  await act(async () => {
    host.querySelector('#fabricacion')!.dispatchEvent(new Event('scroll'));
    callback?.(1);
  });
  expect(host.querySelector('output')?.textContent).toBe('fabricacion');
});
