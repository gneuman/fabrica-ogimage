# fabrica-ogimage

Imágenes Open Graph en español: la imagen que sale cuando compartes un link en
WhatsApp, LinkedIn o X. Tres formas de usarla, con las mismas plantillas:

1. **Por URL.** Pones la dirección en tu `og:image` y cambias el texto ahí:
   ```html
   <meta property="og:image" content="https://<dominio>/og/articulo?titulo=Mi%20post&autor=Ana" />
   ```
2. **En el build de cualquier sitio estático.** Lee el `<title>` de cada página y dibuja su imagen:
   ```bash
   npm i -D github:gneuman/fabrica-ogimage
   npx fabrica-ogimage dist --url https://misitio.com --plantilla articulo --marca "Mi Empresa"
   ```
3. **Como integración de Astro:** `import fabricaOg from 'fabrica-ogimage/astro'`.

16 plantillas: marca, artículo, titular, emoji, ícono, perfil, botón, captura, teléfono, ciudad
(detecta la ubicación de quien pide la imagen), cita, cifra, versus, evento, lista y podcast.
El sitio trae un editor por plantilla, una galería de inspiración y la documentación (`/usar/`).

## Cómo está hecho

| Pieza | Dónde |
|---|---|
| Plantillas (una entrada cada una) | `motor/plantillas.js` |
| De parámetros a PNG (Satori 0.32 + resvg) | `motor/render.js` |
| Worker que sirve `/og/*` con caché de un año | `worker/index.js` |
| Comando y integración de Astro | `bin/`, `motor/build.js`, `motor/astro.js` |
| Galería: un JSON por sitio + su imagen | `content/galeria/`, `public/galeria/img/` |
| Sitio (Astro, estático) | `src/` |

```bash
npm run build                      # emoji, íconos, muestras y sitio
npm run preview                    # sitio + Worker en http://localhost:8787
npm run galeria:agregar -- https://empresa.com saas marketing
```

## Publicar (Cloudflare Workers)

- Build: `npm run build` · salida: `dist` · Node 22. Variable de build `SITIO` con el dominio final.
- Dibujar una imagen usa más CPU de la que da el plan gratis (10 ms): hace falta **Workers Paid**.
- La captura de correo va al webhook de n8n del newsletter de gabrielneuman.com.
- Opcional: secreto `UNSPLASH_KEY` (`wrangler secret put UNSPLASH_KEY`) para que la plantilla ciudad lleve foto de fondo.

## Créditos

Emoji de Twemoji (CC-BY 4.0), íconos de Lucide (ISC). Licencia: MIT (ver LICENSE).
