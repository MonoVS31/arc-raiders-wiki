import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const research=path.resolve(process.argv[2]??path.join(root,'../../work/research'));
const read=async file=>JSON.parse(await fs.readFile(file,'utf8'));
const index=await read(path.join(research,'Blueprints.json'));
const revisionCheck=await read(path.join(research,'phase5-revision-check.json'));
if(revisionCheck.changed.length)throw Error('Revisiones modificadas: revisar capturas antes de generar');
const providerFile=path.join(research,'phase5-blueprints-provider.json');
const provider=await read(providerFile);
if(provider.pagination.hasNextPage)throw Error('Catálogo secundario incompleto');
const routes=await read(path.join(root,'src/data/blueprint-routes.json'));
const normalize=text=>text.toLowerCase().replace(/[^a-z0-9]/g,'');
const rows=[];
for(const route of routes.routes){
 const title=decodeURIComponent(index.links.find(link=>link.name===route.name).href.split('/wiki/')[1]);
 const item=await read(path.join(research,title+'.json'));
 const cells=index.rows[0].rows.find(row=>row.cells[0]===route.name).cells;
 const containerText=item.text.match(/Blueprint locations (.*?)(?= Required| Crafting| Recycling| Upgrading|$)/)?.[1]??'';
 const containerNames=item.links.filter(link=>containerText.includes(link.name)&&/^(Residential|Industrial|Medical|Security|Electrical) /.test(link.name)).map(link=>link.name);
 const secondary=provider.data.find(item=>normalize(item.name)===normalize(route.name+' Blueprint'));
 if(!secondary)throw Error('Falta plano en catálogo secundario: '+route.name);
 const pendingFields=['Mapa','Condición','Botín','Contenedor','Misión','Trials'].filter((_,i)=>cells[i+1]==='?');
 rows.push({blueprintId:route.blueprintId,itemRevision:item.revision,secondaryId:secondary.id,
   routeEvidence:route.validation==='cross-checked'?'explicit-blueprint':containerNames.length?'containers-only':'index-only',
   containerDetails:[...new Set(containerNames)],pendingFields,
   sourceIds:route.sourceIds,
   note:route.validation==='cross-checked'?'La ficha menciona explícitamente la recompensa del plano; no confirma todos los campos de botín.':containerNames.length?'La ficha enumera contenedores del plano; mapas y condiciones conservan evidencia del índice.':'La ficha del objeto no aporta una ruta explícita del plano. El catálogo secundario confirma una entrada con el mismo nombre, pero no publica ubicaciones.',
 });
}
const checkedAt=revisionCheck.checkedAt;
await fs.writeFile(path.join(root,'src/data/research-audit.json'),JSON.stringify({schemaVersion:1,checkedAt,indexRevision:index.revision,checkedPageCount:revisionCheck.pages.length,sourceIds:['wiki-revision-review','metaforge-blueprint-review'],routes:rows},null,2)+'\n');
const sources=await read(path.join(root,'src/data/sources.json'));
for(const item of [
 {id:'wiki-revision-review',title:'ARC Raiders Wiki — revisión de fichas y versiones',url:'https://arcraiders.wiki/w/api.php',file:path.join(research,'phase5-revision-check.json'),locator:'query.pages[].revisions; objetos de planos, 21 ARC, índice y armas; redirección Surveyor -> ARC Surveyor resuelta'},
 {id:'metaforge-blueprint-review',title:'MetaForge — catálogo de 83 planos',url:'https://metaforge.app/api/arc-raiders/items?search=Blueprint&limit=100',file:providerFile,locator:'data[].name/id; las ubicaciones y fuentes de obtención están vacías y no corroboran rutas'},
 ]){
 const source={id:item.id,title:item.title,url:item.url,kind:'community',retrievedAt:checkedAt,revision:null,contentHash:crypto.createHash('sha256').update(await fs.readFile(item.file)).digest('hex'),locator:item.locator};
 const existing=sources.findIndex(s=>s.id===item.id);if(existing===-1)sources.push(source);else sources[existing]=source;
}
await fs.writeFile(path.join(root,'src/data/sources.json'),JSON.stringify(sources,null,2)+'\n');
console.log(JSON.stringify({reviewed:rows.length,explicit:rows.filter(r=>r.routeEvidence==='explicit-blueprint').length,containerDetails:rows.filter(r=>r.containerDetails.length).length,pending:rows.filter(r=>r.pendingFields.length).length}));
