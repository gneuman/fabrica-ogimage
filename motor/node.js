// El motor en Node: lo usan el comando para otros proyectos y el build del
// sitio. Lee emoji e íconos de node_modules y las fuentes de motor/fuentes/.
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import './node-shim.js'
import { generarPng, iniciar } from './render.js'

const aqui = path.dirname(fileURLToPath(import.meta.url))
const requerir = createRequire(import.meta.url)
const DIRS = {
  emoji: path.dirname(requerir.resolve('@twemoji/svg/package.json')),
  iconos: path.join(path.dirname(requerir.resolve('lucide-static/package.json')), 'icons'),
  marcas: path.join(path.join(path.dirname(requerir.resolve('simple-icons')), ''), 'icons'),
}
// Simple Icons trae el SVG sin color; el color de la marca va en su lista. Se le pone como fill.
let hexMarca
export function marcaConColor(svg, slug) {
  hexMarca ??= new Map(JSON.parse(fs.readFileSync(path.join(DIRS.marcas, '../data/simple-icons.json'), 'utf8')).map((i) => [i.slug, i.hex]))
  return svg.replace('<svg ', `<svg fill="#${hexMarca.get(slug) ?? '000000'}" `)
}

export const fuentes = [
  { name: 'Inter', data: fs.readFileSync(path.join(aqui, 'fuentes/inter-700.woff')), weight: 700 },
  { name: 'Inter', data: fs.readFileSync(path.join(aqui, 'fuentes/inter-500.woff')), weight: 500 },
  { name: 'Lilita', data: fs.readFileSync(path.join(aqui, 'fuentes/lilita-400.woff')), weight: 400 },
  { name: 'Lora', data: fs.readFileSync(path.join(aqui, 'fuentes/lora-700.woff')), weight: 700 },
  { name: 'Mono', data: fs.readFileSync(path.join(aqui, 'fuentes/mono-500.woff')), weight: 500 },
  { name: 'Archivo', data: fs.readFileSync(path.join(aqui, 'fuentes/archivo-900.woff')), weight: 900 },
  { name: 'Lora', data: fs.readFileSync(path.join(aqui, 'fuentes/lora-500-italic.woff')), weight: 500, style: 'italic' },
]

const TIPOS = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml' }

/** `base`: carpeta contra la que se resuelven las rutas que empiezan con / (p. ej. dist/). */
export function recursosNode({ base } = {}) {
  return {
    fuentes,
    leer: async (ruta) => {
      const [tipo, archivo] = ruta.split('/')
      const f = path.join(DIRS[tipo] ?? '', path.basename(archivo))
      if (!fs.existsSync(f)) return null
      const svg = fs.readFileSync(f, 'utf8')
      return tipo === 'marcas' ? marcaConColor(svg, path.basename(archivo, '.svg')) : svg
    },
    bajar: async (url) => {
      if (url.startsWith('/')) {
        const raiz = path.resolve(base ?? path.join(aqui, '../public'))
        const f = path.join(raiz, url)
        return f.startsWith(raiz + path.sep) && fs.existsSync(f) ? { tipo: TIPOS[path.extname(f).toLowerCase()] ?? '', bytes: fs.readFileSync(f) } : null
      }
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) })
      return r.ok ? { tipo: r.headers.get('content-type') ?? '', bytes: new Uint8Array(await r.arrayBuffer()) } : null
    },
  }
}

export async function pngNode(slug, entrada, opciones = {}) {
  await iniciar(fs.readFileSync(requerir.resolve('@resvg/resvg-wasm/index_bg.wasm')), fs.readFileSync(requerir.resolve('satori/yoga.wasm')))
  return generarPng(slug, entrada, recursosNode(opciones), opciones)
}
