import { readFileSync } from 'node:fs';
import { vi } from 'vitest';
import { loadAtlasData } from '../src/domain/data-loader';
vi.stubGlobal('fetch', async (input: string) => {
  const path = String(input).split('data/atlas/')[1];
  if (!path) throw new Error('Solicitud de fixture inesperada');
  return new Response(readFileSync(`public/data/atlas/${path}`, 'utf8'), { status: 200 });
});
await loadAtlasData();
vi.unstubAllGlobals();
import { beforeEach } from 'vitest';
beforeEach(() => {
  if (typeof window !== 'undefined')
    window.history.replaceState(null, '', 'https://monovs31.github.io/arc-raiders-wiki/');
});
