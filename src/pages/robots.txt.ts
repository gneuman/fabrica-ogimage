import type { APIRoute } from 'astro'

// /og/ queda abierto: las redes y Google necesitan leer las imágenes.
export const GET: APIRoute = ({ site }) =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL('sitemap-index.xml', site).href}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
