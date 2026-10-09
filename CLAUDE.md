# fabrica-ogimage

Imágenes Open Graph en español: plantillas por URL (`/og/<plantilla>?titulo=…`),
galería de inspiración y un comando para generarlas en el build de otros
proyectos. Marca: Gabriel Neuman. Familia `gnb`: voz, cifras y decisiones en
`gneuman/gnb-meta` (gana sobre este archivo).

## Cómo corre
- `npm run build`: copia emoji e íconos, dibuja las muestras y construye el sitio (Astro).
- `npm run preview`: build + `wrangler dev` (sitio y Worker juntos en :8787).
- Cloudflare Workers: `dist/` estático; el Worker (`worker/index.js`) atiende `/og/*` (la API, necesita Workers Paid) y `/api/ubicacion/`.
- El sitio público corre gratis con `API_OG=off`: el editor dibuja en el navegador (`motor/navegador.js`) y las OG del sitio salen en el build. La API es para quien monta su copia.

## Reglas
1. Una plantilla = una entrada en `motor/plantillas.js`. Para elegir una: `PLANTILLAS.md` (generado); para hacer una: `motor/README.md`. El motor (`motor/`) es el mismo para el Worker, el comando (`bin/`) y el build.
2. Satori fijo en 0.32: desde 0.33 trae harfbuzz, que no corre en Workers.
3. Cero JS en el navegador salvo el editor de plantillas (que dibuja con el mismo motor).
4. Toda URL interna termina en `/`.
5. Toda plantilla nueva o cambiada se diseña y se revisa en los cinco tamaños de `FORMATOS` (og, cuadrado, vertical, horizontal, historia), no solo en el de la referencia: `npm run probar -- <plantilla>`.
6. Commits en español: `<verbo>: <qué>`. Antes de push: `npm run build` y `npm run check` salen 0.
