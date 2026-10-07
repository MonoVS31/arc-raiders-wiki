import { useEffect, useState } from 'react';
import { loadDossiers, type Dossier } from '../domain/dossiers';
import type { Entity } from '../domain/schema';
import { Sources, useWiki } from '../app/WikiContext';
const headings: Record<string, string> = {
  Ingredients: 'Materiales',
  Requirements: 'Requisitos',
  Result: 'Resultado',
  Perks: 'Mejoras',
  Item: 'Objeto',
  Durability: 'Durabilidad',
  'Repair cost': 'Coste de reparación',
  'Repair Cost': 'Coste de reparación',
  'Recycling results': 'Reciclaje',
  'Salvaging results': 'Desmantelado',
  'Weapon Sale Price': 'Precio de venta',
  'Component Sale Price Per Slot': 'Valor por espacio',
};
export default function LocalDossier({ entity }: { entity: Entity }) {
  const [dossier, setDossier] = useState<Dossier | undefined>();
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const actions = useWiki();
  useEffect(() => {
    const abort = new AbortController();
    setError('');
    loadDossiers(entity.category, abort.signal)
      .then((rows) => setDossier(rows.find((row) => row.entityId === entity.id)))
      .catch((error) => {
        if (error.name !== 'AbortError') setError('No se pudo cargar esta sección.');
      });
    return () => abort.abort();
  }, [entity.id, entity.category, retry]);
  if (error)
    return (
      <p role="alert">
        {error} <button onClick={() => setRetry((value) => value + 1)}>Reintentar</button>
      </p>
    );
  if (!dossier?.tables.length) return null;
  const itemText = (text: string) => {
    const parts = text.split(/(\d+[×x]\s*[^→]+?)(?=\d+[×x]|$)/).filter(Boolean);
    return parts.map((part, i) =>
      /^\d+[×x]/.test(part) && actions ? (
        <button
          key={i}
          type="button"
          className="inline-item"
          onClick={() => actions.material(part.replace(/^\d+[×x]\s*/, ''))}
        >
          {part}
        </button>
      ) : (
        <span key={i}>{part}</span>
      ),
    );
  };
  return (
    <section id="fabricacion" className="local-dossier">
      <div className="section-kicker">TALLER / ARCHIVO LOCAL</div>
      <h3>
        {entity.category === 'blueprint'
          ? `Fabricar ${dossier.objectName}`
          : 'Fabricación, mejoras y mantenimiento'}
      </h3>
      {entity.category === 'blueprint' && (
        <p className="muted">
          Estas recetas fabrican el objeto después de aprender el plano. La obtención del plano está
          en la sección anterior.
        </p>
      )}
      {dossier.tables.map((table, index) => (
        <details key={index} open={index === 0}>
          <summary>
            {table.title} <span className="confidence probable">probable</span>
          </summary>
          <div className="combat-table">
            <table>
              <thead>
                <tr>
                  {table.headers.map((heading, i) => (
                    <th key={i}>{headings[heading] ?? heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className={table.headers[j] === '' ? 'table-arrow-cell' : undefined}
                      >
                        {itemText(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      ))}
      <Sources ids={dossier.sourceIds} />
    </section>
  );
}
