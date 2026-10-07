import { expect,it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { z } from 'zod';
import { catalog,sourceById } from '../src/domain/catalog';
import { dossierSchema } from '../src/domain/dossiers';
import { QuestGuide,questGuides } from '../src/components/QuestGuide';
import { EntityDetail } from '../src/components/EntityDetail';
import { WikiLink } from '../src/app/WikiContext';
it('las recetas, reparaciones y mejoras tienen datos locales y procedencia',()=>{
 for(const category of ['weapon','grenade','blueprint','container']){
  const rows=z.array(dossierSchema).parse(JSON.parse(readFileSync(`public/data/dossiers/${category}.json`,'utf8')));
  expect(rows.length).toBe(catalog.entities.filter(entity=>entity.category===category&&entity.availability==='disponible').length);
  for(const row of rows){expect(row.sourceIds.every(id=>sourceById.has(id))).toBe(true);expect(catalog.entities.some(entity=>entity.id===row.entityId)).toBe(true);}
 }
 const weapons=z.array(dossierSchema).parse(JSON.parse(readFileSync('public/data/dossiers/weapon.json','utf8')));
 expect(weapons.find(row=>row.entityId==='weapon-kettle')?.tables.some(table=>table.kind==='repair')).toBe(true);
});
it('las seis misiones se pueden leer sin entrar a la fuente externa',()=>{
 expect(questGuides).toHaveLength(6);
 for(const quest of questGuides){expect(sourceById.has(quest.sourceId)).toBe(true);const html=renderToStaticMarkup(<QuestGuide name={quest.name}/>);expect(html).toContain('Objetivos de');expect(html).not.toContain('href="https://arcraiders.wiki');}
 expect(renderToStaticMarkup(<QuestGuide name="Worth Your Salt"/>)).toContain('una sola ronda');
});
it('las fuentes se conservan en botones de evidencia y no como navegación del artículo',()=>{
 for(const entity of catalog.entities){const html=renderToStaticMarkup(<EntityDetail entity={entity}/>);expect(html).not.toContain('href="https://arcraiders.wiki');expect(html).not.toContain('href="https://metaforge.app');}
 const link=renderToStaticMarkup(<WikiLink entityId="arc-hornet">Hornet</WikiLink>);
 expect(link).toContain('monovs31.github.io/arc-raiders-wiki/');expect(link).not.toContain('target="_blank"');
});
it('los materiales no exponen las estadísticas de relleno del proveedor',()=>{
 const items=JSON.parse(readFileSync('public/data/dossiers/materials.json','utf8')) as Record<string,unknown>[];
 expect(items.some(item=>item['name']==='Metal Parts')).toBe(true);
 expect(items.some(item=>item['name']==='Rubber Parts')).toBe(true);
 for(const item of items){expect(item).not.toHaveProperty('stat_block');expect(sourceById.has(String(item['sourceId']))).toBe(true);}
});
