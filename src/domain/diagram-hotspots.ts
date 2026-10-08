import { z } from 'zod';
import { readAtlasData } from './data-loader';
import { catalog } from './catalog';
import { zonesForARC } from './arc-zones';
import { fieldNames } from './presentation';

const percent = z.number().finite().min(0).max(100);
export const diagramPointSchema = z
  .object({
    id: z.string().min(1),
    x: percent,
    y: percent,
    lx: percent,
    ly: percent,
    ref: z.union([
      z.object({ zoneId: z.string().min(1) }).strict(),
      z.object({ field: z.string().min(1) }).strict(),
    ]),
  })
  .strict();
export const diagramSchema = z
  .object({
    entityId: z.string().min(1),
    imageUrl: z.string().min(1),
    puntos: z.array(diagramPointSchema),
  })
  .strict();
export const diagramHotspotsSchema = z.array(diagramSchema).superRefine((diagrams, context) => {
  const entities = new Set<string>();
  const visuals = readAtlasData<{ entityId: string; url: string }[]>('entity-visuals.json');
  const portraits = readAtlasData<{ portraits: { entityId: string; imageUrl: string }[] }>(
    'arc-portraits.json',
  ).portraits;
  diagrams.forEach((diagram, index) => {
    const issue = (message: string, path: (string | number)[]) =>
      context.addIssue({ code: 'custom', message, path: [index, ...path] });
    if (entities.has(diagram.entityId)) issue('Entidad duplicada', ['entityId']);
    entities.add(diagram.entityId);
    if (!catalog.entities.some((entity) => entity.id === diagram.entityId))
      issue('Entidad inexistente', ['entityId']);
    if (
      !visuals.some(
        (image) => image.entityId === diagram.entityId && image.url === diagram.imageUrl,
      ) &&
      !portraits.some(
        (image) => image.entityId === diagram.entityId && image.imageUrl === diagram.imageUrl,
      )
    )
      issue('La imagen debe pertenecer a la entidad en el archivo existente', ['imageUrl']);
    const ids = new Set<string>();
    diagram.puntos.forEach((point, pointIndex) => {
      const ref = point.ref;
      if (ids.has(point.id)) issue('Punto duplicado', ['puntos', pointIndex, 'id']);
      ids.add(point.id);
      if ('zoneId' in ref) {
        if (!zonesForARC(diagram.entityId)?.zones.some((zone) => zone.id === ref.zoneId))
          issue('Zona inexistente para esta entidad', ['puntos', pointIndex, 'ref']);
      } else if (
        !catalog.claims.some(
          (claim) => claim.subjectId === diagram.entityId && claim.field === ref.field,
        )
      )
        issue('Campo inexistente para esta entidad', ['puntos', pointIndex, 'ref']);
    });
  });
});
export type Diagram = z.infer<typeof diagramSchema>;
export type DiagramPoint = z.infer<typeof diagramPointSchema>;
export const diagramHotspots = diagramHotspotsSchema.parse(readAtlasData('diagram-hotspots.json'));
export const diagramFor = (entityId: string) =>
  diagramHotspots.find((diagram) => diagram.entityId === entityId);
export const diagramKinds = {
  weak: 'Zona débil reportada',
  protected: 'Protección reportada',
  unarmored: 'Sin blindaje declarado',
  unknown: 'Pendiente de verificar',
  field: 'Dato del archivo',
} as const;
export function resolveDiagramPoint(entityId: string, point: DiagramPoint) {
  const ref = point.ref;
  if ('zoneId' in ref) {
    const enemy = zonesForARC(entityId);
    const zone = enemy?.zones.find((zone) => zone.id === ref.zoneId);
    return {
      label: zone?.label ?? 'Pendiente de verificar',
      kind: zone?.kind ?? 'unknown',
      confidence: zone?.confidence ?? 'no confirmado',
      sourceIds: enemy?.sourceIds ?? [],
      zone,
      claim: undefined,
    };
  }
  const claim = catalog.claims.find(
    (claim) => claim.subjectId === entityId && claim.field === ref.field,
  );
  return {
    label: claim ? (fieldNames[claim.field] ?? claim.field) : 'Pendiente de verificar',
    kind: claim ? ('field' as const) : ('unknown' as const),
    confidence: claim?.confidence ?? 'no confirmado',
    sourceIds: claim?.sourceIds ?? [],
    zone: undefined,
    claim,
  };
}
export type ResolvedDiagramPoint = ReturnType<typeof resolveDiagramPoint>;
