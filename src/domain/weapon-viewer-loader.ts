import { atlasAsset } from './assets';
import type { WeaponViewerModule } from './weapon-studies';
export async function loadWeaponViewer(file: string) {
  const [viewer, model] = await Promise.all([
    import(/* @vite-ignore */ atlasAsset('weapons3d/viewer.js')),
    import(/* @vite-ignore */ atlasAsset('weapons3d/' + file)),
  ]);
  return { viewer: viewer as WeaponViewerModule, model: model.default as unknown };
}
