import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const research=path.resolve(process.argv[2]??path.join(root,'../../work/research'));
const read=async file=>JSON.parse(await fs.readFile(file,'utf8'));
const catalog=await read(path.join(root,'public/data/atlas/catalog.json'));
const manifest=await read(path.join(root,'public/data/atlas/maps/manifest.json'));
const enemies=catalog.entities.filter(entity=>entity.category==='arc'&&entity.availability==='disponible');
const aliases={bison:'leaper',rollbot:'surveyor',turbine:'arc-turbine'};
const arcId=subtype=>'arc-'+(aliases[subtype]??subtype.replaceAll('_','-'));
const entries=enemies.map(enemy=>({entityId:enemy.id,maps:[]}));
for(const map of manifest.maps){
 const snapshot=await read(path.join(root,'public/data/maps/'+map.slug+'.json'));
 for(const enemy of entries){const count=snapshot.markers.filter(marker=>marker.kind==='arc'&&arcId(marker.subtype)===enemy.entityId).length;
   if(count)enemy.maps.push({mapId:map.id,mapName:map.name,count,sourceId:'metaforge-'+map.slug,confidence:'posible'});
 }
}
await fs.writeFile(path.join(root,'public/data/atlas/arc-map-reports.json'),JSON.stringify(entries,null,2)+'\n');
const projects=await read(path.join(root,'public/data/atlas/project-stages.json'));
const names=[...new Set(projects.projects.flatMap(project=>project.stages.flatMap(stage=>stage.requirements)).map(item=>item.replace(/^[\d,]+[×x]\s*/,'').trim()))];
const captures=await Promise.all(enemies.map(async enemy=>({enemy,capture:await read(path.join(research,enemy.name.replaceAll(' ','_')+'.json'))})));
const hints=[];
for(const name of names){
 const matches=captures.filter(({capture})=>capture.links.some(link=>link.name===name)&&(capture.text.split(' Loot ')[1]?.split(/ Locations | Codex entry/)[0]??'').includes(name));
 if(matches.length===1){const {enemy}=matches[0];hints.push({material:name,entityId:enemy.id,enemyName:enemy.name,sourceId:'wiki-'+enemy.name.toLowerCase().replace(/[^a-z0-9]+/g,'-'),confidence:'posible'});}
}
await fs.writeFile(path.join(root,'public/data/atlas/material-arc-hints.json'),JSON.stringify(hints,null,2)+'\n');
console.log(JSON.stringify({arcProfiles:entries.length,materialHints:hints.length}));
