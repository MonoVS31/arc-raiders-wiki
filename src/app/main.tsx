import { startAtlas } from './bootstrap';
import '../styles/tokens.css';
import '../styles/main.css';
import '../styles/combat.css';
import '../styles/zones.css';
import '../styles/maps.css';
import '../styles/wiki.css';
import '../styles/animations.css';

const root = document.getElementById('root');
if (!root) throw new Error('Falta el contenedor de la aplicación');
startAtlas(root);
