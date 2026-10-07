# Publicación y mantenimiento

## GitHub Pages

Sitio publicado y verificado el 7 de octubre de 2026: [ARC Atlas](https://monovs31.github.io/arc-raiders-wiki/).

La aplicación se publica desde `main` mediante `.github/workflows/pages.yml`. La compilación utiliza la base relativa de Vite y publica exclusivamente `dist`, incluidos los seis conjuntos de reportes comunitarios. El código fuente y las capturas de investigación no forman parte del artefacto web.

En el repositorio, abrir **Settings > Pages > Source > GitHub Actions**. Después de cada cambio integrado en `main`, GitHub instala dependencias, ejecuta tests, comprueba TypeScript, compila y publica. El trabajo de publicación solo se inicia si el de compilación termina correctamente. El entorno `github-pages` conserva el enlace y el historial de despliegues.

No se necesitan tokens personales ni secretos del usuario. El trabajo de compilación tiene lectura del repositorio. Solo el de despliegue tiene `pages: write` e `id-token: write`, conforme al flujo oficial de Pages.

Referencias: [workflows de Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), [configure-pages](https://github.com/actions/configure-pages), [deploy-pages](https://github.com/actions/deploy-pages).

## Revisar y actualizar datos

1. Consultar el anuncio oficial y la ficha específica. Una actualización futura no cambia la disponibilidad antes de su lanzamiento.
2. Capturar fecha, URL permanente o revisión, hash y sección que respalda cada campo.
3. Añadir o actualizar fuentes y afirmaciones. El estado se asigna por dato, con explicación cuando falta evidencia.
4. Para mapas, ejecutar `npm run data:maps` y revisar conteos, calibración, pisos y condiciones. Las ubicaciones siguen siendo reportes posibles.
5. Para rutas, preparar las capturas comunitarias que usa `scripts/build-blueprint-routes.mjs`, ejecutar `npm run data:blueprints` y revisar manualmente los cambios. No asumir que cualquier contenedor garantiza un plano.
6. Ejecutar tests y build, comprobar las fichas afectadas y abrir una propuesta de cambios. Integrar después de CI; comprobar la publicación en Actions.

Los retratos ARC usan referencias remotas de MetaForge, con atribución y procedencia registrada. No se redistribuyen archivos gráficos ni se inventan coordenadas de zonas débiles sobre las imágenes. Si una imagen deja de funcionar, se mantiene accesible la información textual.

## Preservación y límites

Guardar copias ZIP del código y bundles de Git fuera del árbol del repositorio. La carpeta local principal y los respaldos permanecen dentro de Arc. Para recuperar una versión, crear una rama desde el commit conocido; una corrección se integra como un nuevo cambio y vuelve a pasar las comprobaciones.

Hacer privado el repositorio más adelante no elimina copias que otros ya hayan descargado. Según el plan de GitHub, también puede cambiar la disponibilidad de Pages. Revisar las condiciones del alojamiento antes de hacerlo. No se incluyó una licencia abierta para conceder derechos sobre código o assets del juego.

La cobertura es un inventario verificable, no una afirmación de exhaustividad. Quedan pendientes verificaciones dentro del juego, rutas incompletas y diagramas anatómicos con evidencia primaria. Las imágenes de referencia no equivalen a esos diagramas.
