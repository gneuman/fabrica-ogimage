# motor/

El mismo código dibuja las imágenes en el Worker (`worker/`), el servidor Node
(`servidor/`), el comando (`bin/`), el build del sitio y el editor del navegador.

| Archivo | Qué hace |
|---|---|
| `plantillas.js` | Las plantillas (`PLANTILLAS`), los tamaños (`FORMATOS`) y qué es cada campo (`CAMPOS`). |
| `normalizar.js` | De la URL a parámetros limpios: recorta textos (`LARGO`), valida colores y URLs, fija `p.W`, `p.H`, `p.alto`. |
| `render.js` | Baja fotos, colorea íconos de Lucide y llama a Satori → SVG → PNG (resvg). |
| `node.js`, `navegador.js` | Fuentes y lectura de recursos en cada entorno. |
| `build.js`, `astro.js` | Generar las OG de un sitio ya construido. |

Para **usar** una plantilla: `PLANTILLAS.md` en la raíz (se genera en cada build).

## Hacer una plantilla nueva

1. **Una entrada en `PLANTILLAS`** (`plantillas.js`), con:
   - `nombre`, `descripcion` y `cuando` (una frase: en qué post se usa; es lo que lee un agente para elegirla).
   - `campos`: los que lee de la URL, de los de `CAMPOS`. Siempre al final `fondo`, `texto`, `acento`.
   - `ejemplo`: parámetros que la muestran bien; salen en la galería, el editor y `PLANTILLAS.md`.
   - Opcional `marca: { fondo, texto, acento }` para colores propios, y `ayuda: { campo: '…' }`
     cuando un campo genérico significa algo distinto aquí (p. ej. en `alianza`, `autor` es la segunda marca).
   - `dibujar(p)`: devuelve el árbol con `h(tipo, estilo, ...hijos)` e `img(src, estilo)`.
2. **Campo nuevo**: agrégalo a `CAMPOS` (etiqueta, tipo, ayuda) y su largo a `LARGO` en
   `normalizar.js`. Si es URL de imagen, súmalo a la lista de URLs en `normalizar.js` y a la
   descarga en `render.js`. Si trae íconos, se resuelven en `render.js` a data URI (ver `pilares`).
3. **Los cinco tamaños** (regla del repo). `p.W × p.H` es el lienzo, no el PNG: en los formatos
   altos se dibuja chico y se amplía. Usa `p.alto` para apilar lo que va lado a lado, y mide
   en proporción al lado corto (`const u = Math.min(p.W, p.H) / 680`, como `alianza`)
   en vez de píxeles fijos. Revisa a ojo:
   ```bash
   npm run probar -- <plantilla> [campo=valor …]   # deja local/hechas/<fecha>-<plantilla>-<nombre>/
   ```
4. `npm run build` y `npm run check` en 0 (el build también regenera `PLANTILLAS.md`), y actualiza
   la lista del `README.md`.

## Lo que Satori no hace (0.32)

- Todo `div` con más de un hijo necesita `display: flex`: `h()` ya lo pone.
- No parte líneas entre `span` distintos: para texto con *resaltado* usa `resaltar()`.
- Solo hay Inter 500/700, Lilita 400 y Mono 500 (`motor/fuentes/`). Sin 300 ni itálicas.
- Nada de `filter` ni `inset` en `boxShadow` (deja bandas). Los efectos finos (brillo, blur) van
  en un SVG propio pasado como `img` (ver `planeta()`), que resvg sí dibuja.
- Íconos: nombres de [lucide.dev](https://lucide.dev); emoji: Twemoji, automáticos en el texto.
