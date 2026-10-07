export const atlasFiles = [
  'arc-map-reports.json',
  'arc-portraits.json',
  'arc-zones.json',
  'blueprint-routes.json',
  'catalog.json',
  'entity-visuals.json',
  'extra-stats.json',
  'maps/manifest.json',
  'material-arc-hints.json',
  'project-blueprint-rewards.json',
  'project-periods.json',
  'project-stages.json',
  'quest-guides.json',
  'research-audit.json',
  'sources.json',
] as const;
export type AtlasFile = (typeof atlasFiles)[number];

export function createJsonCache(request: typeof fetch = (...args) => fetch(...args)) {
  const values = new Map<string, unknown>();
  const pending = new Map<string, Promise<unknown>>();
  return {
    async load<T>(path: string): Promise<T> {
      if (values.has(path)) return values.get(path) as T;
      let task = pending.get(path);
      if (!task) {
        task = request(`${import.meta.env.BASE_URL}data/atlas/${path}`)
          .then(async (response) => {
            if (!response.ok) throw new Error('No se pudo cargar el archivo de datos');
            const data: unknown = await response.json();
            values.set(path, data);
            return data;
          })
          .finally(() => pending.delete(path));
        pending.set(path, task);
      }
      return (await task) as T;
    },
    read<T>(path: string): T {
      if (!values.has(path)) throw new Error('El archivo todavía no está cargado');
      return values.get(path) as T;
    },
  };
}
const atlasCache = createJsonCache();
export const readAtlasData = <T>(file: AtlasFile) => atlasCache.read<T>(file);
export const loadAtlasData = () => Promise.all(atlasFiles.map((file) => atlasCache.load(file)));
