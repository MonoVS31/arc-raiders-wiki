import { loadAtlasData } from '../domain/data-loader';
export interface BootstrapOptions {
  load?: () => Promise<unknown>;
  render?: (root: HTMLElement) => Promise<void>;
}
export function startAtlas(root: HTMLElement, options: BootstrapOptions = {}) {
  const load = options.load ?? loadAtlasData;
  const render =
    options.render ??
    (async (root) => {
      const module = await import('./render-app');
      module.renderAtlas(root);
    });
  let generation = 0;
  let cancelled = false;
  const show = (error: boolean) => {
    const main = document.createElement('main');
    main.className = 'boot-state';
    main.setAttribute('aria-busy', String(!error));
    const heading = document.createElement('h1');
    heading.textContent = 'ARC Atlas';
    const message = document.createElement('p');
    message.setAttribute('role', error ? 'alert' : 'status');
    message.textContent = error
      ? 'No se pudo cargar el archivo. Revisá tu conexión y volvé a intentar.'
      : 'Cargando el archivo de la wiki…';
    main.append(heading, message);
    if (error) {
      const button = document.createElement('button');
      button.textContent = 'Reintentar';
      button.addEventListener('click', () => void run(), { once: true });
      main.append(button);
    }
    root.replaceChildren(main);
  };
  const run = async () => {
    const attempt = ++generation;
    show(false);
    try {
      await load();
      if (!cancelled && attempt === generation) await render(root);
    } catch {
      if (!cancelled && attempt === generation) show(true);
    }
  };
  void run();
  return () => {
    cancelled = true;
  };
}
