# worker/

El Worker de Cloudflare. Solo atiende `/og/<plantilla>/` y `/api/ubicacion/`
(`run_worker_first` en `wrangler.jsonc`); el resto es el sitio estático de `dist/`.

| Ruta | Qué devuelve |
|---|---|
| `/og/<plantilla>/?…` | PNG de la plantilla. Parámetros: `PLANTILLAS.md`. Caché de Cloudflare por un año por URL. |
| `/api/ubicacion/` | `{ pais, region, ciudad }` de quien pide, desde `request.cf`. |

## Correrlo y publicarlo

```bash
npm run preview          # build + wrangler dev: sitio y Worker en http://localhost:8787
npx wrangler deploy      # publica (después de npm run build)
```

| Variable | Qué hace |
|---|---|
| `API_OG` | `on` dibuja en `/og/`. `off` responde 404 con instrucciones (así corre el sitio público, que dibuja en el navegador). |
| `UNSPLASH_KEY` (secreto) | Opcional: foto de fondo para la plantilla `ciudad`. `npx wrangler secret put UNSPLASH_KEY`. |

- Dibujar pasa de los 10 ms de CPU del plan gratis: `/og/` necesita Workers Paid.
- Satori se queda en 0.32 (desde 0.33 trae harfbuzz, que no corre en Workers).
- Las fuentes se importan como datos (`rules` en `wrangler.jsonc`); íconos y emoji se leen de `dist/_recursos/`.
- Sin Cloudflare: `servidor/` sirve las mismas URLs en Node.
