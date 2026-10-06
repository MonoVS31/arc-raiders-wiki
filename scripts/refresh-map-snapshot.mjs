import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scratch = path.resolve(root, '../../work/research');
const out = path.join(root, 'public/data/maps');
const configUrl = 'https://metaforge.app/_app/immutable/chunks/CopD1w6L.js';
const transformUrl = 'https://metaforge.app/_app/immutable/chunks/DxIwavkz2.js';
const hash = text => crypto.createHash('sha256').update(text).digest('hex');
const names = {
  dam: ['map-dam-battlegrounds', 'Dam Battlegrounds'],
  spaceport: ['map-spaceport', 'Spaceport'],
  'buried-city': ['map-buried-city', 'Buried City'],
  'blue-gate': ['map-the-blue-gate', 'The Blue Gate'],
  'stella-montis': ['map-stella-montis', 'Stella Montis'],
  'riven-tides': ['map-riven-tides', 'Riven Tides'],
};
// Parse only numeric multiplication/division. Never execute downloaded JavaScript.
function number(expression) {
  const tokens = expression.trim().split(/([*/])/);
  const numeric = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;
  if (!tokens.every((token,index)=>index%2 ? token==='*'||token==='/' : numeric.test(token.trim()))) throw Error('Unexpected numeric expression');
  let value=Number(tokens[0]);
  for(let i=1;i<tokens.length;i+=2) value=tokens[i]==='*'?value*Number(tokens[i+1]):value/Number(tokens[i+1]);
  if(!Number.isFinite(value))throw Error('Non-finite calibration');
  return value;
}
function array(block,key) {
  const match=block.match(new RegExp(key+':\\[([^\\]]+)\\]'));
  if(!match)throw Error(`Missing ${key}`);
  return match[1].split(',').map(number);
}
function scalar(block,key) {
  const match=block.match(new RegExp(key+':([0-9.]+)'));
  if(!match)throw Error(`Missing ${key}`);
  return number(match[1]);
}
async function request(url) {
  const response=await fetch(url,{signal:AbortSignal.timeout(30000)});
  if(!response.ok)throw Error(`${response.status}: ${url}`);
  return response.text();
}
await fs.mkdir(out,{recursive:true});
await fs.mkdir(scratch,{recursive:true});
const config = await request(configUrl);
const transform = await request(transformUrl);
await fs.writeFile(path.join(scratch,'metaforge-config.js'),config);
await fs.writeFile(path.join(scratch,'metaforge-transform.js'),transform);
const section=config.slice(config.indexOf('J=[{id:"dam"'));
if(!section.startsWith('J=[{id:"dam"'))throw Error('Provider configuration changed; review it before importing');
const labels=new Map([...config.matchAll(/key:"([^"]+)",displayName:"([^"]+)"/g)].map(match=>[match[1],match[2]]));
const maps=[];
for(const [slug,[mapId,name]] of Object.entries(names)) {
  const start=section.indexOf(`id:"${slug}"`), next=section.indexOf('},{id:',start);
  if(start<0)throw Error(`Missing ${slug}`);
  const block=section.slice(start,next<0?undefined:next);
  const floors=[...block.matchAll(/\{name:"(-?\d+)",server:t\+"([^"]+)"/g)].map((match,index)=>({
    id:match[1],index,label:match[1]==='0'?(slug==='stella-montis'?'Piso superior':'Superficie'):(slug==='stella-montis'?'Piso inferior':'Subsuelo'),
    tiles:'https://static.metaforge.app'+match[2],
  }));
  if(!floors.length)throw Error(`Missing tile layers: ${slug}`);
  const conditions=[...block.matchAll(/name:"([^"]+)",mask:(\d+),active:/g)].map(match=>({name:match[1],bit:Number(match[2])}));
  const url=`https://metaforge.app/api/game-map-data?tableID=arc_map_data&mapID=${slug}`;
  const text=await request(url), data=JSON.parse(text);
  if(!Array.isArray(data.allData)||data.allData.some(point=>point.mapID!==slug))throw Error(`Unexpected map payload: ${slug}`);
  await fs.writeFile(path.join(scratch,`metaforge-${slug}.json`),text);
  const markers=data.allData.filter(point=>point.community!==false && (
    point.category==='arc' || point.subcategory==='weapon_case' || ['raider_cache','hurricane_cache'].includes(point.subcategory) ||
    point.category==='quests'&&['the-majors-footlocker','greasing-her-palms','industrial-espionage','sparks-fly'].includes(point.subcategory)
  )).map(point=>({
    id:point.id,kind:point.category==='arc'?'arc':point.category==='quests'?'quest-objective':point.subcategory==='weapon_case'?'weapon-case':'cache',
    subtype:point.subcategory.trim(),label:point.instanceName?.trim()||labels.get(point.subcategory.trim())||point.subcategory.replaceAll('_',' '),
    lat:point.lat,lng:point.lng,layerMask:point.zlayers??2147483647,eventMask:point.eventConditionMask??null,
    behindLockedDoor:point.behindLockedDoor===true,sourceUpdatedAt:point.updated_at??null,confidence:'posible',
  }));
  if(markers.some(point=>!Number.isFinite(point.lat)||!Number.isFinite(point.lng))||new Set(markers.map(point=>point.id)).size!==markers.length)throw Error('Invalid or duplicate coordinates');
  const retrievedAt=new Date().toISOString();
  const snapshot={slug,retrievedAt,sourceUrl:url,contentHash:hash(text),markers};
  await fs.writeFile(path.join(out,`${slug}.json`),JSON.stringify(snapshot)+'\n');
  maps.push({id:mapId,slug,name,center:array(block,'center'),worldExtent:array(block,'worldExtent'),tileExtent:array(block,'tileExtent'),
    minZoom:scalar(block,'minZoom'),maxZoom:scalar(block,'maxZoom'),initialZoom:scalar(block,'initialZoom'),tileSize:scalar(block,'tileSize'),
    defaultFloorId:floors[scalar(block,'baseTileLayerIndex')].id,floors,conditions,sourceUrl:`https://metaforge.app/arc-raiders/map/${slug}`,
    snapshotHash:hash(JSON.stringify(snapshot)+'\n'),markerCount:markers.length,caseCount:markers.filter(point=>point.kind==='weapon-case').length});
  console.log(slug,markers.length,'reports;',maps.at(-1).caseCount,'weapon cases');
}
const manifest={schemaVersion:1,asOf:'2026-10-06',retrievedAt:new Date().toISOString(),provider:'MetaForge',termsUrl:'https://metaforge.app/arc-raiders/api',
  attributionUrl:'https://metaforge.app/arc-raiders',configUrl,configHash:hash(config),transformUrl,transformHash:hash(transform),maps};
