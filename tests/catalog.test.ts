import { describe, expect, it } from 'vitest';
import { catalog, sources } from '../src/domain/catalog';
import { validateCatalog } from '../src/domain/schema';
import { claimsFor, findEntities, type Filters } from '../src/domain/query';

const filters: Filters = { category: 'all', availability: 'all', confidence: 'all', query: '' };
const copy = () => structuredClone(catalog);
describe('integridad de evidencia', () => {
  it('acepta el catálogo inicial y conserva revisión o hash en cada fuente', () => {
    expect(validateCatalog(catalog, sources).catalog.entities.length).toBeGreaterThan(100);
    expect(sources.every((source) => source.revision || source.contentHash)).toBe(true);
  });
  it('rechaza fuentes inexistentes', () => {
    const data = copy();
    data.claims[0]!.sourceIds = ['missing'];
    expect(() => validateCatalog(data, sources)).toThrow('Fuente inexistente');
  });
  it('rechaza sujetos e IDs duplicados', () => {
    const data = copy();
    data.claims[0]!.subjectId = 'missing';
    expect(() => validateCatalog(data, sources)).toThrow('Sujeto inexistente');
    const duplicated = copy();
    duplicated.entities.push(duplicated.entities[0]!);
    expect(() => validateCatalog(duplicated, sources)).toThrow('IDs duplicados');
  });
  it('no permite elevar un dato comunitario a confirmado', () => {
    const data = copy();
    data.claims[0]!.confidence = 'confirmado';
    expect(() => validateCatalog(data, sources)).toThrow('evidencia oficial');
  });
  it('no permite ocultar incertidumbre con valor null o nota vacía', () => {
    const data = copy();
    data.claims[0]!.value = null;
    expect(() => validateCatalog(data, sources)).toThrow('Valor desconocido');
    const unexplained = copy();
    unexplained.claims.find((claim) => claim.confidence === 'no confirmado')!.note = '';
    expect(() => validateCatalog(unexplained, sources)).toThrow('incertidumbre');
  });
  it('rechaza posiciones fuera de rango y sin piso/asset', () => {
    const data = copy();
    data.locations[0]!.position = { x: 2, y: 0.5 };
    expect(() => validateCatalog(data, sources)).toThrow();
    data.locations[0]!.position = { x: 0.5, y: 0.5 };
    expect(() => validateCatalog(data, sources)).toThrow('asset o piso');
  });
  it('impide tratar un anuncio como contenido disponible', () => {
    const data = copy();
    data.claims.find((claim) => claim.availability === 'anunciado')!.availability = 'disponible';
    expect(() => validateCatalog(data, sources)).toThrow('Anuncio tratado');
  });
  it('conserva desconocidos y conflictos del juego', () => {
    expect(catalog.locations.every((location) => location.position === null)).toBe(true);
    expect(
      claimsFor(catalog, 'weapon-aphelion').find((claim) => claim.field === 'Range')?.confidence,
    ).toBe('no confirmado');
    expect(
      catalog.entities.find((entity) => entity.id === 'project-ascending-the-mountain')
        ?.availability,
    ).toBe('desconocido');
    expect(
      claimsFor(catalog, 'grenade-wolfpack').find((claim) => claim.field === 'Radius')?.confidence,
    ).toBe('no confirmado');
  });
  it('rechaza enlaces ejecutables o no seguros', () => {
    const unsafe = structuredClone(sources);
    unsafe[0]!.url = 'javascript:alert(1)';
    expect(() => validateCatalog(catalog, unsafe)).toThrow();
  });
});
describe('consulta', () => {
  it('filtra categorías y disponibilidad sin mezclar anuncios', () => {
    const weapons = findEntities(catalog, {
      ...filters,
      category: 'weapon',
      availability: 'disponible',
    });
    expect(weapons).toHaveLength(24);
    expect(weapons.some((entity) => entity.name === 'Stiletto')).toBe(false);
    expect(
      findEntities(catalog, { ...filters, query: '  APHELION ' }).some(
        (entity) => entity.name === 'Aphelion',
      ),
    ).toBe(true);
    expect(findEntities(catalog, { ...filters, query: 'zzzz-nothing' })).toEqual([]);
  });
  it('filtra confianza por campo, no por una etiqueta agregada de ficha', () => {
    const results = findEntities(catalog, { ...filters, confidence: 'confirmado' });
    expect(
      results.every((entity) =>
        claimsFor(catalog, entity.id).some((claim) => claim.confidence === 'confirmado'),
      ),
    ).toBe(true);
    expect(results.every((entity) => entity.availability === 'anunciado')).toBe(true);
  });
});
