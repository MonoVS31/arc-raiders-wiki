# Arquitectura e inventario técnico

Documento de diseño previo a la implementación, 2026-10-06.

## Alcance de esta entrega

Base web local y repositorio Git independiente preparado para MonoVS31/arc-raiders-wiki. No hay un proyecto ARC existente que migrar. Deben estar listos README, .gitignore, .env.example, TypeScript estricto, catálogo con procedencia y pruebas básicas. Las funciones completas de mapas y combate pertenecen a fases posteriores.

## Inventario técnico

Entorno revisado: Windows, Node 24.19.0, npm 11.17.0, Git 2.55.0, CLI de GitHub instalada con autenticación inválida. Tres repositorios públicos ajenos al proyecto; no se requiere preservar dependencias de esos repositorios porque no se modificarán. No se encontraron archivos de aplicación previos en la nueva carpeta. Cache de dependencias dentro del área de trabajo, no en carpetas personales externas. No se necesita API privada, base de datos remota ni secretos para la fase inicial.

## Stack y decisiones

- React + TypeScript: componentes y formularios accesibles, tipos estrictos para impedir campos implícitos.
- Vite: desarrollo y compilación estática. Base relativa para soportar subcarpetas como GitHub Pages.
- Zod: validación del catálogo externo antes de mostrarlo; la interfaz recibe tipos derivados del esquema.
- Vitest: integridad de fuentes, casos negativos y filtros. React DOM Server sirve para una prueba básica de render sin instalar un navegador.
- CSS propio: diseño responsive y movimiento reducido. Sin CDN, fuentes remotas ni rastreadores.
- JSON versionado: primer repositorio de contenido. Datos separados de componentes, importador revisado separado de publicación.

Se consultaron [Vite](https://vite.dev/guide/), [TypeScript](https://www.typescriptlang.org/tsconfig/strict.html), [React](https://react.dev/learn) y [Vitest](https://vitest.dev/guide/). Las versiones efectivas se fijan en package.json y package-lock.json al instalar; CI utiliza npm ci.

No se añaden lenguajes por cantidad: TypeScript, HTML, CSS y JSON resuelven esta fase. Backend y SQL se introducen cuando haya contribuciones, cuentas o consultas que lo requieran. No se necesitan SSR ni login para consultar el catálogo inicial; se prevé generación estática de rutas para SEO en una fase posterior.

## Capas y carpetas

```text
.github/workflows/ci.yml   comprobación de tipos, tests, build; sin deploy automático
docs/                     investigación, arquitectura, modelo, fases, verificación
src/
  app/                    entrada y composición
  components/             presentación y accesibilidad
  domain/                 esquemas, filtros, política de evidencia
  data/                   catálogo, fuentes y tareas de verificación
  styles/                 estilos y movimiento reducido
tests/                    casos de dominio y render básico
public/                   assets aprobados (futuro)
scripts/                  mantenimiento de contenido (cuando corresponda)
```

UI → consultas de dominio → catálogo validado. Los componentes no importan capturas HTML ni dependen del formato de scraping. Una futura API implementará la misma interfaz de consultas. Los identificadores no dependen de traducciones.

## Mapas futuros

Un adaptador por mapa/piso administra imagen autorizada, tamaño, escala, origen, versión y transformación. Las posiciones se normalizan a 0–1 sobre un asset identificado; tienen mapa, piso, condición, precisión y evidencia. Solo un marcador con coordenada y calibración aprobadas puede renderizarse. Imagen desconocida → estado vacío y enlaces a evidencia, nunca un mapa geográfico inventado.

Primer visor: SVG o canvas sobre imagen, zoom, desplazamiento, filtros y equivalente textual accesible. MapLibre solo si el volumen de tiles lo justifica. Animaciones CSS para hover/selección; respetar prefers-reduced-motion. Zonas ARC: primero diagramas aprobados; 3D/Three.js únicamente con modelos autorizados y beneficios claros. Radios de granadas requieren escala y tipo de efecto; sin curva de daño no existe simulación exacta.

## Escalabilidad y operaciones

Contenido dividido por entidad para edición; artefacto de lectura consolidado y validado al construir. Más adelante índices de búsqueda y carga diferida por mapa. Cuando los datos superen el tamaño razonable de bundle, mover a JSON estático por categoría o API con caché; no hay necesidad inicial de microservicios. Para contribuciones: PostgreSQL, migraciones, cola de revisión y permisos de editor; registro de fuente y estado en cada cambio.

Actualización por PR: fuente nueva → comparación de revisiones → afirmaciones candidatas → revisión → validación → publicación. Una noticia no cambia automáticamente disponibilidad. No se infiere independencia cuando varias webs copian la misma wiki.

## Seguridad y distribución

Todo VITE_* es público: .env.example contiene solo nombre del sitio, nunca tokens. React escapa texto; enlaces de fuente restringidos a HTTPS; no se ejecuta HTML remoto. Sin autenticación o datos personales en la base. CI usa permisos contents: read. La creación del repo remoto no requiere tocar los repositorios existentes. El despliegue público se prepara en una fase posterior cuando el usuario pueda revisar datos y comportamiento completos.
