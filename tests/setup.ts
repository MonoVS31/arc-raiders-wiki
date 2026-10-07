import { beforeEach } from 'vitest';
beforeEach(() => {
  if (typeof window !== 'undefined')
    window.history.replaceState(null, '', 'https://monovs31.github.io/arc-raiders-wiki/');
});
