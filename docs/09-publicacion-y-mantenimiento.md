# Publicación y mantenimiento

## GitHub Pages

Sitio publicado y verificado el 7 de octubre de 2026: [ARC Atlas](https://monovs31.github.io/arc-raiders-wiki/).

La aplicación se publica desde `main` mediante `.github/workflows/pages.yml`. La compilación utiliza la base relativa de Vite y publica exclusivamente `dist`, incluidos los seis conjuntos de reportes comunitarios. El código fuente y las capturas de investigación no forman parte del artefacto web.

En el repositorio, abrir **Settings > Pages > Source > GitHub Actions**. Después de cada cambio integrado en `main`, GitHub instala dependencias, ejecuta tests, comprueba TypeScript, compila y publica. El trabajo de publicación solo se inicia si el de compilación termina correctamente. El entorno `github-pages` conserva el enlace y el historial de despliegues.

No se necesitan tokens personales ni secretos del usuario. El trabajo de compilación tiene lectura del repositorio. Solo el de despliegue tiene `pages: write` e `id-token: write`, conforme al flujo oficial de Pages.

Referencias: [workflows de Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), [configure-pages](https://github.com/actions/configure-pages), [deploy-pages](https://github.com/actions/deploy-pages).

## Estado de la edición 2.1

La edición 2.0 ya fue publicada. Las mejoras de las fases 1 a 7 se prepararon en la copia local de Arc como edición 2.1 y aún requieren integrar los commits y comprobar el nuevo despliegue. El favicon y la tarjeta social son dibujos originales del símbolo de ARC Atlas. No se copiaron imágenes del juego ni tiles para esta entrega.

## Dependencia de imágenes y tiles externos

El registro entity-visuals.json contiene 142 referencias: 136 a static.metaforge.app y 6 al proyecto unhbvkszwhczbjxgetgk.supabase.co. Son 117 URLs únicas, porque algunas fichas reutilizan un archivo. El registro adicional de retratos ARC contiene 21 referencias (15 MetaForge y 6 Supabase), con posibles solapamientos; los iconos de materiales también son remotos. Las nueve plantillas de tiles/pisos de los seis mapas apuntan a static.metaforge.app. Los JSON de datos y marcadores están versionados en el repositorio; las imágenes y los tiles no.

### Riesgos concretos

- Una eliminación, cambio de URL, permisos, bloqueo de hotlink o caída del proveedor puede dejar una imagen o un piso del mapa sin cargar, aunque los datos propios estén disponibles.
- Latencia, cuotas y respuestas 403/404/429 dependen del proveedor. La primera visita no tiene una copia local de respaldo de esos recursos.
- El proveedor puede reemplazar el contenido de una URL sin cambiar nuestro código. La referencia de datos y su revisión no fija los bytes del archivo gráfico.
- Las peticiones del navegador van a servidores de terceros; su política de caché y tratamiento de solicitudes queda fuera del control de ARC Atlas.
- Una URL pública o un bucket público describe acceso técnico, no una autorización para redistribuir imágenes. Las condiciones de la API no deben interpretarse como una licencia general de assets o tiles.

La galería conserva iconos de fallback y la información textual; el mapa muestra avisos de errores de tiles y conserva la lista accesible de reportes. Esto reduce el impacto, pero no mantiene la cartografía visual si el proveedor deja de servirla.

La [documentación de MetaForge](https://metaforge.app/arc-raiders/api) requiere atribución y enlace para proyectos públicos y contacto previo para productos monetizados; también avisa que los endpoints pueden cambiar y recomienda caché de datos. [Supabase documenta el acceso a sus assets](https://supabase.com/docs/guides/storage/serving/downloads). Estas referencias describen el servicio: no confirman por sí solas la licencia de cada imagen.

### Alternativas, sin implementar

| Alternativa | Ventajas | Costos y límites | Decisión previa |
|---|---|---|---|
| Copiar solo imágenes autorizadas al repo, con atribución | URLs estables, control de formatos y tamaños, menos dependencia externa en las fichas | Aumenta el repo y el artefacto; hay que deduplicar las 117 URLs, registrar versiones y mantener créditos. No resuelve los tiles por sí sola | Confirmar permiso/licencia de cada archivo y sus condiciones de modificación y redistribución |
| Proxy/caché propio en un servicio externo | Puede conservar respuestas, aplicar TTL/ETag, limitar tamaño y ofrecer formatos adaptados | GitHub Pages no ejecuta un proxy; requiere otro servicio, presupuesto, supervisión y políticas de actualización. El proxy tampoco evita las obligaciones de licencia | Elegir proveedor, presupuesto y alcance autorizado |
| Mantener referencias remotas y monitorear fallos | Costo operativo menor; no añade copias permanentes propias | Persiste el riesgo de disponibilidad, cambios y límites de terceros | Aceptar la dependencia mientras se revisan permisos |

Para una copia autorizada se propone un manifiesto con URL original, titular, licencia o permiso comprobado, fecha, hash, atribución y ruta local. Descargar únicamente los archivos aprobados, conservar metadatos originales y comprobar la licencia antes de transformar formatos. Los tiles se evalúan aparte: no descargar mapas completos ni aumentar solicitudes por lotes sin revisar sus condiciones.

Un proxy debe aceptar solo hosts/rutas permitidos, limitar bytes y tiempo, controlar redirecciones y tipos de contenido, usar caché con invalidación y devolver una alternativa cuando falle. No se propone un proxy abierto ni exponer credenciales en VITE_*. Una caché de navegador puede ayudar en visitas repetidas, pero no protege la primera visita ni reemplaza el permiso de uso.

**Decisión pendiente:** el usuario debe confirmar las licencias/permisos y elegir el alcance antes de copiar cualquier imagen externa. Esta fase no incluye descargas, copias, proxy ni caché de tiles.

## Revisar y actualizar datos

1. Consultar el anuncio oficial y la ficha específica. Una actualización futura no cambia la disponibilidad antes de su lanzamiento.
2. Capturar fecha, URL permanente o revisión, hash y sección que respalda cada campo.
3. Añadir o actualizar fuentes y afirmaciones. El estado se asigna por dato, con explicación cuando falta evidencia.
4. Para mapas, ejecutar `npm run data:maps` y revisar conteos, calibración, pisos y condiciones. Las ubicaciones siguen siendo reportes posibles.
5. Para rutas, preparar las capturas comunitarias que usa `scripts/build-blueprint-routes.mjs`, ejecutar `npm run data:blueprints` y revisar manualmente los cambios. No asumir que cualquier contenedor garantiza un plano.
6. Ejecutar lint, typecheck, tests, validación de datos y build, comprobar las fichas afectadas y abrir una propuesta de cambios. Integrar después de CI; comprobar la publicación en Actions.

Los retratos ARC usan referencias remotas de MetaForge, con atribución y procedencia registrada. No se redistribuyen archivos gráficos ni se inventan coordenadas de zonas débiles sobre las imágenes. Si una imagen deja de funcionar, se mantiene accesible la información textual.

## Preservación y límites

Guardar copias ZIP del código y bundles de Git fuera del árbol del repositorio. La carpeta local principal y los respaldos permanecen dentro de Arc. Para recuperar una versión, crear una rama desde el commit conocido; una corrección se integra como un nuevo cambio y vuelve a pasar las comprobaciones.

Hacer privado el repositorio más adelante no elimina copias que otros ya hayan descargado. Según el plan de GitHub, también puede cambiar la disponibilidad de Pages. Revisar las condiciones del alojamiento antes de hacerlo. No se incluyó una licencia abierta para conceder derechos sobre código o assets del juego.

La cobertura es un inventario verificable, no una afirmación de exhaustividad. Quedan pendientes verificaciones dentro del juego, rutas incompletas y diagramas anatómicos con evidencia primaria. Las imágenes de referencia no equivalen a esos diagramas.

## Actualización: imágenes locales en la fase 8

El usuario autorizó después la descarga y uso de las imágenes, declarando que no tiene permisos de redistribución. Se copiaron 381 imágenes de fichas, ARC y materiales a un caché local (54,7 MB). Sus licencias siguen sin confirmar: atribuirlas o encontrarlas públicas no concede autorización. Los términos de MetaForge reservan las imágenes y marcas a sus titulares: https://metaforge.app/terms.

El build verifica el snapshot con SHA-256 y publica las imágenes desde Pages. El navegador deja de depender de static.metaforge.app y Supabase para esas imágenes. Los tiles permanecen externos. El caché binario está fuera de Git y se guarda en Arc; CI lo reconstruye desde URLs públicas verificadas. Esto reduce el tamaño del repositorio, pero mantiene una dependencia externa durante las nuevas compilaciones. Una imagen modificada, borrada o inaccesible bloquea el build sin borrar el sitio publicado. Un reclamo del titular requiere retirar las imágenes afectadas o reemplazarlas por recursos propios/autorizados. No se agregó proxy, servicio de pago ni permiso nuevo de GitHub.
