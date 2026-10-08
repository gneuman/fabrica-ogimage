# fabrica-ogimage

Imágenes Open Graph en español. Pones una URL en tu `og:image` y sale la imagen:

```html
<meta property="og:image" content="https://<dominio>/og/articulo?titulo=Mi%20post&autor=Ana" />
```

9 plantillas: marca, artículo, titular, emoji, ícono, perfil, botón, captura y teléfono.
Se dibujan con [Satori](https://github.com/vercel/satori) y
[resvg](https://github.com/yisibl/resvg-js) en un Worker de Cloudflare, y cada
URL se guarda en caché un año.

Inspirado en [ogimage.org](https://github.com/Illyism/ogimage) (MIT, Ilias Ism).
