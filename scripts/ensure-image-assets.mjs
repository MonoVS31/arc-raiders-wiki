import { readFile } from 'node:fs/promises';
import { ensureImage, imageWorkers } from './image-download.mjs';
const manifest = JSON.parse(
  await readFile(new URL('../public/data/atlas/image-assets.json', import.meta.url), 'utf8'),
);
await imageWorkers(manifest.assets, ensureImage);
console.log(
  `Imágenes locales verificadas: ${manifest.assets.length} URLs, con hashes de contenido.`,
);
