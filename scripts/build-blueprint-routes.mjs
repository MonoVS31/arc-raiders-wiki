import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const scratch=path.resolve(root,'../../work/research');
const index=JSON.parse(await fs.readFile(path.join(scratch,'Blueprints.json'),'utf8'));
const manifest=JSON.parse(await fs.readFile(path.join(root,'public/data/atlas/maps/manifest.json'),'utf8'));
const catalog=JSON.parse(await fs.readFile(path.join(root,'public/data/atlas/catalog.json'),'utf8'));
const sources=JSON.parse(await fs.readFile(path.join(root,'public/data/atlas/sources.json'),'utf8'));
const conditions=[...new Set(manifest.maps.flatMap(map=>map.conditions.map(condition=>condition.name)))];
const knownMaps=['Dam Battlegrounds','Spaceport','Buried City','The Blue Gate','Stella Montis','Riven Tides'];
const slug=text=>text.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const routes=[];
for(const row of index.rows[0].rows.slice(1)){
 const [name,mapText,conditionText,scavengeText,containerText,questText,trialText]=row.cells;
 const blueprint=catalog.entities.find(entity=>entity.category==='blueprint'&&entity.name===name+' Blueprint');
 if(!blueprint)throw Error(`Missing blueprint ${name}`);
 const link=index.links.find(link=>link.name===name);
 const title=decodeURIComponent(link.href.split('/wiki/')[1]);
 const item=JSON.parse(await fs.readFile(path.join(scratch,title+'.json'),'utf8'));
 const itemSource=sources.find(source=>source.id==='wiki-'+slug(title));
 if(!itemSource)throw Error(`Missing item source ${title}`);
 const section=item.text.split('Sources')[1]?.split('Required')[0]?.split('Crafting Ingredients')[0]??'';
 const quest=questText.startsWith('Yes, ')?questText.slice(5).trim():null;
 const rewardMatch=quest&&section.toLowerCase().includes(('Blueprint rewarded from quest: '+quest).toLowerCase());
 const explicitMaps=knownMaps.filter(map=>mapText.includes(map));
 const reportedConditions=conditions.filter(condition=>condition!=='No Event'&&conditionText.includes(condition));
 const mapSlugs=mapText==='All'?manifest.maps.map(map=>map.slug):mapText==='Condition Only'?manifest.maps.filter(map=>map.conditions.some(condition=>reportedConditions.includes(condition.name))).map(map=>map.slug):manifest.maps.filter(map=>explicitMaps.includes(map.name)).map(map=>map.slug);
 const mapEvidenceUrls=[];
 if(mapText==='N/A'&&quest&&rewardMatch){
   const questKey=slug(quest.replaceAll("'",''));
   for(const map of manifest.maps){
     const snapshot=JSON.parse(await fs.readFile(path.join(root,`public/data/maps/${map.slug}.json`),'utf8'));
     if(snapshot.markers.some(marker=>marker.kind==='quest-objective'&&marker.subtype===questKey)){mapSlugs.push(map.slug);mapEvidenceUrls.push(map.sourceUrl);}
   }
 }
 // Item acquisition is not evidence of blueprint acquisition.
 const blueprintSourceText=section.replace(/Requires a learned Blueprint/g,'');
 const foundText=blueprintSourceText.match(/Blueprint(?:s)? (?:can be |is |are )?(?:found|obtained) (?:in|inside|during) ([^.]+?)(?= Quests:| Projects:| Crafting|$)/i)?.[0]??'';
 const mapMatch=explicitMaps.length>0&&explicitMaps.every(map=>foundText.includes(map));
 const unknown=[mapText,conditionText,containerText].includes('?');
 const scavengable=scavengeText==='Yes'?true:scavengeText==='No'?false:null;
 const confidence=unknown?'no confirmado':rewardMatch||mapMatch?'probable':'posible';
 const validation=unknown?'incomplete':rewardMatch||mapMatch?'cross-checked':'index-only';
 routes.push({id:'route-'+blueprint.id,blueprintId:blueprint.id,name,
   maps:mapSlugs,mapScope:mapText==='All'?'all':mapText==='Condition Only'?'condition-only':explicitMaps.length?'specific':quest?'quest':'unknown',
   conditions:conditionText==='Any'?[]:conditionText==='N/A'?[]:reportedConditions,
   conditionUnknown:conditionText==='?',containers:containerText==='N/A'?null:containerText==='?'?null:containerText,
   scavengable,quest,trialReward:trialText==='Yes'?'yes':trialText==='No'?'no':'unknown',
   confidence,validation,sourceIds:['wiki-blueprints',itemSource.id],mapEvidenceUrls,
   note:unknown?'El índice tiene campos desconocidos; no se completan por suposición.':rewardMatch?'La ficha distingue explícitamente la recompensa del plano de la del objeto fabricado.':mapMatch?'El mapa coincide con la sección de obtención del plano en la ficha. La aparición sigue siendo aleatoria.':'Ruta del índice comunitario; el mapa, condición y contenedor no están corroborados individualmente. No garantiza un plano.',
 });
}
await fs.writeFile(path.join(root,'public/data/atlas/blueprint-routes.json'),JSON.stringify({schemaVersion:1,asOf:'2026-10-06',indexRevision:index.revision,routes},null,2)+'\n');
console.log('routes',routes.length,'cross-checked',routes.filter(route=>route.validation==='cross-checked').length,'incomplete',routes.filter(route=>route.validation==='incomplete').length);
