// De parámetros a PNG: limpia lo que llega por URL, carga fotos, íconos y
// emoji, dibuja con Satori y pasa a PNG con resvg. No sabe dónde corre: quien
// lo llama (Worker, comando o build) le da las fuentes, el wasm de resvg y una
// forma de leer recursos.
import satori, { init as iniciarYoga } from 'satori/standalone'
import { Resvg, initWasm } from '@resvg/resvg-wasm'
import { FORMATOS, PLANTILLAS, leerPunto } from './plantillas.js'
import { normalizar } from './normalizar.js'

export { normalizar }

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
  for (const k of ['foto', 'foto2', 'imagen', 'logo']) {
    if (!p[k]) continue
    const r = await recursos.bajar(p[k]).catch(() => null)
    p[k] = r && /^image\/(png|jpe?g|gif|webp|svg\+xml)/.test(r.tipo) ? aDataUri(r.tipo, r.bytes) : ''
  }
  if (slug === 'podcast') {
    const svg = await recursos.leer('iconos/mic.svg')
    p.micSvg = svg ? aDataUri('image/svg+xml', new TextEncoder().encode(svg.replaceAll('currentColor', p.acento))) : ''
  }
  // Pilares de alianza: "truck: Monitoreo de flotas | leaf: …", cada ícono en el color del texto.
  if (p.pilares !== undefined) {
    const pinta = (svg) => (svg ? aDataUri('image/svg+xml', new TextEncoder().encode(svg.replaceAll('currentColor', p.texto))) : '')
    p.pilares = await Promise.all(p.pilares.split(/\s*\|\s*/).filter(Boolean).map(async (t) => {
      const [, icono, texto] = t.match(/^([a-z0-9-]+)\s*:\s*(.+)$/i) ?? [null, 'sparkles', t]
      return { texto, svg: pinta((await recursos.leer(`iconos/${icono.toLowerCase()}.svg`)) ?? (await recursos.leer('iconos/sparkles.svg'))) }
    }))
    p.flechaSvg = pinta(await recursos.leer('iconos/arrow-right.svg'))
  }
  // Puntos con ícono (herramientas): "bot: Responde correos | calendar: …", cada ícono en el color de la plantilla.
  // Si el ícono es un slug de Simple Icons (claude, github, n8n…), va el logo de la marca en su color;
  // si ese color casi no se ve sobre el fondo del ícono, en el color del texto. Si no, Lucide; si no, sparkles.
  if (pl.puntosConIcono) {
    const datos = (svg) => aDataUri('image/svg+xml', new TextEncoder().encode(svg))
    const pinta = (svg) => (svg ? datos(svg.replaceAll('currentColor', pl.puntosConIcono)) : '')
    p.items = await Promise.all((p.puntos || '').split(/\s*\|\s*/).filter(Boolean).slice(0, 6).map(async (t) => {
      const { etiqueta, conNombre, slugs, texto } = leerPunto(t)
      for (const slug of slugs) {
        const marca = /^[a-z0-9]+$/.test(slug) ? await recursos.leer(`marcas/${slug}.svg`) : null
        if (!marca) continue
        const hex = marca.match(/fill="(#[0-9a-f]{6})"/i)?.[1]
        const svg = hex && contraste(hex, pl.fondoIcono ?? '#ffffff') < 2.2 ? marca.replace(`fill="${hex}"`, `fill="${p.texto}"`) : marca
        return { nombre: etiqueta, texto, marca: true, svg: datos(svg) }
      }
      let icono = null
      for (const slug of slugs) if ((icono = await recursos.leer(`iconos/${slug}.svg`))) break
      return { nombre: conNombre ? etiqueta : '', texto, svg: pinta(icono ?? (await recursos.leer('iconos/sparkles.svg'))) }
    }))
  }
  if (p.icono !== undefined) {
    const nombre = (p.icono || 'sparkles').toLowerCase().replace(/[^a-z0-9-]/g, '')
    const svg = (await recursos.leer(`iconos/${nombre}.svg`)) ?? (await recursos.leer('iconos/sparkles.svg'))
    p.iconoSvg = svg ? aDataUri('image/svg+xml', new TextEncoder().encode(svg.replaceAll('currentColor', pl.colorIcono ?? p.sobreAcento))) : ''
  }
  // El segundo ícono (escaparate) va oscuro sobre un mosaico blanco.
  if (p.icono2 !== undefined) {
    const nombre = (p.icono2 || 'github').toLowerCase().replace(/[^a-z0-9-]/g, '')
    const svg = (await recursos.leer(`iconos/${nombre}.svg`)) ?? (await recursos.leer('iconos/sparkles.svg'))
    p.icono2Svg = svg ? aDataUri('image/svg+xml', new TextEncoder().encode(svg.replaceAll('currentColor', '#111111'))) : ''
  }

  return satori(pl.dibujar(p), {
    width: p.W,
    height: p.H,
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
  const ancho = (FORMATOS[String(entrada?.formato ?? '')] ?? FORMATOS.og).W
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: ancho * escala }, font: { loadSystemFonts: false } })
  return resvg.render().asPng()
}

/** Contraste WCAG entre dos colores #rrggbb (1 a 21). */
function contraste(a, b) {
  const lum = (hex) => {
    const [r, g, bl] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl
  }
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m)
  return (x + 0.05) / (y + 0.05)
}
