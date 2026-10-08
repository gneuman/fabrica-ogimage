// El motor en el navegador: lo usa el editor del sitio para dibujar la imagen
// sin pasar por el servidor. Baja los wasm, las fuentes, los emoji y los íconos
// de /_recursos/ (los copia scripts/recursos.mjs).
import { generarPng, iniciar } from './render.js'

let fuentes
const cargarFuentes = async () =>
  (fuentes ??= await Promise.all(
    [[700, 'inter-700.woff'], [500, 'inter-500.woff']].map(async ([weight, f]) => ({
      name: 'Inter',
      weight,
      data: await fetch(`/_recursos/fuentes/${f}`).then((r) => r.arrayBuffer()),
    })),
  ))

const recursos = {
  leer: async (ruta) => {
    const r = await fetch(`/_recursos/${ruta}`)
    return r.ok ? r.text() : null
  },
  // Fotos de otros dominios solo cargan si su servidor permite CORS; si no, la plantilla sale sin foto.
  bajar: async (url) => {
    const r = await fetch(url, { mode: 'cors' })
    return r.ok ? { tipo: r.headers.get('content-type') ?? '', bytes: new Uint8Array(await r.arrayBuffer()) } : null
  },
}

/** Devuelve un Blob PNG. `wasm`: { resvg, yoga } con las URLs de los dos .wasm. */
export async function pngNavegador(slug, entrada, wasm) {
  await iniciar(fetch(wasm.resvg), fetch(wasm.yoga).then((r) => r.arrayBuffer()))
  const png = await generarPng(slug, entrada, { ...recursos, fuentes: await cargarFuentes() })
  return new Blob([png], { type: 'image/png' })
}
