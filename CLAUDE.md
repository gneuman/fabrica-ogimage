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

## Hacer una imagen (siempre así)
1. Lo que pasa el usuario (fotos, logos, referencias) se guarda en `local/inbox/`.
2. Fotos de personas: `npm run sinfondo -- local/inbox/<archivo>` (sin preguntar).
3. Elegir plantilla en `PLANTILLAS.md` y generar: `npm run probar -- <plantilla> campo=valor… foto=local/inbox/<archivo>-sinfondo.png`.
   Sale en `local/hechas/AAAA-MM-DD-<plantilla>-<nombre>/`, los cinco tamaños; lo usado del inbox se mueve ahí.
4. Revisar a ojo y entregar. Lo que quede en `local/inbox/` sin usar se borra.
5. `local/inbox/` y `local/hechas/` existen en git vacías; su contenido nunca se sube (repo público).

## Reglas
1. Una plantilla = una entrada en `motor/plantillas.js`. Para elegir una: `PLANTILLAS.md` (generado); para hacer una: `motor/README.md`. El motor (`motor/`) es el mismo para el Worker, el comando (`bin/`) y el build.
2. Satori fijo en 0.32: desde 0.33 trae harfbuzz, que no corre en Workers.
3. Cero JS en el navegador salvo el editor de plantillas (que dibuja con el mismo motor).
4. Toda URL interna termina en `/`.
5. Toda plantilla nueva o cambiada se diseña y se revisa en los cinco tamaños de `FORMATOS` (og, cuadrado, vertical, horizontal, historia), no solo en el de la referencia: `npm run probar -- <plantilla>`.
6. Repo público: aquí vive la herramienta, no las imágenes. Todo lo del usuario vive en `local/` (fuera de git), siempre en orden: lo que llega (fotos, referencias) va a `local/inbox/`, que es de paso: lo que se usa se mueve a su carpeta de `hechas/` (lo hace `probar`) y lo que no se usa se borra, no se guarda nada que no sirva; lo que se genera sale en `local/hechas/AAAA-MM-DD-<plantilla>-<nombre>/` (lo hace `npm run probar`). Nunca en un commit. Toda foto de persona se usa sin fondo, siempre y sin preguntar: `npm run sinfondo -- local/inbox/foto.png` y luego `npm run probar -- <plantilla> foto=local/inbox/foto-sinfondo.png`.
7. Commits en español: `<verbo>: <qué>`. Antes de push: `npm run build` y `npm run check` salen 0.
