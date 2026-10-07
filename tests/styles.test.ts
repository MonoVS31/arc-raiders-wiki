import { readFileSync, readdirSync } from 'node:fs';
import { expect, it } from 'vitest';
const styles = readdirSync('src/styles')
  .filter((name) => name.endsWith('.css'))
  .map((name) => ({ name, css: readFileSync(`src/styles/${name}`, 'utf8') }));
it('todos los tokens usados por los estilos tienen una definición única', () => {
  const tokens = styles.find((file) => file.name === 'tokens.css')!.css;
  const definitions = Array.from(tokens.matchAll(/(--[\w-]+)\s*:/g), (match) => match[1]!);
  expect(new Set(definitions).size).toBe(definitions.length);
  const defined = new Set(definitions);
  for (const file of styles) {
    for (const match of file.css.matchAll(/var\((--[\w-]+)/g)) {
      if (match[1] !== '--delay')
        expect(defined.has(match[1]!), `${file.name}: ${match[1]}`).toBe(true);
    }
    expect(file.css).not.toContain('var(undefined)');
  }
  for (const match of tokens.matchAll(/--font-size-[\w-]+:\s*([^;]+);/g))
    expect(match[1]).toMatch(/rem$/);
});
it('el tema tiene una sola raíz y conserva la política global de movimiento reducido', () => {
  expect(
    styles.reduce((count, file) => count + (file.css.match(/:root\s*\{/g)?.length ?? 0), 0),
  ).toBe(1);
  expect(styles.find((file) => file.name === 'tokens.css')!.css).toContain(
    '@layer tokens, base, components, utilities;',
  );
  const main = styles.find((file) => file.name === 'main.css')!.css;
  expect(main).toContain('@layer utilities');
  expect(main).toContain('@media (prefers-reduced-motion: reduce)');
  expect(main).toContain('animation: none !important');
  expect(main).toContain('transition: none !important');
  for (const file of styles.filter((file) => file.name !== 'tokens.css')) {
    expect(file.css).not.toMatch(/var\(--(?:lime|line|muted|panel)\)/);
    expect(file.css).not.toMatch(/#[\da-fA-F]{3,8}\b(?![\w-])/);
  }
});
