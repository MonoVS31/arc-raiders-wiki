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
