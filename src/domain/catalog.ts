import rawCatalog from '../data/catalog.json';
import rawSources from '../data/sources.json';
import { validateCatalog } from './schema';

export const { catalog, sources } = validateCatalog(rawCatalog, rawSources);
export const sourceById = new Map(sources.map(source => [source.id, source]));
