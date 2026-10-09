# bin/

El comando para generar las imágenes OG en el build de **otro** sitio. Lee cada
HTML de la carpeta de salida, toma su `<title>` y dibuja su imagen
(lógica en `motor/build.js`; para Astro también hay integración en `motor/astro.js`).

```bash
npx fabrica-ogimage dist --url https://misitio.com --plantilla articulo --marca "Mi Empresa" --autor "Ana López"
npx fabrica-ogimage --ayuda
```

- Con `--url`, a las páginas sin `og:image` se les agrega la etiqueta y la imagen va en `/og/<ruta>.png`.
- Si la página ya declara un `og:image` propio en `/og/…png`, se dibuja ahí.
- `--marca` quita ese texto del título ("Precios | Mi Empresa" → "Precios").
- `--autor --sitio --foto --fondo --texto --acento` van iguales en todas las imágenes.
- Plantillas y campos: `PLANTILLAS.md`.
