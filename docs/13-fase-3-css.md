# Fase 3: limpieza y arquitectura del CSS

## Cascada

`tokens.css` declara una única raíz y el orden `@layer tokens, base, components, utilities`. La entrada importa los tokens primero. Los colores, espaciados, radios, sombras, tamaños tipográficos en rem, duraciones y curvas se definen en ese archivo. Se retiraron los aliases `--lime`, `--muted`, `--line` y `--panel`; el acento actual conserva el turquesa `#65d4ce` bajo `--color-accent`.

- `base`: ajustes de elementos y fondo global.
- `components`: fichas, filtros, portada, navegación, combate, zonas y mapas, con nesting nativo para descendientes y estados.
- `utilities`: enlace de salto, texto solo para lectores de pantalla y una única política global de movimiento reducido.

Los colores literales quedan en el archivo de tokens. Se conservaron los tonos efectivos de las insignias de evidencia, disponibilidad y zonas de combate; no se reinterpretaron sus estados. Las variaciones de color de cada componente tienen nombres por función y contexto.

Los estilos de combate y zonas se importan desde la entrada para que el aspecto no dependa de si el componente llegó antes o después de la hoja de la wiki. Las reglas finales se integraron en sus archivos correspondientes. Leaflet conserva su carga por demanda mediante `leaflet.css`, dentro de la capa base, para que los estilos del mapa en components tengan prioridad.

## Reglas retiradas y consolidadas

Antes de retirar cada clase se ejecutó una búsqueda exacta con `rg` sobre los componentes TSX. Estas 26 clases no tienen uso en la interfaz actual:

`topbar`, `brand`, `brand-mark`, `top-label`, `status-dot`, `hero`, `hero-copy`, `hero-art`, `orbit`, `orbit-two`, `orbit-three`, `art-center`, `art-label`, `scan-line`, `metrics`, `editorial-note`, `catalog-section`, `section-heading`, `categories`, `catalog-layout`, `entity-list`, `entity-button`, `entity-number`, `crosshair`, `badge`, `evidence-guide`.

`categories` aparece como identificador TypeScript del diccionario de rótulos, pero no como clase. Se preservaron clases que siguen en uso, como `primary-link`, `eyebrow`, `map-placeholder`, `filters`, `detail`, `confidence` y `notice`. También se retiraron los keyframes sin uso `scan` y `machine-hover`.

Los parches de `welcome-banner`, `welcome-copy` y `banner-machine` se integraron en las reglas principales y responsive, conservando los valores que antes ganaban en la cascada. `route-audit` y `blueprint-route dt > .confidence` quedan en maps.css, junto con el componente de rutas. Se eliminaron sus copias en main.css y zones.css.

## Verificación

- `npm run lint`, `npm run typecheck`, 54 tests y `npm run build` aprobados.
- Dos pruebas nuevas comprueban que los tokens referenciados existan, que las definiciones no se dupliquen, que la tipografía use rem, que haya una sola raíz y que siga activa la política global de movimiento reducido.
- Comparación de estilos calculados de portada, arsenal, Kettle, Hornet y Hullcracker Blueprint a 1280 x 720: colores, fondos, bordes, tipografía, espaciados y distribución conservados. Las sombras animadas se comparan por sus valores declarados, no por una fase instantánea de la animación.
- Comparación de la portada móvil con la versión publicada a 390 x 844: sin diferencias en los estilos medidos; documento de 375 px dentro del viewport de 390 px. Menú móvil comprobado.
- Mapa de Dam: visor Leaflet, controles y nueve tiles cargados, sin errores de consola.
- No cambiaron los archivos de datos, las URLs, el estado de Frozen Trail ni `base: './'`.

## Pendiente

Las fases 1, 2 y 3 siguen como commits locales; falta su publicación en GitHub. La advertencia previa del bundle principal mayor que 500 kB corresponde a una futura fase de rendimiento. Esta fase no modifica el contenido de la wiki.
