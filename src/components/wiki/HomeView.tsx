import { CountUp } from './CountUp';
import type { Category, Entity } from '../../domain/schema';
import type { GuideSection } from '../../domain/category-guides';
import { HomeCategoryIcon, type HomeCategoryIconName } from './HomeCategoryIcon';
import { sources } from '../../domain/catalog';
import { WikiLink } from '../../app/WikiContext';
import type { WikiPanel } from '../WikiModal';
import { GlobalSearch } from './GlobalSearch';
import { artFor, availableCount } from './presentation';

const homeCategories: {
  name: string;
  icon: HomeCategoryIconName;
  category?: Category;
  materials?: boolean;
  guide?: GuideSection;
}[] = [
  { name: 'ARCO', icon: 'arc', category: 'arc' },
  { name: 'Mapas', icon: 'map', category: 'map' },
  { name: 'Misiones', icon: 'missions', guide: 'missions' },
  { name: 'Armas', icon: 'weapon', category: 'weapon' },
  { name: 'Equipo', icon: 'equipment', guide: 'equipment' },
  { name: 'Botín', icon: 'loot', materials: true },
  { name: 'Comerciantes', icon: 'traders', guide: 'traders' },
  { name: 'Taller', icon: 'workshop', guide: 'workshop' },
  { name: 'Proyectos', icon: 'projects', category: 'project' },
  { name: 'Juicios', icon: 'trials', guide: 'trials' },
  { name: 'Habilidades', icon: 'skills', guide: 'skills' },
  { name: 'Personalización', icon: 'customization', guide: 'customization' },
  { name: 'Mazos', icon: 'decks', guide: 'decks' },
  { name: 'Ciencia', icon: 'science', guide: 'science' },
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
              EL{' '}
            </span>
            <span className="hero-word" style={{ '--word': 1 } as React.CSSProperties}>
              RUST{' '}
            </span>
            <span className="hero-word" style={{ '--word': 2 } as React.CSSProperties}>
              BELT.
            </span>
            <br />
            <em>
              <span className="hero-word" style={{ '--word': 3 } as React.CSSProperties}>
                EN{' '}
              </span>
              <span className="hero-word" style={{ '--word': 4 } as React.CSSProperties}>
                TUS{' '}
              </span>
              <span className="hero-word" style={{ '--word': 5 } as React.CSSProperties}>
                MANOS.
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
          <img width={512} height={512} decoding="async" src={artFor('arc-rocketeer')} alt="" />
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
      <section className="portal-categories">
        <div className="wiki-section-title">
          <div>
            <span className="section-kicker">EL ARCHIVO</span>
            <h2>Elegí por dónde empezar.</h2>
          </div>
          <span>Mapas · equipo · supervivencia</span>
        </div>
        <div className="home-category-grid">
          {homeCategories.map((item) => (
            <button
              type="button"
              className="home-category-button"
              key={item.icon}
              onClick={() => {
                if (item.category) category(item.category);
                else if (item.materials) open({ kind: 'materials' });
                else if (item.guide) open({ kind: 'guide', sectionId: item.guide });
              }}
            >
              <HomeCategoryIcon name={item.icon} />
              <span className={item.icon === 'customization' ? 'category-name-long' : undefined}>
                {item.name}
              </span>
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
              width={512}
              height={512}
              decoding="async"
              src={artFor('arc-hornet')}
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
