import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    maxWorkers: 4,
    testTimeout: 15000,
    setupFiles: ['./tests/setup.ts'],
    environmentOptions: { jsdom: { url: 'https://monovs31.github.io/arc-raiders-wiki/' } },
  },
});
