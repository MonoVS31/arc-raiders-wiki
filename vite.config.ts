import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    {
      name: 'standalone-3d-viewers',
      generateBundle() {
        for (const fileName of ['armas-3d.html', 'arrojadizos-3d.html']) {
          this.emitFile({
            type: 'asset',
            fileName,
            source: readFileSync(resolve(process.cwd(), fileName)),
          });
        }
      },
    },
    {
      name: 'entry-size-budget',
      generateBundle(_options, bundle) {
        for (const output of Object.values(bundle)) {
          if (
            output.type === 'chunk' &&
            output.isEntry &&
            Buffer.byteLength(output.code, 'utf8') >= 200_000
          ) {
            this.error('El chunk principal supera el presupuesto de 200 KB.');
          }
        }
      },
    },
  ],
  server: { strictPort: true },
  build: {
    manifest: true,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
            { name: 'zod', test: /node_modules[\\/]zod[\\/]/ },
          ],
        },
      },
    },
  },
});
