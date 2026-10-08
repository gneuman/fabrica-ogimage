// @ts-check
import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'

// El dominio se decide al publicar: va en la variable de build SITIO
// (Cloudflare: Settings → Build → Variables). Sin ella, canonical y sitemap
// salen con el subdominio de workers.dev.
export default defineConfig({
  site: process.env.SITIO ?? 'https://fabrica-ogimage.gneuman.workers.dev',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [sitemap({ filter: (url) => !/\/(gracias|correo-no-valido|formulario-error)\/$/.test(url) })],
  vite: { plugins: [tailwindcss()] },
})
