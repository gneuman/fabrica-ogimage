# scripts/

| Script | Cómo se corre | Qué hace |
|---|---|---|
| `recursos.mjs` | parte de `npm run build` | Copia emoji (Twemoji), íconos (Lucide) y fuentes a `public/_recursos/`. |
| `catalogo.mjs` | parte de `npm run build` | Escribe `PLANTILLAS.md` desde `motor/plantillas.js`. |
| `probar.mjs` | `npm run probar -- <plantilla> [campo=valor…] [--salida carpeta]` | Dibuja una plantilla en los cinco tamaños en `local/hechas/AAAA-MM-DD-<plantilla>-<nombre>/` (o `--salida`, p. ej. el `public/og` de otro proyecto; `--nombre` para elegir el nombre). Las fotos pueden ser archivos locales (`foto=local/inbox/ana.png`). |
| `sinfondo.py` | `npm run sinfondo -- foto.png` | Quita el fondo de una foto de persona → `foto-sinfondo.png`. Necesita `pip install "rembg[cpu]"`. |
| `galeria-agregar.mjs` | `npm run galeria:agregar -- https://empresa.com saas marketing` | Suma un sitio a la galería: baja su `og:image` y escribe su JSON. `--imagen ./og.png` para imagen local, `--force` para reemplazar. |
| `galeria.mjs`, `categorias.mjs` | (los importan los demás) | Categorías en español y cómo se guarda una imagen de galería (1200×630 JPG + miniatura de 600). |
