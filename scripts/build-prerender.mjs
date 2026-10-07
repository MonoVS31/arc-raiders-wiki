import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createServer } from 'vite';
import { Resvg } from '@resvg/resvg-js';
const dist = new URL('../dist/', import.meta.url);
const readData = async (name) =>
  JSON.parse(await readFile(new URL(`../public/data/atlas/${name}`, import.meta.url), 'utf8'));
const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  resolve: { preserveSymlinks: true },
});
try {
  const api = await server.ssrLoadModule('/src/prerender/article.tsx');
  const [
    rawCatalog,
    sources,
    mapManifest,
    acquisitionData,
    researchAudit,
    projectBlueprintRewards,
    projectPeriods,
    extraStats,
  ] = await Promise.all(
    [
      'catalog.json',
      'sources.json',
      'maps/manifest.json',
      'blueprint-routes.json',
      'research-audit.json',
      'project-blueprint-rewards.json',
      'project-periods.json',
      'extra-stats.json',
    ].map(readData),
  );
  const catalog = api.composeCatalog({
    rawCatalog,
    mapManifest,
    acquisitionData,
    researchAudit,
    projectBlueprintRewards,
    projectPeriods,
    extraStats,
  });
  api.validateCatalog(catalog, sources);
  const template = await readFile(new URL('index.html', dist), 'utf8');
  await mkdir(new URL('social/fichas/', dist), { recursive: true });
  for (const entity of catalog.entities) {
    const directory = new URL(`fichas/${entity.id}/`, dist);
    await mkdir(directory, { recursive: true });
    const svg = api.socialCardSVG(entity);
    const png = new Resvg(svg, { font: { loadSystemFonts: true, defaultFontFamily: 'Arial' } })
      .render()
      .asPng();
    await writeFile(new URL(`social/fichas/${entity.id}.png`, dist), png);
    await writeFile(
      new URL('index.html', directory),
      api.prerenderDocument(template, entity, catalog, sources),
    );
  }
  const urls = [
    api.publicSite,
    ...catalog.entities.map((entity) => `${api.publicSite}fichas/${entity.id}/`),
  ];
  await writeFile(
    new URL('sitemap.xml', dist),
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((url) => `<url><loc>${api.escapeAttribute(url)}</loc></url>`).join('')}</urlset>`,
  );
  await writeFile(
    new URL('robots.txt', dist),
    `User-agent: *\nAllow: /\nSitemap: ${api.publicSite}sitemap.xml\n`,
  );
  console.log(
    `Prerender: ${catalog.entities.length} fichas con HTML y PNG propios. Tarjetas originales sin imágenes del juego.`,
  );
} finally {
  await server.close();
}
