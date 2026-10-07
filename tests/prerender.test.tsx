// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { afterEach, expect, it, vi } from 'vitest';
import { catalog, sources } from '../src/domain/catalog';
import { prerenderDocument, socialCardSVG, publicSite } from '../src/prerender/article';
import { atlasRoot, entityLink, entityShareLink, requestedEntity } from '../src/domain/navigation';
import { readLocation } from '../src/app/useWikiNavigation';
import { atlasAsset, setAtlasAssetBase } from '../src/domain/assets';
import { localImage } from '../src/domain/images';
import { readAtlasData } from '../src/domain/data-loader';
import { startAtlas } from '../src/app/bootstrap';
const template = readFileSync('index.html', 'utf8')
  .replaceAll('%BASE_URL%', './')
  .replace('src="/src/app/main.tsx"', 'src="./assets/index.js"');
afterEach(() => {
  setAtlasAssetBase(import.meta.env.BASE_URL);
  document.body.replaceChildren();
});
it('cada ficha tiene HTML factual y metadatos propios sin ejecutar JavaScript', () => {
  for (const entity of catalog.entities) {
    const html = prerenderDocument(template, entity, catalog, sources);
    const page = new DOMParser().parseFromString(html, 'text/html');
    const canonical = `${publicSite}fichas/${entity.id}/`;
    expect(page.title).toBe(`${entity.name} · ARC Atlas`);
    expect(page.querySelector('link[rel=canonical]')?.getAttribute('href')).toBe(canonical);
    expect(page.querySelector('meta[property="og:url"]')?.getAttribute('content')).toBe(canonical);
    expect(page.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe(
      `${publicSite}social/fichas/${entity.id}.png`,
    );
    expect(page.querySelector('meta[name="description"]')?.getAttribute('content')).toContain(
      entity.availability,
    );
    expect(page.querySelector('meta[name="arc-atlas-root"]')?.getAttribute('content')).toBe(
      '../../',
    );
    expect(page.querySelector('script[type=module]')?.getAttribute('src')).toBe(
      '../../assets/index.js',
    );
    for (const claim of catalog.claims.filter((claim) => claim.subjectId === entity.id)) {
      const row = page.querySelector(`[data-claim-id="${claim.id}"]`)!;
      expect(row).not.toBeNull();
      expect(row.querySelector('.confidence')?.textContent).toBe(claim.confidence);
      expect(row.querySelector('.claim-note')?.textContent).toBe(claim.note);
      expect(row.querySelector('dd')?.textContent).toBe(
        claim.value === null
          ? 'Pendiente de verificar'
          : `${claim.value}${claim.unit ? ` ${claim.unit}` : ''}`,
      );
      expect([...row.querySelectorAll('a')].map((a) => a.getAttribute('href'))).toEqual(
        claim.sourceIds.map((id) => sources.find((source) => source.id === id)!.url),
      );
    }
  }
});
it('los nombres se escapan en HTML y en las tarjetas SVG', () => {
  const entity = { ...catalog.entities[0]!, name: '<script>alert("x")</script> & ficha' };
  const page = new DOMParser().parseFromString(
    prerenderDocument(template, entity, catalog, sources),
    'text/html',
  );
  expect(page.querySelectorAll('script')).toHaveLength(1);
  expect(page.querySelector('h1')?.textContent).toBe(entity.name);
  const svg = socialCardSVG(entity);
  expect(svg).not.toContain('<script>');
  expect(svg).toContain('&lt;script&gt;');
});
it('las rutas profundas abren la entidad y vuelven a la raíz sin romper el foco del mapa', () => {
  window.history.replaceState(null, '', `${publicSite}fichas/arc-hornet/`);
  expect(readLocation().id).toBe('arc-hornet');
  expect(
    requestedEntity('?entity=weapon-kettle', catalog.entities, window.location.pathname)?.id,
  ).toBe('weapon-kettle');
  expect(
    requestedEntity('', catalog.entities, '/arc-raiders-wiki/fichas/no-existe/'),
  ).toBeUndefined();
  expect(atlasRoot(window.location.href).href).toBe(publicSite);
  const context = entityShareLink(
    window.location.href,
    'map-dam-battlegrounds',
    'blueprint-hullcracker-blueprint',
    'arc-hornet',
  );
  const url = new URL(context);
  expect(url.pathname).toBe('/arc-raiders-wiki/fichas/map-dam-battlegrounds/');
  expect(url.searchParams.get('blueprint')).toBe('blueprint-hullcracker-blueprint');
  expect(url.searchParams.has('arc')).toBe(false);
  window.history.replaceState(null, '', context);
  expect(readLocation().blueprintId).toBe('blueprint-hullcracker-blueprint');
  expect(entityLink(window.location.href, 'arc-hornet')).toBe(
    `${publicSite}?entity=arc-hornet#catalog`,
  );
});
it('los datos, dossiers y las imágenes se resuelven desde la raíz en una ficha profunda', () => {
  const base = new URL('../../', `${publicSite}fichas/arc-hornet/`).href;
  setAtlasAssetBase(base);
  expect(atlasAsset('data/atlas/catalog.json')).toBe(`${publicSite}data/atlas/catalog.json`);
  expect(atlasAsset('data/dossiers/materials.json')).toBe(
    `${publicSite}data/dossiers/materials.json`,
  );
  const manifest = readAtlasData<{ assets: { originalUrl: string; path: string }[] }>(
    'image-assets.json',
  );
  expect(localImage(manifest.assets[0]!.originalUrl)).toBe(publicSite + manifest.assets[0]!.path);
});
it('el snapshot conserva todas las imágenes usadas y verifica sus bytes sin alterar la procedencia', () => {
  const manifest = readAtlasData<{
    assets: { originalUrl: string; path: string; sha256: string; bytes: number; license: string }[];
  }>('image-assets.json');
  const visuals = readAtlasData<{ url: string }[]>('entity-visuals.json');
  const portraits = readAtlasData<{ portraits: { imageUrl: string }[] }>('arc-portraits.json');
  const materials = JSON.parse(readFileSync('public/data/dossiers/materials.json', 'utf8')) as {
    icon: string | null;
  }[];
  const urls = new Set([
    ...visuals.map((x) => x.url),
    ...portraits.portraits.map((x) => x.imageUrl),
    ...materials.map((x) => x.icon).filter((x): x is string => !!x),
  ]);
  expect(new Set(manifest.assets.map((x) => x.originalUrl))).toEqual(urls);
  for (const asset of manifest.assets) {
    expect(asset.path).toMatch(/^images\/game\/[a-f0-9]{64}\.(png|webp|jpg)$/);
    expect(asset.license).toBe('no confirmada');
  }
});
it('conserva el artículo legible si falla la carga y permite reintentar', async () => {
  const root = document.createElement('div');
  root.innerHTML = '<main data-prerender><h1>Hornet</h1><p>Dato con evidencia</p></main>';
  document.body.append(root);
  const load = vi
    .fn()
    .mockRejectedValueOnce(Error('sin conexión'))
    .mockResolvedValueOnce(undefined);
  const render = vi.fn(async () => {
    root.textContent = 'Aplicación lista';
  });
  const stop = startAtlas(root, { load, render });
  await vi.waitFor(() => expect(root.querySelector('[role=alert]')).not.toBeNull());
  expect(root.querySelector('[data-prerender]')?.textContent).toContain('Dato con evidencia');
  root.querySelector('button')!.click();
  await vi.waitFor(() => expect(render).toHaveBeenCalledOnce());
  expect(root.textContent).toBe('Aplicación lista');
  stop();
});
