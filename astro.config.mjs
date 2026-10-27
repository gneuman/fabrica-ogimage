// @ts-check
import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import fabricaOg from './motor/astro.js'

// El dominio del sitio público (canonical, sitemap, robots y las OG). Quien
// monte su copia lo cambia con la variable de build SITIO
// (Cloudflare: Settings → Build → Variables).
const site = process.env.SITIO ?? 'https://og.gabrielneuman.com'

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
