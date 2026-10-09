// Genera las miniaturas de las tarjetas a partir de los visores 3D reales.
// Uso: npm run build && npx vite preview --port 4173 (en otra terminal) y después
//      node scripts/build-viewer-sketches.mjs
// Necesita Playwright con Chromium instalado (npx playwright install chromium).
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const base = process.env.ATLAS_PREVIEW ?? 'http://127.0.0.1:4173/';
const viewers = [
  ['armas-3d.html', 'public/weapon-sketches'],
  ['arrojadizos-3d.html', 'public/throwable-sketches'],
];
const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 960, height: 480 }, deviceScaleFactor: 1 });
for (const [file, folder] of viewers) {
  await mkdir(folder, { recursive: true });
  await page.goto(base + file + '?thumb');
  await page.waitForTimeout(2500);
  const ids = await page.evaluate(() => window.__ARM.DEFS.map((d) => d.id));
  for (const id of ids) {
    await page.evaluate((code) => {
      const defs = window.__ARM.DEFS;
      window.__ARM.select(defs.findIndex((d) => d.id === code));
    }, id);
    await page.waitForTimeout(700);
    await page.screenshot({ path: `${folder}/${id}.png`, omitBackground: true });
    console.log(file, id);
  }
}
await browser.close();
