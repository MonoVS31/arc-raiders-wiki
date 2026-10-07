import type { Category, Entity } from '../../domain/schema';
import { categories } from '../EntityDetail';
import type { CSSProperties } from 'react';
import { categorySchema } from '../../domain/schema';
import { sources } from '../../domain/catalog';
import { WikiLink } from '../../app/WikiContext';
import type { WikiPanel } from '../WikiModal';
import { WikiIcon } from '../WikiIcon';
import { GlobalSearch } from './GlobalSearch';
import { descriptions, artFor, availableCount, formatCount } from './presentation';

export function HomeView({
  category,
  open,
  globalSearch,
  setGlobalSearch,
  globalResults,
  navigate,
}: {
  category: (value: Category) => void;
  open: (value: WikiPanel) => void;
  globalSearch: string;
  setGlobalSearch: (value: string) => void;
  globalResults: Entity[];
  navigate: (id: string) => void;
}) {
  return (
    <>
      <section className="welcome-banner">
        <div className="banner-grid" aria-hidden="true" />
        <div className="banner-orbit" aria-hidden="true" />
        <div className="welcome-copy">
          <span className="section-kicker">INTELIGENCIA PARA LA PRÓXIMA INCURSIÓN</span>
          <h1>
            EL RUST BELT.
            <br />
            <em>EN TUS MANOS.</em>
          </h1>
          <p>
            Explorá mapas, entendé a las máquinas y prepará tu equipo. Toda la información del
            archivo, conectada dentro de una misma wiki.
          </p>
          <GlobalSearch
            globalSearch={globalSearch}
            setGlobalSearch={setGlobalSearch}
            globalResults={globalResults}
            navigate={navigate}
          />
          <div className="welcome-actions">
            <button onClick={() => category('map')}>
              Explorar mapas <span>→</span>
            </button>
            <button onClick={() => category('weapon')}>Abrir arsenal</button>
          </div>
        </div>
        <div className="banner-machine" aria-hidden="true">
          <img width={512} height={512} decoding="async" src={artFor('arc-rocketeer')} alt="" />
          <span>ARC / ARCHIVO DE COMBATE</span>
        </div>
      </section>
      <div className="portal-stats">
        <div>
          <strong>{availableCount('map')}</strong>
          <span>mapas de incursión</span>
        </div>
        <div>
          <strong>{availableCount('weapon')}</strong>
          <span>armas disponibles</span>
        </div>
        <div>
          <strong>{availableCount('blueprint')}</strong>
          <span>planos documentados</span>
        </div>
        <div>
          <strong>{availableCount('arc')}</strong>
          <span>máquinas ARC</span>
        </div>
      </div>
      <section className="portal-categories">
        <div className="wiki-section-title">
          <div>
            <span className="section-kicker">EL ARCHIVO</span>
            <h2>Elegí por dónde empezar.</h2>
          </div>
          <span>Mapas · equipo · supervivencia</span>
        </div>
        <div className="portal-grid">
          {categorySchema.options.map((value, index) => (
            <button
              className={`portal-tile tile-${value}`}
              key={value}
              style={{ '--delay': `${index * 55}ms` } as CSSProperties}
              onClick={() => category(value)}
            >
              <div className="tile-art">
                <WikiIcon category={value} />
              </div>
              <span className="tile-number">{formatCount(index + 1)}</span>
              <h3>{categories[value]}</h3>
              <p>{descriptions[value]}</p>
              <span className="tile-arrow">↗</span>
            </button>
          ))}
          <button className="portal-tile tile-material" onClick={() => open({ kind: 'materials' })}>
            <div className="tile-art">
              <WikiIcon category="container" />
            </div>
            <span className="tile-number">{formatCount(categorySchema.options.length + 1)}</span>
            <h3>Materiales</h3>
            <p>Recursos, valor reportado y botín asociado</p>
            <span className="tile-arrow">↗</span>
          </button>
        </div>
      </section>
      <section className="featured-grid">
        <div className="featured-editorial">
          <span className="section-kicker">MÁQUINAS BAJO LA LUPA</span>
          <h2>
            Conocé lo que
            <br />
            te está buscando.
          </h2>
          <p>
            Elegí una máquina, recorré sus piezas y encontrá los mapas con reportes de su presencia.
          </p>
          <WikiLink entityId="arc-hornet">Explorar Hornet →</WikiLink>
          <img
            width={512}
            height={512}
            decoding="async"
            src={artFor('arc-hornet')}
            alt="Hornet"
            loading="lazy"
          />
        </div>
        <div className="home-guide">
          <span className="section-kicker">TU PRÓXIMO OBJETIVO</span>
          <h3>
            De un plano
            <br />a una ruta.
          </h3>
          <p>
            Recompensas, proyectos y condiciones de obtención reunidos en el artículo. Abrí el mapa
            sin salir de la wiki.
          </p>
          <WikiLink entityId="blueprint-hullcracker-blueprint">Ver Hullcracker →</WikiLink>
          <hr />
          <WikiLink entityId="project-trophy-display">Preparar Trophy Display →</WikiLink>
        </div>
      </section>
      <div className="home-evidence">
        <span className="signal-dot" />
        <p>
          {sources.length} fuentes registradas · Cada dato conserva su nivel de evidencia. Los
          reportes de ubicaciones no garantizan aparición.
        </p>
        <button
          onClick={() =>
            open({
              kind: 'references',
              ids: sources
                .filter((source) => source.kind === 'official')
                .map((source) => source.id),
            })
          }
        >
          Cómo se verifica el archivo
        </button>
      </div>
    </>
  );
}
