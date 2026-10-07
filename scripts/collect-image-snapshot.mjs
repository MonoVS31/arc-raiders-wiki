import { readFile, mkdir, writeFile } from 'node:fs/promises';
import {
  downloadImage,
  imageHash,
  imageExtension,
  imageDirectory,
  imageWorkers,
} from './image-download.mjs';
const data = async (path) =>
  JSON.parse(await readFile(new URL(`../public/data/${path}`, import.meta.url), 'utf8'));
const [visuals, portraits, materials] = await Promise.all(
  ['atlas/entity-visuals.json', 'atlas/arc-portraits.json', 'dossiers/materials.json'].map(data),
);
const urls = [
  ...new Set([
    ...visuals.map((row) => row.url),
    ...portraits.portraits.map((row) => row.imageUrl),
    ...materials.map((row) => row.icon).filter(Boolean),
  ]),
].sort();
const assets = [];
await mkdir(imageDirectory, { recursive: true });
let count = 0;
await imageWorkers(urls, async (originalUrl) => {
  const bytes = await downloadImage(originalUrl);
  const sha256 = imageHash(bytes);
  const file = `${sha256}.${imageExtension(bytes)}`;
  await writeFile(new URL(file, imageDirectory), bytes);
  assets.push({
    originalUrl,
    path: `images/game/${file}`,
    sha256,
    bytes: bytes.length,
    license: 'no confirmada',
    attribution: 'Assets © Embark Studios; procedencia MetaForge/Supabase',
  });
  count++;
  if (count % 50 === 0) console.log(`${count}/${urls.length} imágenes guardadas`);
});
assets.sort((a, b) => a.originalUrl.localeCompare(b.originalUrl, 'en'));
await writeFile(
  new URL('../public/data/atlas/image-assets.json', import.meta.url),
  JSON.stringify({ schemaVersion: 1, retrievedAt: new Date().toISOString(), assets }, null, 2) +
    '\n',
);
console.log(
  JSON.stringify({
    urls: assets.length,
    files: new Set(assets.map((row) => row.path)).size,
    bytes: assets.reduce((total, row) => total + row.bytes, 0),
  }),
);
