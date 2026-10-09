# Visor original de armas entregado por el usuario

Se integra `armas-3d.html` en la raíz del repositorio a partir del archivo adjunto. SHA-256 del original: `8d122ff72c4e9cdc15790781d5ecc25c214087476cbc01d8839d789f4ffd38e0`. La única inserción autorizada es una barra de regreso a la wiki inmediatamente después de body. Una prueba elimina esa inserción y compara el hash completo del resto del archivo.

El build emite el HTML como un asset estático leyendo sus bytes, sin tratarlo como entrada de Vite. De este modo el documento publicado conserva el código, los estilos, modelos, valores de ejemplo y direcciones de las bibliotecas y fuentes externas originales. La base relativa de la wiki se mantiene.

La sección Armas incluye el enlace Armas en 3D. Las 24 fichas y tarjetas disponibles incluyen Ver en 3D con el código de ancla indicado por el usuario. Los enlaces resuelven desde la base de assets existente, incluidas las fichas estáticas profundas. El visor original ya lee location.hash al iniciar. No se modifican datos del catálogo ni otras categorías; no se agregan contenedores a tarjetas ajenas a los 24 códigos.

La página mantiene sus estadísticas de ejemplo y su aviso original. No se incorporan esos valores al catálogo factual de ARC Atlas. El funcionamiento interno y las dependencias externas se conservan por pedido expreso del usuario.
