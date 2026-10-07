let assetBase = import.meta.env.BASE_URL;
export const atlasAsset = (path: string) => `${assetBase}${path}`;
export function setAtlasAssetBase(base: string) {
  assetBase = base;
}
