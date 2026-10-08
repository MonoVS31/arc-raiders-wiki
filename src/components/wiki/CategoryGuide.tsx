import { useState } from 'react';
import { categoryGuides, type GuideSection } from '../../domain/category-guides';
import { HomeCategoryIcon } from './HomeCategoryIcon';

export function CategoryGuide({ sectionId }: { sectionId: GuideSection }) {
  const section = categoryGuides.sections.find((section) => section.id === sectionId)!;
  const [query, setQuery] = useState('');
  const normalize = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  const entries = section.entries.filter((entry) =>
    normalize([entry.title, entry.text, ...entry.details].join(' ')).includes(
      normalize(query.trim()),
    ),
  );
  return (
    <div className="category-guide">
      <div className="category-guide-heading">
        <HomeCategoryIcon name={sectionId} />
        <div>
          <span className="section-kicker">{section.subtitle}</span>
          <h2 id="modal-title">{section.title}</h2>
        </div>
      </div>
      <p>
        {section.intro}{' '}
        <a href={section.sourceUrl} target="_blank" rel="noreferrer">
          Fuente ↗
        </a>
      </p>
      <p className="notice">{section.note}</p>
      <label className="modal-search">
        Buscar en {section.title}
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Nombre o tema…"
        />
      </label>
      <p role="status" className="muted">
        {entries.length} entradas · Consulta de fuentes:{' '}
        {categoryGuides.checkedAt.split('-').reverse().join('/')}
      </p>
      <div className="category-guide-grid">
        {entries.map((entry) => (
          <article className="category-guide-card" key={entry.id}>
            <div className="category-guide-tags">
              <span className={`confidence ${entry.confidence.replaceAll(' ', '-')}`}>
                {entry.confidence}
              </span>
              <span className={`availability ${entry.availability}`}>{entry.availability}</span>
            </div>
            <h3>{entry.title}</h3>
            <p>{entry.text}</p>
            {entry.details.length > 0 && (
              <ul>
                {entry.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            )}
            <a href={entry.sourceUrl} target="_blank" rel="noreferrer">
              Consultar fuente: {entry.title} ↗
            </a>
          </article>
        ))}
      </div>
      {entries.length === 0 && (
        <p>No encontramos entradas con esa búsqueda. Probá con otra palabra.</p>
      )}
      <p className="category-guide-attribution">
        Resúmenes en español basados en{' '}
        <a href={section.sourceUrl} target="_blank" rel="noreferrer">
          ARC Raiders Wiki
        </a>
        . Textos traducidos y resumidos por ARC Atlas bajo{' '}
        <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">
          CC BY-SA 4.0
        </a>
        . Los datos comunitarios se muestran como probables. El contenido del juego pertenece a
        Embark Studios.
      </p>
    </div>
  );
}
