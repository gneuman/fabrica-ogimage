// Generar las imágenes OG de un sitio ya construido: lee cada HTML de la
// carpeta de salida, toma su <title> y dibuja su imagen. Lo usan el comando
// (bin/fabrica-ogimage.mjs) y la integración de Astro (motor/astro.js).
//
// Dónde va cada imagen:
// - Si la página ya declara un og:image de su propio sitio que termina en .png
//   dentro de /<carpeta>/, se dibuja ahí (así trabaja gabrielneuman.com).
// - Si no declara ninguno y hay `url`, se dibuja en /<carpeta>/<ruta>.png y se
//   agregan las etiquetas og:image al <head>.
// - Si no, la página se salta.
import fs from 'node:fs'
import path from 'node:path'
import { pngNode } from './node.js'
import { PLANTILLAS } from './plantillas.js'

const ENTIDADES = { amp: '&', quot: '"', '#39': "'", lt: '<', gt: '>', nbsp: ' ' }
const decodificar = (s) => s.replace(/&(amp|quot|#39|lt|gt|nbsp);/g, (_, e) => ENTIDADES[e]).replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
const escapar = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

/** "Copiloto | Acompaño a tu equipo · Gabriel Neuman" → ["Copiloto", "Acompaño a tu equipo"], quitando la marca. */
export function partirTitulo(titulo, marca = '') {
  const partes = titulo.split(/\s+[|·–—]\s+/).map((p) => p.trim()).filter((p) => p && (!marca || p.toLowerCase() !== marca.toLowerCase()))
  return [partes[0] ?? titulo, partes.slice(1).join(' · ')]
}

const rutaDe = (archivo) => '/' + archivo.replace(/\\/g, '/').replace(/(^|\/)index\.html$/, '$1').replace(/\.html$/, '/')

/**
 * opciones: { plantilla = 'marca', url, carpeta = 'og', marca, fijos = {}, log = console.log }
 * `fijos`: parámetros iguales en todas las imágenes (autor, sitio, foto, colores).
 */
export async function generarParaDist(dir, opciones = {}) {
  const { plantilla = 'marca', url, carpeta = 'og', marca = '', fijos = {}, log = console.log } = opciones
  if (!PLANTILLAS[plantilla]) throw new Error(`No existe la plantilla "${plantilla}". Hay: ${Object.keys(PLANTILLAS).join(', ')}`)
  const origen = url ? new URL(url).origin : null
  let hechas = 0, saltadas = 0
  for (const archivo of fs.globSync('**/*.html', { cwd: dir })) {
    const ruta = path.join(dir, archivo)
    let html = fs.readFileSync(ruta, 'utf8')
    const titulo = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]
    if (!titulo) { saltadas++; continue }

    const declarada = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i)?.[1]
    let destino
    if (declarada) {
      const u = new URL(declarada, origen ?? 'http://local')
      const propia = !origen || u.origin === origen || u.origin === 'http://local'
      if (!propia || !u.pathname.startsWith(`/${carpeta}/`) || !u.pathname.endsWith('.png')) { saltadas++; continue }
      destino = u.pathname
    } else if (origen) {
      const r = rutaDe(archivo)
      destino = r === '/' ? `/${carpeta}/inicio.png` : `/${carpeta}${r.replace(/\/$/, '')}.png`
      const etiquetas = [
        `<meta property="og:image" content="${escapar(origen + destino)}">`,
        '<meta property="og:image:width" content="1200">',
        '<meta property="og:image:height" content="630">',
        '<meta name="twitter:card" content="summary_large_image">',
      ].join('')
      html = html.replace(/<\/head>/i, `${etiquetas}</head>`)
      fs.writeFileSync(ruta, html)
    } else { saltadas++; continue }

    const [principal, sub] = partirTitulo(decodificar(titulo), marca)
    const descripcion = decodificar(html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i)?.[1] ?? '')
    const params = { titulo: principal, sub, extracto: descripcion, ...fijos }
    const salida = path.join(dir, destino)
    fs.mkdirSync(path.dirname(salida), { recursive: true })
    fs.writeFileSync(salida, await pngNode(plantilla, params, { base: dir }))
    hechas++
  }
  log(`fabrica-ogimage: ${hechas} imágenes (${saltadas} páginas saltadas)`)
  return { hechas, saltadas }
}
