import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { arcIdForSubtype,calibration,mapConfigSchema,mapManifest,markerMatches,parseSnapshot,projectPoint,type MapMarker } from '../src/domain/maps';
import { blueprintRoutes } from '../src/domain/blueprints';
import { catalog } from '../src/domain/catalog';

describe('calibración y caché',()=>{
 it('reproduce los dos anclajes de cada mapa y el zoom',()=>{
  for(const map of mapManifest.maps){
   const start=projectPoint(map,{lat:map.worldExtent[0],lng:map.worldExtent[1]});
   const end=projectPoint(map,{lat:map.worldExtent[2],lng:map.worldExtent[3]});
   expect(start.x).toBeCloseTo(map.tileExtent[1],8);expect(start.y).toBeCloseTo(map.tileExtent[0],8);
   expect(end.x).toBeCloseTo(map.tileExtent[3],8);expect(end.y).toBeCloseTo(map.tileExtent[2],8);
   expect(projectPoint(map,{lat:map.worldExtent[0],lng:map.worldExtent[1]},3).x).toBeCloseTo(start.x*8,8);
  }
 });
 it('rechaza calibración degenerada y pisos inexistentes',()=>{
  const map=structuredClone(mapManifest.maps[0]!);map.worldExtent[2]=map.worldExtent[0];
  expect(()=>calibration(map)).toThrow('degenerada');expect(()=>mapConfigSchema.parse(map)).toThrow();
  map.worldExtent[2]+=100;map.defaultFloorId='missing';expect(()=>mapConfigSchema.parse(map)).toThrow();
 });
 it('valida los seis snapshots y los 48 reportes de cajas de Dam',()=>{
  for(const map of mapManifest.maps){const file=readFileSync(`public/data/maps/${map.slug}.json`,'utf8');const input=JSON.parse(file);const data=parseSnapshot(input,map);
   expect(createHash('sha256').update(file).digest('hex')).toBe(map.snapshotHash);
   expect(data.markers.every(marker=>marker.confidence==='posible')).toBe(true);
   expect(data.markers.filter(marker=>marker.kind==='weapon-case')).toHaveLength(map.caseCount);
   expect(new Set(data.markers.map(marker=>marker.id)).size).toBe(data.markers.length);
  }
  expect(mapManifest.maps.find(map=>map.slug==='dam')?.caseCount).toBe(48);
 });
 it('relaciona los nombres internos del proveedor con las fichas sin crear enemigos nuevos',()=>{
  expect(arcIdForSubtype('bison')).toBe('arc-leaper');expect(arcIdForSubtype('rollbot')).toBe('arc-surveyor');expect(arcIdForSubtype('turbine')).toBe('arc-arc-turbine');
 });
 it('no acepta un snapshot de otro mapa o datos faltantes',()=>{
  const map=mapManifest.maps[0]!,data=JSON.parse(readFileSync(`public/data/maps/${map.slug}.json`,'utf8'));
  expect(()=>parseSnapshot({...data,slug:'wrong'},map)).toThrow('otro mapa');
  expect(()=>parseSnapshot({...data,markers:[]},map)).toThrow('incompleto');
  expect(()=>parseSnapshot({...data,markers:[...data.markers,data.markers[0]]},map)).toThrow('duplicados');
 });
});
describe('filtros de capas y eventos',()=>{
 const marker:MapMarker={id:'test',kind:'weapon-case',subtype:'weapon_case',label:'Caja de archivo',lat:20,lng:50,layerMask:2,eventMask:128,behindLockedDoor:false,sourceUpdatedAt:null,confidence:'posible'};
 const filters={kind:'weapon-case' as const,floorIndex:1,conditionBit:null,query:''};
 it('usa el índice de piso y la máscara del evento como conceptos distintos',()=>{
  expect(markerMatches(marker,filters)).toBe(true);
  expect(markerMatches(marker,{...filters,floorIndex:0})).toBe(false);
  expect(markerMatches(marker,{...filters,conditionBit:7})).toBe(true);
  expect(markerMatches(marker,{...filters,conditionBit:1})).toBe(false);
  expect(markerMatches({...marker,eventMask:null},{...filters,conditionBit:7})).toBe(false);
 });
 it('filtra tipo y texto sin inventar una capa exclusiva',()=>{
  expect(markerMatches(marker,{...filters,kind:'arc'})).toBe(false);
  expect(markerMatches(marker,{...filters,query:'ARCHIVO'})).toBe(true);
  expect(markerMatches({...marker,layerMask:2147483647},{...filters,floorIndex:0})).toBe(true);
 });
});
describe('rutas de planos',()=>{
 it('sustituye pendientes anteriores en los filtros sin modificar la captura inicial',()=>{
  expect(catalog.claims.find(claim=>claim.subjectId==='map-dam-battlegrounds'&&claim.field==='coordenadas de cajas')?.confidence).toBe('posible');
  expect(catalog.claims.find(claim=>claim.subjectId==='blueprint-hullcracker-blueprint'&&claim.field==='ruta detallada')?.confidence).toBe('probable');
  expect(catalog.claims.find(claim=>claim.subjectId==='blueprint-tactical-mk-3-smoke-blueprint'&&claim.field==='ruta detallada')?.confidence).toBe('no confirmado');
 });
 it('conserva los 83 registros y los desconocidos sin completar campos',()=>{
  expect(blueprintRoutes).toHaveLength(83);
  expect(new Set(blueprintRoutes.map(route=>route.blueprintId)).size).toBe(83);
  const smoke=blueprintRoutes.find(route=>route.name==='Tactical Mk. 3 (Smoke)')!;
  expect(smoke.confidence).toBe('no confirmado');expect(smoke.maps).toEqual([]);expect(smoke.containers).toBeNull();
 });
 it('distingue recompensa de plano de recompensa del arma o granada',()=>{
  const hullcracker=blueprintRoutes.find(route=>route.name==='Hullcracker')!;
  expect(hullcracker.validation).toBe('cross-checked');expect(hullcracker.quest).toBe("The Major's Footlocker");
  expect(hullcracker.maps).toContain('dam');expect(hullcracker.mapEvidenceUrls.every(url=>url.startsWith('https://metaforge.app/arc-raiders/map/'))).toBe(true);
  const blaze=blueprintRoutes.find(route=>route.name==='Blaze Grenade')!;
  expect(blaze.quest).toBeNull();expect(blaze.validation).toBe('index-only');
 });
});
