import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
const css = readFileSync('src/styles/tokens.css', 'utf8');
const tokens = new Map(
  Array.from(css.matchAll(/(--[\w-]+):\s*([^;]+);/g), (match) => [match[1]!, match[2]!]),
);
function luminance(hex: string) {
  const values = [0, 2, 4].map(
    (offset) => Number.parseInt(hex.replace('#', '').slice(offset, offset + 2), 16) / 255,
  );
  return values.reduce(
    (sum, value, index) =>
      sum +
      (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4) *
        [0.2126, 0.7152, 0.0722][index]!,
    0,
  );
}
function ratio(text: string, background: string) {
  const a = luminance(text),
    b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
it('la escala tipográfica no permite texto por debajo de 0.75rem', () => {
  for (const [name, value] of tokens)
    if (name.startsWith('--font-size-'))
      expect(Number.parseFloat(value), name).toBeGreaterThanOrEqual(0.75);
});
it.each([
  ['tile-number', '#e2d9c4'],
  ['tile-arrow', '#e2d9c4'],
  ['wiki-footer-span-last-child', '#e2d9c4'],
  ['wiki-footer-p', '#e2d9c4'],
  ['article-index-p', '#e2d9c4'],
  ['claim-note', '#e2d9c4'],
  ['sidebar-label', '#e2d9c4'],
  ['wiki-sidebar-nav-small', '#e2d9c4'],
  ['sidebar-bottom-small', '#e2d9c4'],
  ['local-dossier-table-arrow-cell', '#e2d9c4'],
  ['arc-portrait-figcaption', '#e2d9c4'],
  ['evidence-button', '#e2d9c4'],
  ['global-results-small', '#e2d9c4'],
])('el token de %s cumple 4.5:1 en su fondo más exigente', (name, background) => {
  expect(ratio(tokens.get(`--color-text-${name}`)!, background)).toBeGreaterThanOrEqual(4.5);
});
