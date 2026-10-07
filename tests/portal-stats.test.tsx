import { expect,it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { App } from '../src/app/WikiApp';
import { catalog } from '../src/domain/catalog';
import { categorySchema,type Category } from '../src/domain/schema';

const statCategories:Category[]=['map','weapon','blueprint','arc'];
function verifyCounters(){
 const html=renderToStaticMarkup(<App/>);
 const stats=html.match(/<div class="portal-stats">(.*?)<section/s)?.[1]??'';
 const counts=Array.from(stats.matchAll(/<strong>(\d+)<\/strong>/g),match=>match[1]);
 expect(counts).toEqual(statCategories.map(category=>String(catalog.entities.filter(entity=>entity.category===category&&entity.availability==='disponible').length).padStart(2,'0')));
 const material=html.match(/class="portal-tile tile-material".*?<span class="tile-number">(\d+)<\/span>/s)?.[1];
 expect(material).toBe(String(categorySchema.options.length+1).padStart(2,'0'));
}
it('los contadores de portada coinciden con las entidades disponibles y las categorías',verifyCounters);
it('los contadores se actualizan al crecer el catálogo y excluyen las otras disponibilidades',()=>{
 const originalLength=catalog.entities.length;
 try{
  for(const category of statCategories){
   const entity=catalog.entities.find(entity=>entity.category===category)!;
   for(const availability of ['disponible','anunciado','histórico','desconocido'] as const){
    catalog.entities.push({...entity,id:`test-${category}-${availability}`,availability});
   }
  }
  verifyCounters();
 }finally{catalog.entities.splice(originalLength);}
});
