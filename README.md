# fabrica-ogimage

Imágenes Open Graph en español: la imagen que sale cuando compartes un link en
WhatsApp, LinkedIn o X. Tres formas de usarla, con las mismas plantillas:

> **La hice yo, [Gabriel Neuman](https://www.gabrielneuman.com/).** Soy director de IA fraccional:
> dirijo, no construyo. Yo decidí qué debía hacer y cómo verse; el código lo escribieron mis agentes
> de IA. Es abierta para que la uses, la copies y la cambies. Cómo la hice:
> [el post](https://www.gabrielneuman.com/fabrica-ogimage-imagenes-og-en-espanol/).

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/gneuman/fabrica-ogimage)

1. **En el editor del sitio.** Armas la imagen y descargas el PNG. Se dibuja en el navegador.
2. **En el build de tu sitio (recomendado).** Una imagen por página, sin servidor. Ver abajo.
3. **Por URL, en tu servidor.** Montas tu copia (VPS con Docker, Node, Render/Railway/Fly o el botón de
   Cloudflare de arriba) y pones la dirección en tu `og:image`:
   ```html
   <meta property="og:image" content="https://<dominio>/og/articulo?titulo=Mi%20post&autor=Ana" />
   ```
**En el build** lee el `<title>` de cada página y dibuja su imagen:
   ```bash
   npm i -D github:gneuman/fabrica-ogimage
   npx fabrica-ogimage dist --url https://misitio.com --plantilla articulo --marca "Mi Empresa"
   ```
En Astro, como integración: `import fabricaOg from 'fabrica-ogimage/astro'`.

**Tu propio servidor**, con Docker (en un VPS, Render, Railway o Fly):
   ```bash
   docker build -t fabrica-og .
   docker run -d --restart unless-stopped -p 3000:3000 -v fabrica-og-cache:/app/.cache fabrica-og
   ```
   o con Node 22, sin Docker: `npx -p github:gneuman/fabrica-ogimage fabrica-ogimage-servidor`.
   Variables: `PORT` (3000), `CACHE_DIR` (`.cache/og`), `CACHE_MAX_MB` (500).
   Yo uso un VPS de [Hostinger](https://gnb.mx/HostingerHub) (link de afiliado: si contratas por ahí gano
   una comisión, sin costo extra para ti).

32 plantillas en 5 tamaños (link, cuadrado, vertical 4:5, horizontal e historia: `?formato=vertical`): marca, artículo, titular, emoji, ícono, perfil, botón, captura, teléfono, ciudad
(detecta la ubicación de quien pide la imagen), cita, cifra, versus, evento, duelo, cohort, miniatura, escaparate, tweet, ruta, lista, podcast, entrevista, ceoagentico, ceoportada, ceopromo, alianza, caja, recibo, contactos, equipo y precio.
Qué hace cada una, sus campos y una URL de ejemplo: [`PLANTILLAS.md`](PLANTILLAS.md). Cómo hacer una nueva: [`motor/README.md`](motor/README.md).
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
| Servidor Node (Docker, VPS) con caché en disco | `servidor/node.js`, `Dockerfile` |
| Comando y integración de Astro | `bin/`, `motor/build.js`, `motor/astro.js` |
| Galería: un JSON por sitio + su imagen | `content/galeria/`, `public/galeria/img/` |
| Sitio (Astro, estático) | `src/` |

Cada carpeta tiene su `README.md` con cómo se corre y qué se puede cambiar.

```bash
npm run build                      # emoji, íconos, muestras y sitio
npm run preview                    # sitio + Worker en http://localhost:8787
npm run probar -- alianza          # una plantilla en los cinco tamaños, en local/hechas/
npm run galeria:agregar -- https://empresa.com saas marketing
```

## Publicar (Cloudflare Workers)

- En Workers Builds: **Build command** `npm run build` (sin él no existe `dist` y el deploy
  falla) y **Deploy command** `npx wrangler deploy`. Tarda unos 6 minutos: dibuja las muestras
  en los cinco tamaños. Variable de build `SITIO` con el dominio final.
- **Solo sitio, gratis** (por defecto, `API_OG=off` en `wrangler.jsonc`): el editor dibuja en el
  navegador, las OG del sitio salen en el build y `/og/*` responde 404. `/api/ubicacion/` (país y
  ciudad para el editor) sigue funcionando. Así corre el sitio público.
- **Con la API:** cambia a `"API_OG": "on"` en `wrangler.jsonc` (el archivo gana sobre el
  dashboard en cada deploy). Necesita **Workers Paid** (5 USD/mes): cada imagen usa de 20 a
  500 ms de CPU y el plan gratis da 10 ms por petición.
- La captura de correo va al webhook de n8n del newsletter de gabrielneuman.com.
- Opcional: secreto `UNSPLASH_KEY` (`wrangler secret put UNSPLASH_KEY`) para que la plantilla ciudad lleve foto de fondo.

## Que te traiga oportunidades

Una buena imagen OG hace que la gente abra tu link. Tres formas de sacarle más:

1. **Sal en la galería.** Cada empresa tiene su página en el sitio, con un link a su dominio.
   Abre un PR con `npm run galeria:agregar -- https://tuempresa.com <categoría>` (las
   categorías están en `scripts/categorias.mjs`) y la reviso.
2. **Publica tu copia con tu marca.** Cambia `--marca` y los colores (`fondo`, `texto`,
   `acento`) y cada página que compartas lleva tu nombre. Si la montas, cuéntame dónde:
   me gusta ver cómo la usa cada quien.
3. **Haz una plantilla y compártela.** Una plantilla nueva es una entrada en
   `motor/plantillas.js` ([cómo](motor/README.md)). Si sirve a más gente, mándala por PR:
   sale en el sitio con tu nombre en el commit.

¿Quieres que tu equipo trabaje así, con agentes de IA que hacen el trabajo mientras tú
diriges? Escríbeme desde [gabrielneuman.com](https://www.gabrielneuman.com/). Y si quieres
enterarte de lo nuevo, suscríbete a [El CEO agéntico](https://www.gabrielneuman.com/), mi newsletter.

## Créditos

Emoji de Twemoji (CC-BY 4.0), íconos de Lucide (ISC). Licencia: MIT (ver LICENSE).
