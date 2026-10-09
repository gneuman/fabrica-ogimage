# scripts/

| Script | Cómo se corre | Qué hace |
|---|---|---|
| `recursos.mjs` | parte de `npm run build` | Copia emoji (Twemoji), íconos (Lucide) y fuentes a `public/_recursos/`. |
| `catalogo.mjs` | parte de `npm run build` | Escribe `PLANTILLAS.md` desde `motor/plantillas.js`. |
| `probar.mjs` | `npm run probar -- <plantilla> [campo=valor…]` | Dibuja una plantilla en los cinco tamaños en `.probar/`. Para una foto local, cópiala a `public/` y pásala como `foto=/archivo.png`. |
| `galeria-agregar.mjs` | `npm run galeria:agregar -- https://empresa.com saas marketing` | Suma un sitio a la galería: baja su `og:image` y escribe su JSON. `--imagen ./og.png` para imagen local, `--force` para reemplazar. |
| `galeria.mjs`, `categorias.mjs` | (los importan los demás) | Categorías en español y cómo se guarda una imagen de galería (1200×630 JPG + miniatura de 600). |
