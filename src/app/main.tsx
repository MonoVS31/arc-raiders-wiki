import { createRoot } from 'react-dom/client';
import { App } from './App';
import '../styles/main.css';

const root = document.getElementById('root');
if (!root) throw new Error('Falta el contenedor de la aplicación');
createRoot(root).render(<App />);
