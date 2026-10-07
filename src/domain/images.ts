import { atlasAsset } from './assets';
import { readAtlasData } from './data-loader';
const manifest = readAtlasData<{ assets: { originalUrl: string; path: string }[] }>(
  'image-assets.json',
);
const localByUrl = new Map(manifest.assets.map((asset) => [asset.originalUrl, asset.path]));
export const localImage = (url: string): string => {
  const path = localByUrl.get(url);
  return path ? atlasAsset(path) : url;
};
