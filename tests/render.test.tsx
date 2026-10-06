import { expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { App } from '../src/app/App';
import { EntityDetail } from '../src/components/EntityDetail';
import { catalog } from '../src/domain/catalog';

it('renderiza la navegación, fuentes y el estado real del mapa', () => {
  const html=renderToStaticMarkup(<App/>);
  expect(html).toContain('aria-label="Categorías del catálogo"');
  expect(html).toContain('Buscar');
  expect(html).toContain('Cartografía en verificación');
  expect(html).toContain('0 marcadores publicados');
  expect(html).toContain('ARC Raiders Wiki');
});
it('renderiza todas las fichas sin fallos y conserva la advertencia del anuncio', () => {
  for(const entity of catalog.entities)expect(renderToStaticMarkup(<EntityDetail entity={entity}/>)).toContain(entity.name.replaceAll('&','&amp;').replaceAll("'",'&#x27;'));
  const announced=catalog.entities.find(entity=>entity.availability==='anunciado')!;
  expect(renderToStaticMarkup(<EntityDetail entity={announced}/>)).toContain('Todavía no se presenta como disponible');
});
