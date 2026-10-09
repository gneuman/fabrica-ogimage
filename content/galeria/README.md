# content/galeria/

Un JSON por sitio de la galería de inspiración; su imagen va en
`public/galeria/img/<slug>.jpg` (y `<slug>-600.jpg`). No se escriben a mano:

```bash
npm run galeria:agregar -- https://empresa.com saas marketing
```

| Campo | Qué es |
|---|---|
| `slug` | El dominio en minúsculas con guiones (`ahrefs-com`). Es el nombre del archivo. |
| `nombre`, `dominio`, `url` | Del sitio. |
| `categorias` | De `scripts/categorias.mjs`: ia, saas, productividad, finanzas, marketing, desarrollo, diseno, agencias, tiendas, medios (u `otros`). |
| `etiquetas` | Libres, en inglés; de ellas salen las categorías. |
| `descripcion` | Una o dos frases. |
| `color` | Color dominante de la imagen (lo calcula el script). |
| `fuente`, `agregado` | De dónde vino y la fecha (AAAA-MM-DD). |
