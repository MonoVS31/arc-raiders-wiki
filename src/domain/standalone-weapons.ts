import { atlasAsset } from './assets';
export const standaloneWeaponCodes: Record<string, string> = {
  'weapon-aphelion': 'afelio',
  'weapon-anvil': 'ancla',
  'weapon-arpeggio': 'arpegio',
  'weapon-bettina': 'bettina',
  'weapon-bobcat': 'bobcat',
  'weapon-burletta': 'burleta',
  'weapon-canto': 'canto',
  'weapon-dolabra': 'dolabra',
  'weapon-equalizer': 'ecualizador',
  'weapon-ferro': 'ferro',
  'weapon-hairpin': 'horquilla',
  'weapon-il-toro': 'iltoro',
  'weapon-jupiter': 'jupiter',
  'weapon-kettle': 'kettle',
  'weapon-osprey': 'osprey',
  'weapon-rascal': 'picaro',
  'weapon-rattler': 'rattler',
  'weapon-renegade': 'renegada',
  'weapon-hullcracker': 'rompehuesos',
  'weapon-stitcher': 'stitcher',
  'weapon-tempest': 'tempest',
  'weapon-torrente': 'torrente',
  'weapon-venator': 'venator',
  'weapon-vulcano': 'vulcano',
};
export const standaloneWeaponLink = (id?: string) =>
  atlasAsset('armas-3d.html') +
  (id && standaloneWeaponCodes[id] ? '#' + standaloneWeaponCodes[id] : '');

export const standaloneWeaponSketch = (id: string) =>
  standaloneWeaponCodes[id]
    ? atlasAsset('weapon-sketches/' + standaloneWeaponCodes[id] + '.png')
    : undefined;

// Granadas con modelo en el visor de arrojadizos (arrojadizos-3d.html).
export const standaloneThrowableCodes: Record<string, string> = {
  'grenade-light-impact-grenade': 'impacto',
  'grenade-heavy-fuze-grenade': 'pesada',
  'grenade-blaze-grenade': 'blaze',
  'grenade-gas-grenade': 'gas',
  'grenade-showstopper': 'showstopper',
  'grenade-snap-blast-grenade': 'snap',
  'grenade-seeker-grenade': 'seeker',
  'grenade-shrapnel-grenade': 'shrapnel',
  'grenade-trigger-nade': 'trigger',
  'grenade-trailblazer': 'trailblazer',
  'grenade-wolfpack': 'wolfpack',
  'grenade-lure-grenade': 'lure',
  'grenade-li-l-smoke-grenade': 'minihumo',
  'grenade-smoke-grenade': 'humo',
  'grenade-tagging-grenade': 'tagging',
};

export type StandaloneViewer = {
  kind: 'weapon' | 'throwable';
  code: string;
  link: string;
  embed: string;
  sketch: string;
};

// Visor 3D de una ficha: página completa, versión para meter dentro de la ficha y miniatura.
export function standaloneViewer(id: string): StandaloneViewer | undefined {
  const weapon = standaloneWeaponCodes[id];
  const throwable = standaloneThrowableCodes[id];
  const code = weapon ?? throwable;
  if (!code) return undefined;
  const page = weapon ? 'armas-3d.html' : 'arrojadizos-3d.html';
  return {
    kind: weapon ? 'weapon' : 'throwable',
    code,
    link: atlasAsset(page) + '#' + code,
    embed: atlasAsset(page) + '?embed#' + code,
    sketch: atlasAsset((weapon ? 'weapon-sketches/' : 'throwable-sketches/') + code + '.png'),
  };
}
