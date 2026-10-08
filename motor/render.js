// De parámetros a PNG: limpia lo que llega por URL, carga fotos, íconos y
// emoji, dibuja con Satori y pasa a PNG con resvg. No sabe dónde corre: quien
// lo llama (Worker, comando o build) le da las fuentes, el wasm de resvg y una
// forma de leer recursos.
import satori, { init as iniciarYoga } from 'satori/standalone'
import { Resvg, initWasm } from '@resvg/resvg-wasm'
import { ANCHO, ALTO, PLANTILLAS } from './plantillas.js'

const MARCA = { fondo: '#0f1733', texto: '#f7f6f2', acento: '#e2553d' }
const LARGO = { titulo: 140, sub: 160, extracto: 220, autor: 60, sitio: 60, boton: 40, emoji: 16, icono: 40 }

const hex = (v, def) => {
  const s = String(v ?? '').trim().replace(/^#/, '')
  return /^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s) ? `#${s}` : def
}
const luz = (c) => {
  const s = c.slice(1).length === 3 ? c.slice(1).replace(/./g, '$&$&') : c.slice(1)
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16) / 255)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const cortar = (s, max) => (s.length > max ? s.slice(0, max - 1).replace(/\s+\S*$/, '') + '…' : s)

/** Los parámetros de la URL, recortados y con los colores de la marca por defecto. */
export function normalizar(slug, entrada = {}) {
  const pl = PLANTILLAS[slug]
  const leer = (k) => String(entrada[k] ?? '').trim()
  const p = {}
  for (const k of pl.campos) {
    if (k in MARCA) continue
    const v = leer(k)
    // URL completa, o ruta del propio sitio ("/muestras/captura.png").
    if (k === 'foto' || k === 'imagen') p[k] = /^(https?:\/\/|\/[^/])/.test(v) ? v : ''
    else p[k] = cortar(v, LARGO[k] ?? 120)
  }
  p.fondo = hex(entrada.fondo, MARCA.fondo)
  p.texto = hex(entrada.texto, luz(p.fondo) > 0.6 ? '#0f1733' : MARCA.texto)
  p.acento = hex(entrada.acento, MARCA.acento)
  p.suave = luz(p.fondo) > 0.6 ? '#4b5563' : '#c5d5f8'
  p.sobreAcento = luz(p.acento) > 0.6 ? '#0f1733' : '#ffffff'
  if (!p.titulo && pl.campos.includes('titulo')) p.titulo = pl.ejemplo.titulo
  return p
}

/** Emoji → nombre de archivo de Twemoji ("🚀" → "1f680"). */
export function codigoEmoji(segmento) {
  return [...segmento].map((c) => c.codePointAt(0).toString(16)).join('-')
}

const aDataUri = (tipo, bytes) => {
  let bin = ''
  const arr = new Uint8Array(bytes)
  for (let i = 0; i < arr.length; i += 0x8000) bin += String.fromCharCode(...arr.subarray(i, i + 0x8000))
  return `data:${tipo};base64,${btoa(bin)}`
}

/**
 * recursos: {
 *   fuentes: [{ name, data, weight }],
 *   leer(ruta) → Promise<string|null>  // 'emoji/1f680.svg', 'iconos/rocket.svg'
 *   bajar(url) → Promise<{ tipo, bytes }|null>  // fotos y capturas
 * }
 */
export async function generarSvg(slug, entrada, recursos) {
  const pl = PLANTILLAS[slug]
  if (!pl) throw new Error(`No existe la plantilla "${slug}"`)
  const p = normalizar(slug, entrada)

  // Fotos y capturas: se bajan antes para que una URL rota dé la plantilla sin
  // imagen, no un error.
  for (const k of ['foto', 'imagen']) {
    if (!p[k]) continue
    const r = await recursos.bajar(p[k]).catch(() => null)
    p[k] = r && /^image\/(png|jpe?g|gif|webp|svg\+xml)/.test(r.tipo) ? aDataUri(r.tipo, r.bytes) : ''
  }
  if (p.icono !== undefined) {
    const nombre = (p.icono || 'sparkles').toLowerCase().replace(/[^a-z0-9-]/g, '')
    const svg = (await recursos.leer(`iconos/${nombre}.svg`)) ?? (await recursos.leer('iconos/sparkles.svg'))
    p.iconoSvg = svg ? aDataUri('image/svg+xml', new TextEncoder().encode(svg.replaceAll('currentColor', p.sobreAcento))) : ''
  }

  return satori(pl.dibujar(p), {
    width: ANCHO,
    height: ALTO,
    fonts: recursos.fuentes,
    loadAdditionalAsset: async (tipo, segmento) => {
      if (tipo !== 'emoji') return []
      const cod = codigoEmoji(segmento)
      const svg = (await recursos.leer(`emoji/${cod}.svg`)) ?? (await recursos.leer(`emoji/${cod.replace(/-fe0f/g, '')}.svg`))
      return svg ? aDataUri('image/svg+xml', new TextEncoder().encode(svg)) : []
    },
  })
}

let listo
/**
 * Una sola vez por proceso o isolate. Recibe los dos wasm (módulo o bytes):
 * resvg (@resvg/resvg-wasm/index_bg.wasm) y yoga (satori/yoga.wasm).
 */
export const iniciar = (resvgWasm, yogaWasm) => (listo ??= Promise.all([initWasm(resvgWasm), iniciarYoga(yogaWasm)]))

export async function generarPng(slug, entrada, recursos, { escala = 1 } = {}) {
  const svg = await generarSvg(slug, entrada, recursos)
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: ANCHO * escala }, font: { loadSystemFonts: false } })
  return resvg.render().asPng()
}
