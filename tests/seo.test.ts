import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
const html = readFileSync('index.html', 'utf8');
it('la portada entrega metadatos sociales absolutos y un favicon compatible con la base relativa', () => {
  for (const property of ['og:title', 'og:description', 'og:image'])
    expect(html).toContain(`property="${property}"`);
  expect(html).toContain('name="twitter:card" content="summary_large_image"');
  expect(html).toContain('rel="canonical" href="https://monovs31.github.io/arc-raiders-wiki/"');
  expect(html).toContain('https://monovs31.github.io/arc-raiders-wiki/social-card.png');
  expect(html).toContain('href="%BASE_URL%favicon.svg"');
  const svg = readFileSync('public/favicon.svg', 'utf8');
  for (const color of ['#69d4cd', '#e9c26d', '#ee875b']) expect(svg).toContain(color);
  const png = readFileSync('public/social-card.png');
  expect(png.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  expect(png.readUInt32BE(16)).toBe(1200);
  expect(png.readUInt32BE(20)).toBe(630);
});
