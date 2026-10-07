# Entrega de edición 2.1

## Resultado

Favicon SVG original con las tres barras solicitadas; imagen social PNG original de 1200 x 630; metadatos Open Graph, Twitter y canonical en el HTML inicial. README renovado con las siete fases, funcionamiento, mantenimiento, estado de publicación y límites. Los datos de la wiki permanecen idénticos.

## Bundle

| Referencia | Principal KB | Gzip KB |
|---|---:|---:|
| Original solicitado | 725 | 132 |
| Edición 2.1, reporte de build | 4,06 | 1,94 |

La tabla compara la entrada JavaScript, no la aplicación completa. React y la wiki se cargan después de los JSON; Zod y Motion tienen sus chunks. La tarjeta social PNG, el favicon, CSS, 670.605 bytes de JSON propios e imágenes remotas se transfieren aparte. El presupuesto de entrada sigue por debajo de 200.000 bytes.

## Commits

1. 8535b95 - Fase 1: calcular contadores desde el catálogo y definir reglas para agentes.
2. bbf5911 - Fase 2: ordenar componentes, agregar lint y conservar el scroll del historial.
3. fbb6ac9 - Fase 3: limpiar CSS antiguo, unificar tokens y ordenar la cascada.
4. 54ccff6 - Fase 4: mejorar contraste, lectura y navegación accesible.
5. dbe1f54 - Fase 5: cargar datos por demanda y optimizar mapas e imágenes.
6. b306a15 - Fase 6: sumar transiciones nativas y animaciones por demanda.
7. Commit de esta entrega - Fase 7: agregar SEO y documentar la entrega 2.1; su hash se obtiene con git log -1.

## Comprobaciones

Lint, typecheck, 96 pruebas, validación de datos y build aprobados. El HTML compilado conserva el canonical HTTPS, la imagen social absoluta y favicon relativo ./favicon.svg. PNG de 1200 x 630 comprobado y revisado visualmente; favicon con tres paths y colores solicitados. No se copiaron imágenes externas, no se instaló prerender y no cambiaron los archivos de datos ni base: './'.

## Pendientes y decisiones

- La entrega conserva los siete commits de fase y un commit de cierre de documentación. Pages publica solo después de superar los controles de GitHub Actions.
- Aprobar un piloto de prerender de tres fichas y elegir Astro o SSG compatible con React; la preview actual es general. Las estimaciones, ventajas y costos se explican en 16-seo-y-prerender.md.
- Confirmar licencias y permisos por archivo antes de copiar cualquier imagen externa. Elegir entre imágenes autorizadas en repo, proxy/caché o referencias remotas. Los tiles tienen evaluación separada; riesgos en 09-publicacion-y-mantenimiento.md.
- Definir presupuesto/proveedor si se elige proxy: Pages no lo ejecuta.
- Revisar el parche Frozen Trail y los datos pendientes después del lanzamiento con fuentes; ninguna disponibilidad se cambió en estas fases.
- La guía PDF 2.1 se actualiza desde la documentación de las siete fases, con 166 fuentes y la verificación de 96 pruebas; queda en Arc/outputs. La versión 2.0 permanece como respaldo.

GSAP/ScrollTrigger y ARC 3D siguen como ideas futuras, sin dependencias instaladas. No se envió un mensaje a Discord para probar previews.
