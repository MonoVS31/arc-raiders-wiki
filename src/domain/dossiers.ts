import { z } from 'zod';
const tableSchema = z
  .object({
    kind: z.enum(['craft', 'upgrade', 'repair', 'recycle']),
    title: z.string(),
    headers: z.array(z.string()),
    rows: z.array(z.array(z.string())),
    confidence: z.literal('probable'),
  })
  .strict();
export const dossierSchema = z
  .object({
    entityId: z.string(),
    objectName: z.string(),
    sourceIds: z.array(z.string()).min(1),
    tables: z.array(tableSchema),
  })
  .strict();
export type Dossier = z.infer<typeof dossierSchema>;
const cache = new Map<string, Dossier[]>();
export async function loadDossiers(category: string, signal?: AbortSignal) {
  if (!['weapon', 'grenade', 'blueprint', 'container'].includes(category)) return [];
  const saved = cache.get(category);
  if (saved) return saved;
  const response = await fetch(
    `${import.meta.env.BASE_URL}data/dossiers/${category}.json`,
    signal ? { signal } : undefined,
  );
  if (!response.ok) throw Error('No se pudo cargar el archivo de fabricación');
  const rows = z.array(dossierSchema).parse(await response.json());
  cache.set(category, rows);
  return rows;
}
