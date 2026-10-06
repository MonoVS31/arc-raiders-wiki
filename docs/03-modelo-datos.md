# Modelo de datos

## Entidades

**Source**: id, title, url HTTPS, kind (official/community/editorial/technical), retrievedAt, revision nullable, contentHash nullable, locator. Una revisión permanente de wiki y un hash conservan la identidad de la consulta sin copiar artículos completos.

**Claim**: id, subjectId, field, value tipado (texto, número, booleano o null), unit nullable, confidence (confirmado/probable/posible/no confirmado), sourceIds, note, availability, effectiveFrom nullable. La evidencia pertenece al campo; null significa desconocido, nunca cero. La confianza no es una probabilidad estadística.

**Entity**: id estable, name, category (map/weapon/arc/grenade/blueprint/project/container), availability. Se relaciona con Claims por subjectId. Un anuncio puede tener nombre confirmado y estadísticas no confirmadas.

**LocationCandidate**: id, mapId, subjectId, kind, floor nullable, position nullable {x,y}, assetId nullable, conditions, confidence, sourceIds, note. x e y son fracciones normalizadas; una posición sin asset y escala no es publicable. Un POI textual puede existir con position null. Una ubicación posible jamás implica aparición garantizada.

**MapAsset** (futuro): id, mapId, floor, path, width, height, license, attribution, gameVersion, calibration, metersPerPixel nullable. Unidades sin escala no permiten representar radios métricos.

**WeaponTier**: se representa inicialmente con claims por tier: II.perks, III.perks, IV.perks. Después tabla WeaponVariant(id, weaponId, level, upgradeRecipeId). Las estadísticas por nivel tienen evidencia propia; no heredan el daño de una tabla de mejoras si no lo declara.

**Effect** (futuro): id, grenadeId, target (arc/raider/both/unknown), kind (damage/stun/smoke/stamina/tagging/homing), radius, unit, geometry, duration, delay, falloff nullable y claimIds. Un radio de búsqueda y uno de explosión son conceptos separados. No se transforma Range de un arma en metros.

**ProjectStage / Recipe / Ingredient** (futuro): stageNumber, requirementItemId, quantity, rewardItemId, claimIds. Proyectos históricos y planos no comparten entidad.

## Relaciones

Source 1—N ClaimSource N—1 Claim N—1 Entity. Entity map 1—N LocationCandidate N—1 Entity loot. MapAsset 1—N LocationCandidate. Weapon 1—N WeaponVariant. Project 1—N Stage 1—N Requirement/Reward. Blueprint N—1 Recipe 1—N Ingredient.

La primera versión usa arreglos JSON; IDs de fuentes y sujetos se validan antes de mostrar la aplicación. La migración futura a SQL preserva los mismos IDs y exige integridad referencial. La validación rechaza fuentes inexistentes, IDs duplicados, posiciones fuera de rango y confianza elevada sin evidencia.

## Estados y conflictos

Todas las afirmaciones no confirmadas llevan una nota explícita. Confirmado exige evidencia oficial en esta fase. Conflictos conservan ambos candidatos y generan una afirmación no confirmada con sus fuentes, como las dos fechas de Ascending The Mountain. Disponibilidad desconocida hasta resolución. La clasificación posible de una ruta no implica que sea un rumor: refleja que el botín puede aparecer y que no hay garantía.

## Búsquedas y filtros

Funciones puras por categoría, texto, confianza y disponibilidad. La UI muestra todos los campos de una ficha con su estado individual y acceso a fuentes. No se calcula una confianza máxima de la entidad para ocultar campos dudosos. Resultados vacíos son explícitos. Por defecto se excluyen anuncios e históricos del catálogo disponible, pero se ofrece un filtro para consultarlos.
