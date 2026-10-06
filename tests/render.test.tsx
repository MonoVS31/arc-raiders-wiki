import { expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { App } from '../src/app/App';
import { EntityDetail } from '../src/components/EntityDetail';
import { catalog } from '../src/domain/catalog';

it('renderiza la navegación, fuentes y el estado real del mapa', () => {
  const html=renderToStaticMarkup(<App/>);
  expect(html).toContain('aria-label="Categorías del catálogo"');
  expect(html).toContain('Buscar');
  expect(html).toContain('Cargando visor de mapas');
  expect(html).toContain('ARC Raiders Wiki');
});
it('separa rutas de planos de los objetos fabricados',()=>{
 const entity=catalog.entities.find(entity=>entity.id==='blueprint-hullcracker-blueprint')!;
 const html=renderToStaticMarkup(<EntityDetail entity={entity}/>);
 expect(html).toContain('Cómo buscar este plano');
 expect(html).toContain("The Major&#x27;s Footlocker");
 expect(html).toContain('no son puntos de aparición del plano');
});
it('renderiza todas las fichas sin fallos y conserva la advertencia del anuncio', () => {
  for(const entity of catalog.entities)expect(renderToStaticMarkup(<EntityDetail entity={entity}/>)).toContain(entity.name.replaceAll('&','&amp;').replaceAll("'",'&#x27;'));
  const announced=catalog.entities.find(entity=>entity.availability==='anunciado')!;
  expect(renderToStaticMarkup(<EntityDetail entity={announced}/>)).toContain('Todavía no se presenta como disponible');
});
