# BMW STORE - Tienda de prendas BMW y AUDI

Proyecto demo de tienda online con formulario de reservas y catálogo responsive. Diseño inspirado en tiendas BMW y AUDI, usando todos los archivos `.png` como productos.

Características:
- Catálogo de productos creado directamente desde todos los archivos `.png` en `src/images/`.
- Filtros por marca BMW / AUDI y miniaturas de color en cada tarjeta.
- Precio fijo: 130.000 $COP por producto.
- Formulario de reserva renovado y responsive, lista para integrar con Supabase/Wompi.
- Responsive para móvil y escritorio.
- Interfaz moderna con animaciones CSS.

Archivos principales:
- [index.html](index.html) - Vista principal.
- [src/css/style.css](src/css/style.css) - Estilos.
- [src/js/app.js](src/js/app.js) - Lógica del catálogo y reservas.
- [data/products.json](data/products.json) - Catálogo de ejemplo con rutas directas a archivos PNG.

Cómo probar localmente:
1. Abre un terminal en la carpeta del proyecto.
2. Si tienes Python instalado, ejecuta un servidor estático (recomendado) para evitar problemas de CORS:

```bash
python -m http.server 5500
```

3. Abre en el navegador: `http://localhost:5500`.

Conectar Supabase / NEON / Wompi:
- El formulario actualmente guarda en `localStorage`. Para integrar Supabase (o Neon) y Wompi más adelante:
  - En `src/js/app.js` sustituir la parte que guarda en localStorage por una llamada a tu API o al cliente de Supabase.
  - Para pagos con Wompi, genera el link de pago desde tu backend y devuélvelo al frontend.

Siguientes pasos que puedo hacer por ti:
- Conectar la tabla de reservas a Supabase (crear esquema SQL y ejemplo de uso).
- Añadir integración con Wompi para generar link de pago desde backend.
- Subir fotos reales y mejorar variantes de color.
