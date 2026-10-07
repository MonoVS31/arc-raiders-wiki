# Edición 2.0: wiki integrada y diseño propio

La portada toma como referencia la organización por categorías de arcraiders.wiki, con composición, iconos, identidad y estilos propios. Incluye menú lateral, búsqueda global, galerías visuales, artículos con índice y paneles de lectura. Las animaciones CSS abarcan entrada escalonada de tarjetas, iluminación al pasar el cursor, movimiento del fondo y referencias visuales. Se desactivan con movimiento reducido.

## Información dentro del sitio

La navegación utiliza estado de React e historial del navegador. Los vínculos entre planos, proyectos, materiales, ARC y mapas abren la vista correspondiente en ARC Atlas. Se preservan enlaces directos y los botones Atrás y Adelante. Los paneles tienen cierre accesible y retorno a la lectura anterior.

Las fuentes dejaron de ser la navegación principal del artículo. El botón Evidencia abre metadatos dentro del sitio, con enlaces originales en un desplegable opcional. El contenido conocido se muestra antes de consultar referencias. Se mantiene la atribución del proveedor y de Embark.

El archivo local incorpora 123 expedientes de fabricación: 24 armas, 15 granadas, 83 objetos desbloqueados por planos y un contenedor. Las tablas disponibles incluyen recetas, mejoras, reparaciones y reciclaje; no se añade una tabla cuando la fuente no la contiene. Los datos se cargan por categoría desde `public/data/dossiers`, sin llamadas a la API del proveedor durante la visita.

Las seis misiones vinculadas a planos incorporan objetivos en español y datos de contacto/mapa dentro del artículo. Se excluyó el diálogo narrativo. Los objetivos de actividad de proyectos se añadieron a sus etapas. La separación entre recompensas de objetos fabricados y planos se mantiene.

El catálogo local de materiales tiene 281 entradas de recursos, llaves, objetos de misión y munición del proveedor. Se guardan identidad, tipo, rareza, icono, área reportada y valor publicado; se excluyen estadísticas de relleno con cero. Los valores ausentes o ambiguos siguen sin confirmar. No se presentan todas las entradas del proveedor como disponibles en el juego.

## Validación

47 pruebas, TypeScript estricto y compilación de producción. Se comprobaron portada, menú y retorno al inicio en móvil; búsqueda Hullcracker, objetivos locales y paso a Dam conservando el plano; fabricación Kettle, panel Metal Parts y referencias opcionales. La anchura móvil de 390 px no produce desbordamiento horizontal.

Las capturas y respaldos permanecen en Arc. Los datos comunitarios siguen sujetos a revisión: alojarlos dentro de la wiki no los convierte en oficiales ni garantiza aparición del botín. Las imágenes del proveedor se muestran dentro de la página con atribución; su disponibilidad remota puede variar.
