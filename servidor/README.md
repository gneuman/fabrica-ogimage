# servidor/

La API de imágenes en Node, para correrla fuera de Cloudflare (VPS, Docker,
Render, Railway, Fly). Mismo motor y mismas URLs que `worker/`.

```bash
npm run build            # copia íconos, emoji y fuentes que el motor lee
npm run servidor         # http://localhost:3000/og/marca/?titulo=Hola
docker build -t fabrica-ogimage . && docker run -p 3000:3000 fabrica-ogimage
```

| Variable | Por defecto | Qué hace |
|---|---|---|
| `PORT` | `3000` | Puerto. |
| `CACHE_DIR` | `.cache/og` | Cada URL se dibuja una vez y se guarda aquí. |
| `CACHE_MAX_MB` | `500` | Al pasarlo borra las más viejas hasta quedar en 80%. |

`/api/ubicacion/` solo sabe la ubicación detrás de Cloudflare (lee sus cabeceras).
