# Reglas para agentes en ARC Atlas
- Al terminar cada tarea, `npm run typecheck`, `npm test` y `npm run build` deben pasar.
- Un commit por fase, con mensaje claro en español.
- No cambiar el contenido ni la semántica de los datos: niveles de evidencia (confirmado / probable / posible / no confirmado), disponibilidad (disponible / anunciado / histórico / desconocido), fuentes y notas deben quedar idénticos.
- No romper las URLs existentes (?category=, ?entity=, ?blueprint=, ?arc=) ni el `base: './'` de Vite (lo necesita GitHub Pages).
- Todo texto de interfaz en español rioplatense.
- Todo lo nuevo debe respetar `prefers-reduced-motion` (sin animaciones si está activo).
- Si un test falla por un cambio de estructura (no de comportamiento), actualizarlo. Si cambia el comportamiento, preguntar antes.
- Al final de cada fase, resumir en pocas líneas qué cambió y qué quedó pendiente.
