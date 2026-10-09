# src/

El sitio (Astro, estático). Cero JS en el navegador salvo el editor de plantillas.

| Ruta | Página |
|---|---|
| `pages/index.astro` | Inicio. |
| `pages/plantillas/` | Lista de plantillas y un editor por plantilla (`[slug].astro`), que dibuja con `motor/navegador.js`. |
| `pages/galeria/` | Galería de inspiración: por sitio, por categoría y paginada. Lee `content/galeria/`. |
| `pages/usar.astro` | Documentación de la API y el comando. |
| `components/`, `layouts/`, `lib/`, `styles/` | Piezas compartidas. |

Una plantilla nueva no necesita tocar `src/`: sale sola en la lista, el editor y la galería
desde `motor/plantillas.js`. Toda URL interna termina en `/`.
