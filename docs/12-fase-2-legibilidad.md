# Fase 2: legibilidad y herramientas de calidad

## Cambios

- Prettier formatea todo `src/`, incluidos estilos y JSON, sin cambiar los valores de los datos.
- ESLint usa flat config, las reglas recomendadas de TypeScript y accesibilidad JSX, y las reglas de Hooks y sus dependencias.
- `npm run lint` se ejecuta en `ci.yml` y `pages.yml`; `npm run format` aplica el formato compartido.
- `WikiApp` coordina Sidebar, Topbar/Breadcrumb, GlobalSearch, HomeView, CategoryView y ArticleView. Las clases y los elementos de la interfaz permanecen iguales.
- `useWikiNavigation` concentra lectura de parámetros, pushState y popstate. Las posiciones se guardan por entrada del historial; al regresar se recupera la posición guardada sin aplicar el scroll al inicio ni reenfocar el artículo. La navegación nueva conserva el scroll inmediato al inicio.
- La búsqueda global usa `useMemo`. Se retiraron los chequeos de SSR del código de la SPA.
- Los tests de renderizado usan jsdom, y un nuevo test de navegación monta React en un navegador simulado.

## Compatibilidad

TypeScript queda en 6.0.3 porque typescript-eslint 8.71.1 declara soporte `>=4.8.4 <6.1.0`. El compilador 7.0.2 anterior no cumple ese rango. ESLint usa la rama 9 porque eslint-plugin-jsx-a11y 6.10.2 no declara soporte para ESLint 10. No se forzaron dependencias incompatibles. React 19, Vite, Zod, Leaflet y los ajustes estrictos del compilador se conservan.

## Verificación

- Lint, typecheck, 52 tests y build pasan.
- Una comparación temporal del HTML normalizado de la portada contra el commit de la fase 1 confirmó estructura, clases, atributos y texto idénticos.
- Todos los JSON versionados de `src/data/` se compararon por valor contra la fase 1: contenido, fuentes, notas, evidencia y disponibilidad idénticos.
- Las pruebas de navegación cubren category, entity, blueprint y arc, enlaces con contexto, cierre de paneles y scroll al volver y avanzar.
- Revisión local en navegador: búsqueda, galería, artículo y regreso al arsenal con la posición guardada de 775 px. Sin errores de consola.
- `base: './'` se conserva y las interacciones nuevas son inmediatas, sin añadir animaciones.

## Pendiente

La publicación de las fases 1 y 2 en GitHub queda separada de esta entrega local. La advertencia previa del bundle principal superior a 500 kB sigue pendiente de una fase dedicada a rendimiento. No se actualizaron datos de Frozen Trail.
