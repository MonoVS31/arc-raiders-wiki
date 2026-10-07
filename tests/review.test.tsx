// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { catalog, sourceById } from '../src/domain/catalog';
import { researchAudit } from '../src/domain/research-audit';
import { arcZoneData, zonesForARC } from '../src/domain/arc-zones';
import { blueprintRoutes } from '../src/domain/blueprints';
import { requestedEntity, entityLink } from '../src/domain/navigation';
import ARCZoneExplorer from '../src/components/ARCZoneExplorer';
import { projectStageData, stepsForProject } from '../src/domain/projects';
import { projectBlueprintRewards } from '../src/domain/project-rewards';
import { arcMapReports, materialArcHints } from '../src/domain/arc-links';
import { readFileSync } from 'node:fs';
import { arcIdForSubtype, mapManifest } from '../src/domain/maps';
import { weaponTierMetric, combatClaim } from '../src/domain/combat';

describe('revisión por dato', () => {
  it('incluye todas las rutas con fuentes y no confunde objetos con planos', () => {
    expect(researchAudit.routes).toHaveLength(blueprintRoutes.length);
    for (const row of researchAudit.routes) {
      expect(blueprintRoutes.some((route) => route.blueprintId === row.blueprintId)).toBe(true);
      expect(row.sourceIds.every((id) => sourceById.has(id))).toBe(true);
    }
    expect(blueprintRoutes.find((route) => route.name === 'Aphelion')?.confidence).toBe('posible');
    expect(blueprintRoutes.find((route) => route.name === 'Hullcracker')?.confidence).toBe(
      'probable',
    );
    expect(
      researchAudit.routes.filter((row) => row.routeEvidence === 'explicit-blueprint'),
    ).toHaveLength(6);
  });
  it('conserva campos desconocidos de Trials y los contenedores específicos con su alcance', () => {
    expect(
      researchAudit.routes.find((row) => row.blueprintId === 'blueprint-fireworks-box-blueprint')
        ?.pendingFields,
    ).toContain('Trials');
    const grip = researchAudit.routes.find(
      (row) => row.blueprintId === 'blueprint-angled-grip-ii-blueprint',
    )!;
    expect(grip.containerDetails).toContain('Residential Cabinet');
    expect(grip.routeEvidence).toBe('containers-only');
    expect(
      blueprintRoutes.find((route) => route.blueprintId === grip.blueprintId)?.confidence,
    ).toBe('posible');
  });
});
describe('proyectos y reportes enlazados', () => {
  it('muestra las etapas de todos los proyectos con su estado y fuente', () => {
    const projects = catalog.entities.filter((entity) => entity.category === 'project');
    expect(projectStageData.projects).toHaveLength(projects.length);
    for (const entity of projects) {
      const data = stepsForProject(entity.id)!;
      expect(data.stages.length).toBeGreaterThan(0);
      expect(data.availability).toBe(entity.availability);
      expect(sourceById.has(data.sourceId)).toBe(true);
    }
    expect(stepsForProject('project-trophy-display')?.stages).toHaveLength(5);
  });
  it('no convierte recompensas de armas fabricadas en recompensas de planos', () => {
    const trophy = stepsForProject('project-trophy-display')!;
    expect(trophy.stages[4]?.rewards).toContain('1× Aphelion');
    expect(
      projectBlueprintRewards.some(
        (reward) =>
          reward.projectId === trophy.entityId &&
          reward.blueprintId === 'blueprint-aphelion-blueprint',
      ),
    ).toBe(false);
    expect(
      projectBlueprintRewards.some(
        (reward) =>
          reward.projectId === trophy.entityId &&
          reward.blueprintId === 'blueprint-bobcat-blueprint',
      ),
    ).toBe(true);
    expect(trophy.completion).toContain('1× Jupiter');
  });
  it('mantiene separado el cierre declarado del estado actual sin hora confirmada', () => {
    expect(
      catalog.entities.find((entity) => entity.id === 'project-ascending-the-mountain')
        ?.availability,
    ).toBe('desconocido');
    expect(
      catalog.claims.find(
        (claim) =>
          claim.subjectId === 'project-ascending-the-mountain' && claim.field === 'cierre de ficha',
      )?.value,
    ).toBe('2026-10-07');
    expect(
      catalog.claims.find(
        (claim) =>
          claim.subjectId === 'project-avian-alarm' && claim.field === 'periodo del índice',
      )?.confidence,
    ).toBe('no confirmado');
    expect(stepsForProject('project-converging-paths')?.stages[0]?.requirements[0]).toContain(
      '1200',
    );
    expect(stepsForProject('project-converging-paths')?.stages[0]?.rewards).toContain(
      '3× Pulse Mine',
    );
  });
  it('los conteos de ARC enlazados corresponden a reportes reales, incluidas las variantes internas', () => {
    for (const entry of arcMapReports)
      for (const report of entry.maps) {
        const map = mapManifest.maps.find((map) => map.id === report.mapId)!;
        const snapshot = JSON.parse(readFileSync(`public/data/maps/${map.slug}.json`, 'utf8')) as {
          markers: { kind: string; subtype: string }[];
        };
        expect(report.count).toBe(
          snapshot.markers.filter(
            (marker) => marker.kind === 'arc' && arcIdForSubtype(marker.subtype) === entry.entityId,
          ).length,
        );
        expect(sourceById.has(report.sourceId)).toBe(true);
      }
  });
  it('las pistas de materiales son reportes posibles con una ficha ARC válida', () => {
    expect(materialArcHints.length).toBeGreaterThan(0);
    for (const hint of materialArcHints) {
      expect(hint.confidence).toBe('posible');
      expect(
        catalog.entities.some((entity) => entity.id === hint.entityId && entity.category === 'arc'),
      ).toBe(true);
      expect(sourceById.has(hint.sourceId)).toBe(true);
    }
  });
});
describe('zonas ARC', () => {
  it('abarca todos los enemigos disponibles con procedencia y sin inventar zonas desconocidas', () => {
    const enemies = catalog.entities.filter(
      (entity) => entity.category === 'arc' && entity.availability === 'disponible',
    );
    expect(arcZoneData.enemies).toHaveLength(enemies.length);
    for (const enemy of enemies) {
      const data = zonesForARC(enemy.id)!;
      expect(data.sourceIds.every((id) => sourceById.has(id))).toBe(true);
      expect(renderToStaticMarkup(<ARCZoneExplorer entityId={enemy.id} />)).toContain(
        'Zonas y condiciones de combate',
      );
    }
    expect(zonesForARC('arc-tick')?.zones.find((zone) => zone.id === 'unknown')?.confidence).toBe(
      'no confirmado',
    );
  });
  it('distingue motores frontales blindados y núcleos expuestos por una condición', () => {
    expect(zonesForARC('arc-hornet')?.zones.find((zone) => zone.id === 'front')?.kind).toBe(
      'protected',
    );
    expect(zonesForARC('arc-hornet')?.zones.find((zone) => zone.id === 'rear')?.kind).toBe('weak');
    expect(
      zonesForARC('arc-fireball')?.zones.find((zone) => zone.id === 'core')?.condition,
    ).toContain('abierto');
    expect(
      zonesForARC('arc-surveyor')?.zones.find((zone) => zone.id === 'core')?.condition,
    ).toContain('Transmisión');
  });
  it('no convierte las resistencias de una tabla comunitaria en valores confirmados', () => {
    const leaper = zonesForARC('arc-leaper')!;
    expect(leaper.resistances).toHaveLength(6);
    expect(leaper.resistances.every((row) => row.confidence === 'no confirmado')).toBe(true);
    expect(renderToStaticMarkup(<ARCZoneExplorer entityId="arc-leaper" />)).toContain(
      'no se utilizan para calcular daño',
    );
  });
});
describe('enlaces para revisar fichas', () => {
  it('abre solo entidades conocidas y mantiene la disponibilidad del anuncio', () => {
    expect(requestedEntity('?entity=arc-hornet', catalog.entities)?.id).toBe('arc-hornet');
    expect(requestedEntity('?entity=inventado', catalog.entities)).toBeUndefined();
    const announced = catalog.entities.find((entity) => entity.availability === 'anunciado')!;
    expect(requestedEntity('?entity=' + announced.id, catalog.entities)?.availability).toBe(
      'anunciado',
    );
  });
  it('conserva la subcarpeta de publicación y codifica el foco del plano', () => {
    const link = new URL(
      entityLink(
        'https://monovs31.github.io/arc-raiders-wiki/?obsolete=1',
        'map-dam-battlegrounds',
        'blueprint-hullcracker-blueprint',
      ),
    );
    expect(link.pathname).toBe('/arc-raiders-wiki/');
    expect(link.searchParams.has('obsolete')).toBe(false);
    expect(link.searchParams.get('blueprint')).toBe('blueprint-hullcracker-blueprint');
    expect(link.hash).toBe('#catalog');
    expect(
      new URL(
        entityLink(
          link.toString(),
          'map-dam-battlegrounds',
          'blueprint-hullcracker-blueprint',
          'arc-hornet',
        ),
      ).searchParams.has('arc'),
    ).toBe(false);
  });
});
describe('estadísticas con evidencia y nivel', () => {
  it('selecciona el cargador declarado por nivel sin calcular mejoras acumulativas', () => {
    expect(weaponTierMetric('weapon-rattler', 'Magazine Size', 'I')?.value).toBe('12');
    expect(weaponTierMetric('weapon-rattler', 'Magazine Size', 'IV')?.value).toBe('24');
    expect(weaponTierMetric('weapon-kettle', 'Magazine Size', 'IV')?.value).toBe('20');
    expect(weaponTierMetric('weapon-aphelion', 'Magazine Size', 'IV')).toEqual(
      combatClaim('weapon-aphelion', 'Magazine Size'),
    );
  });
  it('no presenta como confirmada la vida estimada ni rellena habilidades ausentes', () => {
    expect(combatClaim('arc-queen', 'Health')?.confidence).toBe('no confirmado');
    expect(combatClaim('arc-matriarch', 'Health')?.confidence).toBe('no confirmado');
    expect(combatClaim('arc-arc-turbine', 'Health')?.confidence).toBe('no confirmado');
    const wasp = combatClaim('arc-wasp', 'Abilities')!;
    expect(wasp.value).toBeNull();
    expect(wasp.confidence).toBe('no confirmado');
  });
});
