import type { Category, Entity } from '../../domain/schema';
import { categories } from '../EntityDetail';
import { EntityDetail } from '../EntityDetail';
import type { NavigationFocus } from '../../app/useWikiNavigation';

export function ArticleView({
  selected,
  focus,
  category,
  navigate,
}: {
  selected: Entity;
  focus: { blueprintId: string | null; arcId: string | null };
  category: (value: Category) => void;
  navigate: (id: string, next?: NavigationFocus) => void;
}) {
  return (
    <div className="article-layout">
      <div>
        <button className="back-to-category" onClick={() => category(selected.category)}>
          ← {categories[selected.category]}
        </button>
        <EntityDetail
          key={selected.id}
          entity={selected}
          blueprintId={focus.blueprintId ?? undefined}
          arcId={focus.arcId ?? undefined}
          onNavigate={(mapId, blueprintId) => navigate(mapId, { blueprintId })}
        />
      </div>
      <aside className="article-index">
        <span className="section-kicker">EN ESTA PÁGINA</span>
        <a href="#detail-title">Ficha general</a>
        <a href="#datos">Estadísticas y datos</a>
        {['weapon', 'grenade', 'blueprint'].includes(selected.category) && (
          <a href="#fabricacion">Fabricación y mantenimiento</a>
        )}
        <p>La navegación entre fichas, materiales y mapas ocurre dentro de ARC Atlas.</p>
        <span className="confidence posible">evidencia por campo</span>
      </aside>
    </div>
  );
}
