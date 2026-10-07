import { setAtlasAssetBase } from '../domain/assets';
import { startAtlas } from './bootstrap';
import '../styles/tokens.css';
import '../styles/main.css';
import '../styles/combat.css';
import '../styles/zones.css';
import '../styles/maps.css';
import '../styles/wiki.css';
import '../styles/animations.css';
import '../styles/prerender.css';

const root = document.getElementById('root');
if (!root) throw new Error('Falta el contenedor de la aplicación');
const assetBase =
  document.querySelector<HTMLMetaElement>('meta[name=arc-atlas-root]')?.content ??
  import.meta.env.BASE_URL;
setAtlasAssetBase(new URL(assetBase, window.location.href).href);
startAtlas(root);
