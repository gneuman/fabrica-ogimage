// Integración de Astro: dibuja las imágenes OG al terminar el build.
//
//   import fabricaOg from 'fabrica-ogimage/astro'
//   integrations: [fabricaOg({ plantilla: 'articulo', fijos: { autor: 'Ana', sitio: 'ana.mx' } })]
//
// Sin `url`, toma el `site` de astro.config.
import { fileURLToPath } from 'node:url'
import { generarParaDist } from './build.js'

export default function fabricaOg(opciones = {}) {
  let site
  return {
    name: 'fabrica-ogimage',
    hooks: {
      'astro:config:done': ({ config }) => { site = config.site },
      'astro:build:done': async ({ dir, logger }) => {
        await generarParaDist(fileURLToPath(dir), { url: site, ...opciones, log: (m) => logger.info(m) })
      },
    },
  }
}
