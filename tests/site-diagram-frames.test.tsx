// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import ProjectSteps from '../src/components/ProjectSteps';
import { BlueprintRouteCard } from '../src/components/BlueprintRouteCard';
import LocalDossier from '../src/components/LocalDossier';
import { EntityDetail } from '../src/components/EntityDetail';
import { GalleryCardContent } from '../src/components/wiki/Gallery';
import { HomeView } from '../src/components/wiki/HomeView';
import { Sidebar } from '../src/components/wiki/Sidebar';
import { categoryGuides } from '../src/domain/category-guides';
import { stepsForProject } from '../src/domain/projects';
import { routeForBlueprint } from '../src/domain/blueprints';
import { catalog } from '../src/domain/catalog';
import { WikiContext } from '../src/app/WikiContext';
let host: HTMLDivElement, root: Root;
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  vi.stubGlobal('matchMedia', () => ({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});
it('el marco de proyecto conserva etapas, requisitos, recompensas y advertencias', async () => {
  const project = stepsForProject('project-trophy-display')!;
  const snapshot = JSON.stringify(project);
  await act(async () => root.render(<ProjectSteps projectId={project.entityId} />));
  expect(host.querySelector('.diagram-section-frame')).not.toBeNull();
  const select = host.querySelector('select')!;
  await act(async () => {
    select.value = '1';
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });
  for (const text of project.stages[1]!.requirements) expect(host.textContent).toContain(text);
  for (const text of project.stages[1]!.rewards) expect(host.textContent).toContain(text);
  expect(host.textContent).toContain('no son puntos de aparición de un plano');
  expect(JSON.stringify(project)).toBe(snapshot);
});
it('la tarjeta de plano enmarcada mantiene el destino del mapa y su evidencia', async () => {
  const id = 'blueprint-hullcracker-blueprint',
    navigate = vi.fn(),
    route = routeForBlueprint(id)!;
  await act(async () => root.render(<BlueprintRouteCard blueprintId={id} onNavigate={navigate} />));
  const button = [...host.querySelectorAll<HTMLButtonElement>('.route-maps button')].find(
    (button) => button.textContent?.includes('Dam Battlegrounds'),
  )!;
  await act(async () => button.click());
  expect(navigate).toHaveBeenCalledWith('map-dam-battlegrounds', id);
  expect(host.textContent).toContain(route.note);
  expect(host.textContent).toContain('Sus objetivos no son puntos de aparición');
  expect(host.querySelectorAll('.diagram-section-frame')).toHaveLength(1);
});
it('un dossier fallido permite reintentar, conserva tablas y fuentes y no bloquea sus controles', async () => {
  const data = JSON.parse(readFileSync('public/data/dossiers/grenade.json', 'utf8'));
  const entity = catalog.entities.find((entity) => entity.id === 'grenade-heavy-fuze-grenade')!;
  const request = vi
    .fn()
    .mockRejectedValueOnce(new Error('No disponible'))
    .mockResolvedValueOnce(new Response(JSON.stringify(data)));
  vi.stubGlobal('fetch', request);
  await act(async () => root.render(<LocalDossier entity={entity} />));
  await vi.waitFor(() => expect(host.querySelector('[role=alert]')).not.toBeNull());
  await act(async () => host.querySelector<HTMLButtonElement>('[role=alert] button')!.click());
  await vi.waitFor(() => expect(host.querySelector('#fabricacion')).not.toBeNull());
  const dossier = data.find((row: { entityId: string }) => row.entityId === entity.id);
  expect(host.querySelectorAll('details')).toHaveLength(dossier.tables.length);
  expect(host.querySelector('details')!.open).toBe(true);
  expect(host.querySelector('.diagram-section-frame')).not.toBeNull();
  expect(host.querySelector('.evidence-button')).not.toBeNull();
  if (host.querySelectorAll('details').length > 1) {
    const details = host.querySelectorAll('details')[1]!;
    await act(async () => {
      details.open = true;
      details.dispatchEvent(new Event('toggle'));
    });
    expect(details.open).toBe(true);
  }
});
it('el contenedor conserva sus campos sin puntos y las imágenes normales tienen un único marco', async () => {
  const material = vi.fn();
  const entity = catalog.entities.find((entity) => entity.id === 'container-weapon-case')!;
  await act(async () =>
    root.render(
      <WikiContext.Provider value={{ navigate: vi.fn(), references: vi.fn(), material }}>
        <EntityDetail entity={entity} />
      </WikiContext.Provider>,
    ),
  );
  expect(host.querySelector('.diagram-container-frame')).not.toBeNull();
  expect(host.querySelector('.diagram-hotspot')).toBeNull();
  for (const claim of catalog.claims.filter((claim) => claim.subjectId === entity.id))
    if (claim.value !== null) expect(host.textContent).toContain(String(claim.value));
  const kettle = catalog.entities.find((entity) => entity.id === 'weapon-kettle')!;
  await act(async () => root.render(<EntityDetail key={kettle.id} entity={kettle} />));
  expect(host.querySelectorAll('.article-visual .original-weapon-sketch')).toHaveLength(1);
  expect(host.querySelector('.article-visual .diagram-hotspot')).toBeNull();
});
it('portada y galería mantienen una sola capa de tilt y no se apilan marcos de diagrama', async () => {
  const entity = catalog.entities.find((entity) => entity.id === 'weapon-kettle')!;
  await act(async () => root.render(<GalleryCardContent entity={entity} />));
  expect(host.querySelectorAll('.card-tilt')).toHaveLength(1);
  expect(host.querySelector('.diagram-frame')).toBeNull();
  await act(async () =>
    root.render(
      <HomeView
        category={vi.fn()}
        open={vi.fn()}
        globalSearch=""
        setGlobalSearch={vi.fn()}
        globalResults={[]}
        navigate={vi.fn()}
      />,
    ),
  );
  expect(host.querySelectorAll('.welcome-banner')).toHaveLength(1);
  expect(host.querySelectorAll('.home-category-button')).toHaveLength(0);
  expect(host.querySelectorAll('.featured-grid')).toHaveLength(1);
  expect(host.querySelector('.diagram-frame')).toBeNull();
});

it('el menú conserva los destinos del catálogo y da acceso a todas las guías retiradas de la portada', async () => {
  const category = vi.fn(),
    openGuide = vi.fn(),
    openMaterials = vi.fn();
  await act(async () =>
    root.render(
      <Sidebar
        menu={false}
        setMenu={vi.fn()}
        view="category"
        activeCategory="weapon"
        home={vi.fn()}
        category={category}
        openMaterials={openMaterials}
        openGuide={openGuide}
      />,
    ),
  );
  const buttons = Array.from(host.querySelectorAll<HTMLButtonElement>('nav button'));
  expect(buttons).toHaveLength(18);
  expect(buttons.every((button) => button.querySelector('svg path[fill="currentColor"]'))).toBe(
    true,
  );
  const weapons = buttons.find((button) => button.textContent === 'Armas26')!;
  expect(weapons.getAttribute('aria-current')).toBe('page');
  await act(async () => weapons.click());
  expect(category).toHaveBeenCalledWith('weapon');
  await act(async () =>
    buttons.find((button) => button.textContent === 'Botín y materiales')!.click(),
  );
  expect(openMaterials).toHaveBeenCalledOnce();
  for (const section of categoryGuides.sections) {
    await act(async () => buttons.find((button) => button.textContent === section.title)!.click());
    expect(openGuide).toHaveBeenLastCalledWith(section.id);
  }
});
