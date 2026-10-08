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

    // Plantilla ciudad: lo que no venga en la URL se toma de la conexión de quien
    // pide la imagen. Ojo: en un og:image quien la pide es el servidor de la red
    // social, no la persona; sirve más en imágenes dentro de una página.
    const entrada = Object.fromEntries(url.searchParams)
    let porUbicacion = false
    if (slug === 'ciudad') {
      const cf = request.cf ?? {}
      if (!entrada.ciudad && cf.city) { entrada.ciudad = cf.city; porUbicacion = true }
      if (!entrada.pais && cf.country) { entrada.pais = cf.country; porUbicacion = true }
      if (!entrada.imagen && env.UNSPLASH_KEY && entrada.ciudad) entrada.imagen = await fotoDe(entrada.ciudad, env.UNSPLASH_KEY)
    }

    // La caché va por URL y, si la ubicación salió de la conexión, también por ubicación.
    const cache = caches.default
    const clave = porUbicacion ? new Request(`${url.href}${url.search ? '&' : '?'}_geo=${encodeURIComponent(`${entrada.pais}/${entrada.ciudad ?? ''}`)}`) : request
    const guardada = await cache.match(clave)
    if (guardada) return porUbicacion ? privada(guardada) : guardada

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
      const png = await generarPng(slug, entrada, recursos)
      const respuesta = new Response(png, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Access-Control-Allow-Origin': '*',
        },
      })
      ctx.waitUntil(cache.put(clave, respuesta.clone()))
      return porUbicacion ? privada(respuesta) : respuesta
    } catch (e) {
      console.error(slug, url.search, e)
      return new Response('No se pudo generar la imagen', { status: 500 })
    }
  },
}

/** La misma imagen, pero que ninguna caché intermedia la comparta entre ubicaciones. */
function privada(r) {
  const copia = new Response(r.body, r)
  copia.headers.set('Cache-Control', 'private, max-age=3600')
  copia.headers.set('Vary', 'CF-IPCountry')
  return copia
}

/** Foto horizontal de la ciudad en Unsplash (opcional: secreto UNSPLASH_KEY). */
async function fotoDe(ciudad, llave) {
  try {
    const q = new URLSearchParams({ query: ciudad, per_page: '1', orientation: 'landscape', content_filter: 'high' })
    const r = await fetch(`https://api.unsplash.com/search/photos?${q}`, { headers: { Authorization: `Client-ID ${llave}` }, cf: { cacheTtl: 604800 } })
    if (!r.ok) return ''
    const j = await r.json()
    return j?.results?.[0]?.urls?.regular ? `${j.results[0].urls.regular}&w=1200&h=630&fit=crop` : ''
  } catch {
    return ''
  }
}
