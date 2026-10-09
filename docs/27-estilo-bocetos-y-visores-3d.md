# Fase 27 · Estilo de los bocetos y visores 3D en las fichas

## Qué cambió

- **Estilo de toda la wiki** según los bocetos de escritorio y celular: papel `#EFE8D8`, tarjetas `#F7F2E6`,
  tinta `#1E1E1C`, franja roja / amarilla / verde azulada arriba, bordes de 1,5 px, esquinas de 4 px,
  Space Grotesk para textos y títulos y JetBrains Mono para etiquetas (`// archivo`, `— sección`).
  Los colores siguen saliendo de `tokens.css`; la capa `skin` (`bocetos.css`) ajusta formas y bordes.
- **Portada:** título en minúscula, panel verde azulado con grilla y anillos a la derecha, tarjetas de
  categorías con barra de color y barra de navegación inferior en el celular.
- **Visores 3D:** `armas-3d.html` (24 armas) y el nuevo `arrojadizos-3d.html` (18 objetos, 15 con ficha
  de granada) usan el mismo estilo. Con `?embed` se muestran dentro de la ficha (sin encabezado ni
  lista) y con `?thumb` solo dibujan el modelo para generar miniaturas.
- **Fichas:** las armas y las 15 granadas con modelo muestran el visor dentro de la ficha en lugar del
  boceto fijo o la imagen anterior. Las tarjetas usan miniaturas sacadas de los visores
  (`public/weapon-sketches`, `public/throwable-sketches`). La granada Yank (anunciada) no tiene modelo
  y conserva su imagen.
- **Se quitó el visor anterior** (`public/weapons3d`, `WeaponStudyViewer`, sus scripts y pruebas).

## Datos

No cambió ningún dato del catálogo ni sus niveles de evidencia. Las estadísticas que muestran los
visores son valores de ejemplo y cada visor lo aclara.

## Mantenimiento

Para regenerar las miniaturas: `npm run build`, `npx vite preview --port 4173` y en otra terminal
`node scripts/build-viewer-sketches.mjs` (necesita Playwright con Chromium).
