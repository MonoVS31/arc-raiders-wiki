import { readAtlasData } from './data-loader';
const rawCatalog = readAtlasData<Catalog>('catalog.json');
const rawSources = readAtlasData<Source[]>('sources.json');
import type { Catalog, Claim, Source } from './schema';
import { mapManifest } from './maps';
import { acquisitionData } from './acquisition-schema';
import { researchAudit } from './research-audit';
import { projectBlueprintRewards, projectPeriods } from './project-rewards';
const extraStats = readAtlasData<Claim[]>('extra-stats.json');

import { composeCatalog } from './catalog-composition';
export const catalog = composeCatalog({
  rawCatalog,
  mapManifest,
  acquisitionData,
  researchAudit,
  projectBlueprintRewards,
  projectPeriods,
  extraStats,
});
export const sources = rawSources;
export const sourceById = new Map(sources.map((source) => [source.id, source]));