await fs.mkdir(path.join(root,'src/data/maps'),{recursive:true});
await fs.writeFile(path.join(root,'src/data/maps/manifest.json'),JSON.stringify(manifest,null,2)+'\n');
const sourceFile=path.join(root,'src/data/sources.json');
const existingSources=JSON.parse(await fs.readFile(sourceFile,'utf8'));
const newSources=[];
for(const map of maps){const snapshot=JSON.parse(await fs.readFile(path.join(out,`${map.slug}.json`),'utf8'));newSources.push({id:`metaforge-${map.slug}`,title:`MetaForge — ${map.name}`,url:snapshot.sourceUrl,kind:'community',retrievedAt:snapshot.retrievedAt,revision:null,contentHash:snapshot.contentHash,locator:'allData; community distinto de false; subconjunto de cajas, ARC, caches y objetivos de misión'});}
for(const [id,title,url,contentHash] of [['metaforge-calibration','MetaForge — configuración de mapas',configUrl,hash(config)],['metaforge-transformation','MetaForge — transformación de coordenadas',transformUrl,hash(transform)]])newSources.push({id,title,url,kind:'technical',retrievedAt:manifest.retrievedAt,revision:null,contentHash,locator:'Anclajes worldExtent/tileExtent y transformación afín'});
const sourceIds=new Set(newSources.map(source=>source.id));
await fs.writeFile(sourceFile,JSON.stringify([...existingSources.filter(source=>!sourceIds.has(source.id)),...newSources],null,2)+'\n');
