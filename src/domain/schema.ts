import { z } from 'zod';

export const confidenceSchema = z.enum(['confirmado', 'probable', 'posible', 'no confirmado']);
export const categorySchema = z.enum([
  'map',
  'weapon',
  'arc',
  'grenade',
  'blueprint',
  'project',
  'container',
]);
export const availabilitySchema = z.enum(['disponible', 'anunciado', 'histórico', 'desconocido']);
const httpsUrl = z
  .url()
  .refine((value) => value.startsWith('https://'), 'Las fuentes deben usar HTTPS');
export const sourceSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    url: httpsUrl,
    kind: z.enum(['official', 'community', 'editorial', 'technical']),
    retrievedAt: z.iso.datetime(),
    revision: z.string().nullable(),
    contentHash: z
      .string()
      .regex(/^[a-f0-9]{64}$/)
      .nullable(),
    locator: z.string().min(1),
  })
  .strict();
export const entitySchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    category: categorySchema,
    availability: availabilitySchema,
  })
  .strict();
export const claimSchema = z
  .object({
    id: z.string().min(1),
    subjectId: z.string().min(1),
    field: z.string().min(1),
    value: z.union([z.string(), z.number().finite(), z.boolean(), z.null()]),
    unit: z.string().nullable(),
    confidence: confidenceSchema,
    sourceIds: z.array(z.string()).min(1),
    note: z.string(),
    availability: availabilitySchema,
    effectiveFrom: z.iso.date().nullable(),
  })
  .strict();
export const locationSchema = z
  .object({
    id: z.string().min(1),
    mapId: z.string(),
    subjectId: z.string(),
    kind: z.enum(['weapon-case', 'blueprint', 'arc']),
    floor: z.string().nullable(),
    position: z.object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) }).nullable(),
    assetId: z.string().nullable(),
    conditions: z.array(z.string()),
    confidence: confidenceSchema,
    sourceIds: z.array(z.string()).min(1),
    note: z.string().min(1),
  })
  .strict();
export const catalogSchema = z
  .object({
    schemaVersion: z.literal(1),
    asOf: z.iso.date(),
    entities: z.array(entitySchema),
    claims: z.array(claimSchema),
    locations: z.array(locationSchema),
  })
  .strict();
export type Confidence = z.infer<typeof confidenceSchema>;
export type Category = z.infer<typeof categorySchema>;
export type Availability = z.infer<typeof availabilitySchema>;
export type Entity = z.infer<typeof entitySchema>;
export type Claim = z.infer<typeof claimSchema>;
export type Source = z.infer<typeof sourceSchema>;
export type Catalog = z.infer<typeof catalogSchema>;

export function validateCatalog(
  input: unknown,
  sourceInput: unknown,
): { catalog: Catalog; sources: Source[] } {
  const catalog = catalogSchema.parse(input);
  const sources = z.array(sourceSchema).parse(sourceInput);
  for (const list of [sources, catalog.entities, catalog.claims, catalog.locations]) {
    if (new Set(list.map((item) => item.id)).size !== list.length)
      throw new Error('IDs duplicados');
  }
  const sourceById = new Map(sources.map((source) => [source.id, source]));
  const entityById = new Map(catalog.entities.map((entity) => [entity.id, entity]));
  for (const item of [...catalog.claims, ...catalog.locations]) {
    if (!entityById.has(item.subjectId)) throw new Error(`Sujeto inexistente: ${item.subjectId}`);
    if (item.sourceIds.some((id) => !sourceById.has(id)))
      throw new Error(`Fuente inexistente en ${item.id}`);
    if (
      item.confidence === 'confirmado' &&
      !item.sourceIds.some((id) => sourceById.get(id)?.kind === 'official')
    ) {
      throw new Error('Confirmado requiere evidencia oficial');
    }
  }
  for (const claim of catalog.claims) {
    if (claim.confidence === 'no confirmado' && !claim.note.trim())
      throw new Error('Falta explicar la incertidumbre');
    if (claim.value === null && claim.confidence !== 'no confirmado')
      throw new Error('Valor desconocido con confianza elevada');
    const entity = entityById.get(claim.subjectId);
    if (entity?.availability === 'anunciado' && claim.availability !== 'anunciado')
      throw new Error('Anuncio tratado como disponible');
  }
  for (const location of catalog.locations) {
    if (entityById.get(location.mapId)?.category !== 'map') throw new Error('Mapa inexistente');
    if (location.position && (!location.assetId || !location.floor))
      throw new Error('Posición sin asset o piso');
    if (!location.position && location.confidence !== 'no confirmado')
      throw new Error('Ubicación sin coordenadas');
  }
  return { catalog, sources };
}
