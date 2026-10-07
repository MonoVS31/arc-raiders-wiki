import { renderToStaticMarkup } from 'react-dom/server';
import type { Catalog, Entity, Source } from '../domain/schema';
import { categories, fieldNames } from '../domain/presentation';
export { composeCatalog } from '../domain/catalog-composition';
export { validateCatalog } from '../domain/schema';
export const publicSite = 'https://monovs31.github.io/arc-raiders-wiki/';
export function escapeAttribute(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll("'", '&#39;');
}
export function ficheDescription(entity: Entity): string {
  return `${entity.name} · ${categories[entity.category]} · ${entity.availability}. Consultá sus datos, notas y fuentes con evidencia por campo en ARC Atlas.`;
}
export function staticArticle(entity: Entity, catalog: Catalog, sources: Source[]): string {
  const claims = catalog.claims.filter((claim) => claim.subjectId === entity.id);
  const sourceById = new Map(sources.map((source) => [source.id, source]));
  return renderToStaticMarkup(
    <main data-prerender className="static-fiche" id="catalog">
      <nav aria-label="Ruta de navegación">
        <ol>
          <li>
            <a href="../../">ARC Atlas</a>
          </li>
          <li aria-current="page">{entity.name}</li>
        </ol>
      </nav>
      <article className="detail">
        <p className="eyebrow">{categories[entity.category]} / expediente</p>
        <h1>{entity.name}</h1>
        <p className="availability">{entity.availability}</p>
        <p>
          Cada campo conserva su propia evidencia. Los datos comunitarios siguen sujetos a revisión.
        </p>
        <p>
          Datos del archivo: {catalog.asOf}. Los controles interactivos se cargan cuando JavaScript
          está disponible.
        </p>
        <dl className="claims">
          {claims.map((claim) => (
            <div className="claim" key={claim.id} data-claim-id={claim.id}>
              <dt>
                {fieldNames[claim.field] ?? claim.field}{' '}
                <span className={`confidence ${claim.confidence.replaceAll(' ', '-')}`}>
                  {claim.confidence}
                </span>
              </dt>
              <dd>
                {claim.value === null
                  ? 'Pendiente de verificar'
                  : `${claim.value}${claim.unit ? ` ${claim.unit}` : ''}`}
              </dd>
              <p className="claim-note">{claim.note}</p>
              <p>
                Disponibilidad del dato: {claim.availability}
                {claim.effectiveFrom ? ` · Vigencia declarada: ${claim.effectiveFrom}` : ''}
              </p>
              <details>
                <summary>Fuentes del dato</summary>
                <ul>
                  {claim.sourceIds.map((id) => {
                    const source = sourceById.get(id)!;
                    return (
                      <li key={id}>
                        <a href={source.url}>{source.title}</a>
                        <p>{source.locator}</p>
                        <p>
                          Consulta: {source.retrievedAt} · Revisión:{' '}
                          {source.revision ?? 'sin revisión declarada'}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </details>
            </div>
          ))}
        </dl>
        <noscript>
          <p>
            Esta vista permite leer los campos y sus fuentes sin JavaScript. Para usar mapas,
            filtros y herramientas de combate, habilitá JavaScript.
          </p>
        </noscript>
      </article>
      <footer>
        Wiki comunitaria independiente. ARC Raiders y sus assets pertenecen a Embark Studios.
      </footer>
    </main>,
  );
}
export function prerenderDocument(
  template: string,
  entity: Entity,
  catalog: Catalog,
  sources: Source[],
  site = publicSite,
): string {
  if (!/^[a-z0-9-]+$/.test(entity.id)) throw new Error('ID de ficha inválido');
  const canonical = `${site}fichas/${entity.id}/`;
  const image = `${site}social/fichas/${entity.id}.png`;
  const title = `${entity.name} · ARC Atlas`;
  const description = ficheDescription(entity);
  const replacements: Record<string, string> = {
    description,
    'og:title': title,
    'twitter:title': title,
    'og:description': description,
    'twitter:description': description,
    'og:url': canonical,
    'og:image': image,
    'twitter:image': image,
    'og:image:alt': title,
    'twitter:image:alt': title,
    'arc-atlas-root': '../../',
  };
  let html = template.replace(
    /<title>[\s\S]*?<\/title>/,
    `<title>${escapeAttribute(title)}</title>`,
  );
  html = html.replace(/<meta\b[^>]*>/g, (tag) => {
    const name = tag.match(/(?:name|property)="([^"]+)"/)?.[1];
    return name && replacements[name] !== undefined
      ? tag.replace(/content="[^"]*"/, `content="${escapeAttribute(replacements[name]!)}"`)
      : tag;
  });
  html = html.replace(
    /(<link\b[^>]*rel="canonical"[^>]*href=")[^"]*(")/,
    `$1${escapeAttribute(canonical)}$2`,
  );
  html = html.replace(/(src|href)="\.\//g, '$1="../../');
  html = html.replace(
    '<div id="root"></div>',
    () => `<div id="root">${staticArticle(entity, catalog, sources)}</div>`,
  );
  if (!html.includes('data-prerender')) throw new Error('Falta el contenido estático');
  return html;
}
export function socialCardSVG(entity: Entity): string {
  const words = entity.name.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    if ((line + ' ' + word).trim().length > 28 && line) {
      lines.push(line);
      line = word;
    } else line = (line + ' ' + word).trim();
  }
  if (line) lines.push(line);
  if (lines.length > 4) throw new Error('Nombre demasiado largo para la tarjeta');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#0c121d"/><path d="M0 105H1200M0 525H1200M270 0V630" stroke="#28374b"/><path d="M110 160h28l-72 275H38z" fill="#69d4cd"/><path d="M149 186h28l-66 249H83z" fill="#e9c26d"/><path d="M189 224h28l-56 211h-28z" fill="#ee875b"/><g font-family="Arial, DejaVu Sans, sans-serif"><text x="320" y="74" fill="#69d4cd" font-size="28" font-weight="bold" letter-spacing="5">ARC ATLAS / ARCHIVO DE CAMPO</text><text x="320" y="159" fill="#e9c26d" font-size="24">${escapeAttribute(categories[entity.category].toUpperCase())}</text>${lines.map((text, i) => `<text x="320" y="${230 + i * 62}" fill="#e2ebf6" font-size="52" font-weight="bold">${escapeAttribute(text)}</text>`).join('')}<text x="320" y="493" fill="#b9cce0" font-size="24">${escapeAttribute(entity.availability.toUpperCase())} · EVIDENCIA POR CAMPO</text><text x="320" y="577" fill="#b9cce0" font-size="22">Wiki comunitaria independiente de ARC Raiders</text></g></svg>`;
}
