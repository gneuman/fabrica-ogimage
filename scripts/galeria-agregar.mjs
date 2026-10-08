// Agrega un sitio a la galería: baja su página, lee su og:image y la guarda.
//
//   npm run galeria:agregar -- https://empresa.com saas marketing
//   npm run galeria:agregar -- https://empresa.com --imagen ./og.png   (imagen local)
//   --force reemplaza si ya existe.
//
// Escribe content/galeria/<slug>.json y public/galeria/img/<slug>{,-600}.jpg.
// Las categorías van en español (las de scripts/galeria.mjs): ia, saas,
// productividad, finanzas, marketing, desarrollo, diseno, agencias, tiendas, medios.
import fs from 'node:fs'
import { CATEGORIAS, slugDe, guardarImagen } from './galeria.mjs'

const args = process.argv.slice(2)
const force = args.includes('--force')
const iImg = args.indexOf('--imagen')
const imagenLocal = iImg >= 0 ? args[iImg + 1] : null
const libres = args.filter((a, i) => !a.startsWith('--') && (iImg < 0 || i !== iImg + 1))
const url = libres.find((a) => a.includes('.'))
if (!url) {
  console.error('Uso: npm run galeria:agregar -- https://empresa.com [categorías…] [--imagen archivo] [--force]')
  process.exit(1)
}
const pagina = new URL(url.startsWith('http') ? url : `https://${url}`)
const categorias = libres.filter((a) => a !== url && CATEGORIAS[a])
const slug = slugDe(pagina.hostname)
const archivo = `content/galeria/${slug}.json`
if (fs.existsSync(archivo) && !force) {
  console.error(`${slug} ya está. Usa --force para reemplazarlo.`)
  process.exit(1)
}

const AGENTE = { 'User-Agent': 'fabrica-ogimage (galería)' }
const html = await fetch(pagina, { headers: AGENTE, signal: AbortSignal.timeout(10_000) }).then((r) => (r.ok ? r.text() : ''), () => '')
const meta = {}
for (const [, attrs] of html.matchAll(/<meta\s+([^>]+)>/gi)) {
  const clave = attrs.match(/(?:property|name)=["']([^"']+)["']/i)?.[1]
  const valor = attrs.match(/content=["']([^"']*)["']/i)?.[1]
  if (clave && valor && !(clave in meta)) meta[clave.toLowerCase()] = valor
}
const titulo = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim()

let bytes
if (imagenLocal) bytes = fs.readFileSync(imagenLocal)
else {
  const og = meta['og:image'] || meta['twitter:image']
  if (!og) {
    console.error('La página no tiene og:image. Pasa una con --imagen.')
    process.exit(1)
  }
  const r = await fetch(new URL(og, pagina), { headers: AGENTE, signal: AbortSignal.timeout(15_000) })
  if (!r.ok) {
    console.error(`No se pudo bajar la imagen (${r.status})`)
    process.exit(1)
  }
  bytes = Buffer.from(await r.arrayBuffer())
}

const fila = {
  slug,
  nombre: meta['og:site_name'] || titulo || pagina.hostname,
  dominio: pagina.hostname.replace(/^www\./, ''),
  url: pagina.href,
  categorias: categorias.length ? categorias : ['otros'],
  etiquetas: [],
  descripcion: meta['og:description'] || meta.description || '',
  color: await guardarImagen(bytes, slug),
  fuente: 'propia',
  agregado: new Date().toISOString().slice(0, 10),
}
fs.writeFileSync(archivo, JSON.stringify(fila, null, 2) + '\n')
console.log(`Listo: ${archivo}`)
