import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    setupFiles: ['./tests/setup.ts'],
    environmentOptions: { jsdom: { url: 'https://monovs31.github.io/arc-raiders-wiki/' } },
  },
});
