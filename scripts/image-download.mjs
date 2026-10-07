import { createHash } from 'node:crypto';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
export const imageDirectory = new URL('../public/images/game/', import.meta.url);
export function imageHash(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}
export function imageExtension(bytes) {
  if (bytes.subarray(0, 8).toString('hex') === '89504e470d0a1a0a') return 'png';
  if (bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WEBP')
    return 'webp';
  if (bytes.subarray(0, 3).toString('hex') === 'ffd8ff') return 'jpg';
  throw new Error('Respuesta sin un formato de imagen permitido');
}
export function allowedImage(url) {
  const parsed = new URL(url);
  return (
    parsed.protocol === 'https:' &&
    ['static.metaforge.app', 'unhbvkszwhczbjxgetgk.supabase.co'].includes(parsed.hostname)
  );
}
export async function downloadImage(url) {
  if (!allowedImage(url)) throw new Error('Proveedor de imagen no permitido');
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (!allowedImage(response.url)) throw new Error('Redirección a otro proveedor');
      const bytes = Buffer.from(await response.arrayBuffer());
      if (bytes.length > 8000000) throw new Error('Imagen demasiado grande');
      imageExtension(bytes);
      return bytes;
    } catch (error) {
      if (attempt === 2) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
}
export async function ensureImage(asset) {
  const target = new URL(asset.path.replace('images/game/', ''), imageDirectory);
  let bytes;
  try {
    bytes = await readFile(target);
  } catch {}
  if (bytes && imageHash(bytes) === asset.sha256) return;
  bytes = await downloadImage(asset.originalUrl);
  if (imageHash(bytes) !== asset.sha256)
    throw new Error(`Cambió la imagen original: ${asset.originalUrl}`);
  await mkdir(imageDirectory, { recursive: true });
  await writeFile(target, bytes);
}
export async function imageWorkers(items, processItem) {
  let next = 0;
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      while (next < items.length) {
        const item = items[next++];
        await processItem(item);
      }
    }),
  );
}
