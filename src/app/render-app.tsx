import { createRoot } from 'react-dom/client';
import { App } from './App';
export function renderAtlas(root: HTMLElement) {
  createRoot(root).render(<App />);
}
