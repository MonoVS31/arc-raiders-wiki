import { createHash } from 'node:crypto';
import { expect, it } from 'vitest';
import { readAtlasData } from '../src/domain/data-loader';
import { catalog, sources } from '../src/domain/catalog';
import { validateCatalog } from '../src/domain/schema';
import '../src/domain/blueprints';
import '../src/domain/arc-zones';
import '../src/domain/projects';
import '../src/domain/arc-links';
import '../src/domain/project-rewards';
import '../src/components/QuestGuide';
it('valida el catálogo original y efectivo antes de compilar', () => {
  validateCatalog(readAtlasData('catalog.json'), readAtlasData('sources.json'));
  expect(validateCatalog(catalog, sources).catalog).toEqual(catalog);
});
it('el catálogo efectivo conserva su evidencia, fuentes y notas al mover los archivos', () => {
  // Baseline exported from the previous composition, not from the new loader.
  expect(createHash('sha256').update(JSON.stringify({ catalog, sources })).digest('hex')).toBe(
    '47696f4b54c5f2982be382cc9553885a6a9a768e5f91e3361581c1ba317e83d5',
  );
});
