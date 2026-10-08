import { z } from 'zod';
import { atlasRoot } from './navigation';
import { atlasAsset } from './assets';

export const mapGroups = {
  locations: { name: 'Ubicaciones', color: '#7d9a9d' },
  services: { name: 'Servicios', color: '#70b897' },
  loot: { name: 'Botín', color: '#83b5bc' },
  nature: { name: 'Recursos naturales', color: '#c59b79' },
  missions: { name: 'Misiones', color: '#cfb678' },
  enemies: { name: 'Enemigos', color: '#d48273' },
  other: { name: 'Otros', color: '#b1ada5' },
  events: { name: 'Eventos', color: '#80b6d2' },
  zones: { name: 'Zonas de botín', color: '#e69a6c' },
} as const;
const groups = {
  locations:
    'cargo-elevator:Ascensor de carga|field-depot:Depósito de campo|location:Lugar con nombre|locked-door:Puerta cerrada|raider-camp:Campamento raider|raider-hatch:Escotilla raider|metro-station:Estación de metro|security-breach:Brecha de seguridad|airshaft:Conducto de aire',
  services: 'npc:NPC',
  loot: 'ammo-box:Caja de munición|arc-courier:ARC Courier|arc-husk:ARC Husk|arc-probe:ARC Probe|backpack:Mochila|baron-husk:Baron Husk|container:Contenedor|field-crate:Caja de campo|grenade-tube:Tubo de granadas|item:Objeto|medical-box:Caja médica|security-locker:Taquilla de seguridad|weapon-crate:Caja de armas|tactical-box:Caja táctica|toolbox:Caja de herramientas|crash-mat:Colchoneta|key:Llave',
  nature:
    'agave:Agave|apricot:Damasco|candleberries:Candleberries|fruit-basket:Canasta de frutas|great-mullein:Gordolobo|moss:Musgo|mushroom:Hongo|prickly-pear:Tuna|lemons:Limones|olives:Aceitunas',
  missions:
    'mission:Misión|quest-objective:Objetivo de misión|hidden-bunker:Búnker oculto|bunker-antenna:Antena del búnker oculto',
  enemies:
    'arc:ARC|enemy:Enemigo|bastion:Bastion|bombardier:Bombardier|comet:Comet|leaper:Leaper|queen:Queen|rocketeer:Rocketeer|sentinel:Sentinel|surveyor:Surveyor|pop:Pop|snitch:Snitch|tick:Tick|fireball:Fireball|hornet:Hornet|turret:Turret|wasp:Wasp|arc-turbine:ARC Turbine|firefly:Firefly|shredder:Shredder|matriarch:Matriarch',
  other:
    'misc:Misceláneo|player-spawn:Punto de aparición|supply-call:Estación de suministro|zipline:Tirolesa|button:Botón|entrance:Entrada',
  events:
    'assessor:Assessor|first-wave-cache:Caché de primera oleada|raider-cache:Caché raider|harvester:Harvester|beachcombing:Beachcombing|close-security:Close Security|vaporizer:Vaporizer|hurricane-cache:Caché de huracán',
  zones: 'high:Alta|medium:Media|low:Baja',
} as const;
export const mapCategories = Object.entries(groups).flatMap(([group, entries]) =>
  entries.split('|').map((entry) => {
    const [id, name] = entry.split(':');
    return { id: id!, name: name!, group: group as keyof typeof mapGroups };
  }),
);
const categoryIndex = new Map(mapCategories.map((item) => [item.id, item]));
export const categoryFor = (id: string) => categoryIndex.get(id)!;
const finite = z.number().finite();
export const pointSchema = z.object({
  id: z.string().min(1),
  categoria: z.string().refine((value) => mapCategories.some((item) => item.id === value)),
  x: finite,
  y: finite,
  capa: z.string(),
  capas: z.array(z.string()).min(1),
  titulo: z.string().trim().min(1).max(250),
  descripcion: z.string().max(10000),
  imagen: z.string().optional(),
  fuente: z.string(),
  evidencia: z.enum(['posible', 'no confirmado']),
  original: z.unknown().optional(),
  entityId: z.string().optional(),
});
export const shapeSchema = z.object({
  id: z.string(),
  categoria: z.enum(['high', 'medium', 'low', 'zipline']),
  capa: z.string(),
  titulo: z.string(),
  puntos: z.array(z.tuple([finite, finite])).min(2),
  fuente: z.string(),
  evidencia: z.literal('no confirmado'),
});
export const interactiveMapSchema = z
  .object({
    version: z.literal(1),
    slug: z.string(),
    coordenadas: z.literal('x=lng, y=lat; calibración original del mapa'),
    marcadores: z.array(pointSchema),
    zonas: z.array(shapeSchema),
    lineas: z.array(shapeSchema),
  })
  .superRefine((data, ctx) => {
    const ids = [...data.marcadores, ...data.zonas, ...data.lineas].map((point) => point.id);
    if (new Set(ids).size !== ids.length)
      ctx.addIssue({ code: 'custom', message: 'Identificadores repetidos' });
    for (const shape of data.zonas)
      if (shape.puntos.length < 3)
        ctx.addIssue({ code: 'custom', message: 'Una zona necesita tres vértices' });
  });
export type AtlasPoint = z.infer<typeof pointSchema>;
export type AtlasShape = z.infer<typeof shapeSchema>;
export type InteractiveMapData = z.infer<typeof interactiveMapSchema>;
const memory = new Map<string, InteractiveMapData>();
export async function loadInteractiveMap(slug: string, signal?: AbortSignal) {
  if (memory.has(slug)) return memory.get(slug)!;
  const response = await fetch(
    atlasAsset(`data/mapas/${slug}.json`),
    signal ? { signal } : undefined,
  );
  if (!response.ok) throw new Error('No se pudieron cargar los reportes');
  const data = interactiveMapSchema.parse(await response.json());
  if (data.slug !== slug) throw new Error('Archivo de otro mapa');
  memory.set(slug, data);
  return data;
}
export const progressSchema = z.object({
  found: z.array(z.string()),
  hidden: z.array(z.string()),
  hideFound: z.boolean(),
  notes: z.array(
    z.object({ id: z.string(), x: finite, y: finite, capa: z.string(), text: z.string() }),
  ),
  draft: interactiveMapSchema.optional(),
});
export type MapProgress = z.infer<typeof progressSchema>;
export const emptyProgress = (): MapProgress => ({
  found: [],
  hidden: [],
  hideFound: false,
  notes: [],
});
export function readProgress(slug: string, storage: Pick<Storage, 'getItem'>): MapProgress {
  try {
    return progressSchema.parse(JSON.parse(storage.getItem(`arc-atlas-mapa-v1:${slug}`) ?? 'null'));
  } catch {
    return emptyProgress();
  }
}
export function saveProgress(slug: string, value: MapProgress, storage: Pick<Storage, 'setItem'>) {
  try {
    storage.setItem(`arc-atlas-mapa-v1:${slug}`, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
export function mapLink(base: string, slug: string, marker?: string, editor = false) {
  const url = atlasRoot(base);
  url.searchParams.set('mapa', slug);
  if (marker) url.searchParams.set('marcador', marker);
  if (editor) url.searchParams.set('editor', '1');
  return url.toString();
}
