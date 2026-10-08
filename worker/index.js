// El Worker: solo atiende /og/<plantilla> (run_worker_first en wrangler.jsonc).
// Todo lo demás es el sitio estático de dist/, que se sirve sin pasar por aquí.
//
// Cada combinación de parámetros da siempre la misma imagen, así que se guarda
// en la caché de Cloudflare por un año: la plantilla se dibuja una sola vez por
// URL, no en cada visita de un bot de redes.
import resvgWasm from '@resvg/resvg-wasm/index_bg.wasm'
import yogaWasm from 'satori/yoga.wasm'
import inter700 from '../motor/fuentes/inter-700.woff'
import inter500 from '../motor/fuentes/inter-500.woff'
import { generarPng, iniciar } from '../motor/render.js'
import { PLANTILLAS } from '../motor/plantillas.js'

const fuentes = [
  { name: 'Inter', data: inter700, weight: 700 },
  { name: 'Inter', data: inter500, weight: 500 },
]
const MAX_IMAGEN = 5 * 1024 * 1024

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const slug = url.pathname.match(/^\/og\/([a-z]+)(?:\.png)?\/?$/)?.[1]
    if (!slug || !PLANTILLAS[slug]) return env.ASSETS.fetch(request)
    if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Solo GET', { status: 405 })

    const cache = caches.default
    const guardada = await cache.match(request)
    if (guardada) return guardada

    const recursos = {
      fuentes,
      // Emoji e íconos viven en dist/_recursos/ (los copia scripts/recursos.mjs).
      leer: async (ruta) => {
        const r = await env.ASSETS.fetch(new URL(`/_recursos/${ruta}`, url))
        return r.ok ? r.text() : null
      },
      bajar: async (direccion) => {
        const r = direccion.startsWith('/')
          ? await env.ASSETS.fetch(new URL(direccion, url))
          : await fetch(direccion, { signal: AbortSignal.timeout(5000), cf: { cacheTtl: 86400 } })
        if (!r.ok || Number(r.headers.get('content-length') ?? 0) > MAX_IMAGEN) return null
        const bytes = new Uint8Array(await r.arrayBuffer())
        return bytes.length > MAX_IMAGEN ? null : { tipo: r.headers.get('content-type') ?? '', bytes }
      },
    }

    try {
      await iniciar(resvgWasm, yogaWasm)
      const png = await generarPng(slug, Object.fromEntries(url.searchParams), recursos)
      const respuesta = new Response(png, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Access-Control-Allow-Origin': '*',
        },
      })
      ctx.waitUntil(cache.put(request, respuesta.clone()))
      return respuesta
    } catch (e) {
      console.error(slug, url.search, e)
      return new Response('No se pudo generar la imagen', { status: 500 })
    }
  },
}
