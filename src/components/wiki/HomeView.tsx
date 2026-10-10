import { CountUp } from './CountUp';
import type { Category, Entity } from '../../domain/schema';
import { sources } from '../../domain/catalog';
import { WikiLink } from '../../app/WikiContext';
import type { WikiPanel } from '../WikiModal';
import { GlobalSearch } from './GlobalSearch';
import { availableCount } from './presentation';
import { standaloneViewer } from '../../domain/standalone-weapons';
import { HomeCategoryIcon, type HomeCategoryIconName } from './HomeCategoryIcon';

const homeCategories: [Category, string, string, HomeCategoryIconName][] = [
  ['weapon', 'Armas', 'yellow', 'weapon'],
  ['arc', 'Enemigos ARC', 'red', 'arc'],
  ['map', 'Mapas', 'teal', 'map'],
  ['grenade', 'Granadas', 'blue', 'equipment'],
  ['blueprint', 'Planos', 'ink', 'science'],
];

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
        <div className="banner-radar" aria-hidden="true" />
        <div className="banner-orbit" aria-hidden="true" />
        <div className="welcome-copy">
          <span className="section-kicker">INTELIGENCIA PARA LA PRÓXIMA INCURSIÓN</span>
          <h1>
            <span className="hero-word" style={{ '--word': 0 } as React.CSSProperties}>
              El{' '}
            </span>
            <span className="hero-word" style={{ '--word': 1 } as React.CSSProperties}>
              Rust{' '}
            </span>
            <span className="hero-word" style={{ '--word': 2 } as React.CSSProperties}>
              Belt.
            </span>
            <br />
            <em>
              <span className="hero-word" style={{ '--word': 3 } as React.CSSProperties}>
                En{' '}
              </span>
              <span className="hero-word" style={{ '--word': 4 } as React.CSSProperties}>
                tus{' '}
              </span>
              <span className="hero-word" style={{ '--word': 5 } as React.CSSProperties}>
                manos.
              </span>
            </em>
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
          <img
            width={960}
            height={480}
            decoding="async"
            src={standaloneViewer('arc-rocketeer')?.sketch}
            alt=""
          />
          <span>ARC / ARCHIVO DE COMBATE</span>
        </div>
      </section>
      <div className="release-ticker">
        <button onClick={() => open({ kind: 'news' })} aria-label="Ver el anuncio de Frozen Trail">
          <span className="ticker-track">
            <span>FROZEN TRAIL / ANUNCIADO / 08 OCT 2026 / ARCHIVO EN ACTUALIZACIÓN / </span>
            <span aria-hidden="true">
              FROZEN TRAIL / ANUNCIADO / 08 OCT 2026 / ARCHIVO EN ACTUALIZACIÓN /{' '}
            </span>
          </span>
        </button>
      </div>
      <div className="portal-stats">
        <div>
          <CountUp value={availableCount('map')} />
          <span>mapas de incursión</span>
        </div>
        <div>
          <CountUp value={availableCount('weapon')} />
          <span>armas disponibles</span>
        </div>
        <div>
          <CountUp value={availableCount('blueprint')} />
          <span>planos documentados</span>
        </div>
        <div>
          <CountUp value={availableCount('arc')} />
          <span>máquinas ARC</span>
        </div>
      </div>
      <section className="home-categories" aria-labelledby="home-categories-title">
        <h2 id="home-categories-title" className="home-label">
          categorías
        </h2>
        <div className="home-category-grid">
          {homeCategories.map(([value, label, tone, icon]) => (
            <button
              key={value}
              className={`home-category tone-${tone}`}
              onClick={() => category(value)}
            >
              <HomeCategoryIcon name={icon} />
              <span className="home-category-name">{label}</span>
              <span className="home-category-count">{availableCount(value)} fichas</span>
            </button>
          ))}
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
          <div className="featured-art">
            <img
              width={960}
              height={480}
              decoding="async"
              src={standaloneViewer('arc-hornet')?.sketch}
              alt="Hornet"
              loading="lazy"
            />
          </div>
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
