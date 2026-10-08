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

## La API de imágenes

`GET /og/<plantilla>?<parámetros>` devuelve un PNG de 1200×630. Los parámetros de cada
plantilla están en `/usar/` y en `motor/plantillas.js` (`CAMPOS`). Respuesta:
`Cache-Control: public, max-age=31536000, immutable` y `Access-Control-Allow-Origin: *`.

### País y ciudad (plantilla `ciudad`)

| Parámetro | Si viene | Si no viene |
|---|---|---|
| `pais` | Código ISO de 2 letras (`MX`). Bandera y nombre en español | `request.cf.country` de Cloudflare |
| `ciudad` | Texto tal cual | `request.cf.city` (puede faltar) |
| `titulo`, `sub` | Aceptan `{ciudad}` y `{pais}` | |
| `imagen` | Foto de fondo con velo | Degradado, o foto de Unsplash si hay `UNSPLASH_KEY` |

- Con ubicación detectada, la caché se guarda por `país/ciudad` y la respuesta sale con
  `Cache-Control: private, max-age=3600` y `Vary: CF-IPCountry`.
- En un `og:image` la imagen la pide el servidor de la red social (casi siempre en EE. UU.),
  no el lector: ahí se fijan `ciudad` y `pais`. La detección sirve para imágenes que carga la persona.

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
- Sitio, editor, galería y comando funcionan en el plan gratis (son estáticos).
- La API `/og/*` necesita **Workers Paid** (5 USD/mes): cada imagen usa de 20 a 500 ms de CPU y el
  plan gratis da 10 ms por petición. Sin pagar, esas peticiones fallan.
- La captura de correo va al webhook de n8n del newsletter de gabrielneuman.com.
- Opcional: secreto `UNSPLASH_KEY` (`wrangler secret put UNSPLASH_KEY`) para que la plantilla ciudad lleve foto de fondo.

## Créditos

Emoji de Twemoji (CC-BY 4.0), íconos de Lucide (ISC). Licencia: MIT (ver LICENSE).
