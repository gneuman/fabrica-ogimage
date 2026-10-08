// @ts-check
import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import fabricaOg from './motor/astro.js'

// El dominio se decide al publicar: va en la variable de build SITIO
// (Cloudflare: Settings → Build → Variables). Sin ella, canonical y sitemap
// salen con el subdominio de workers.dev.
const site = process.env.SITIO ?? 'https://fabrica-ogimage.gneuman.workers.dev'

export default defineConfig({
  site,
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [
    // Las OG de este sitio salen del mismo comando que usan otros proyectos.
    fabricaOg({ plantilla: 'marca', carpeta: '_og', marca: 'Fábrica OG', fijos: { sub: 'Fábrica de imágenes OG', autor: 'Gabriel Neuman', sitio: new URL(site).hostname } }),
    sitemap({ filter: (url) => !/\/(gracias|correo-no-valido|formulario-error)\/$/.test(url) }),
  ],
  vite: { plugins: [tailwindcss()] },
})
