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
}

export const fuentes = [
  { name: 'Inter', data: fs.readFileSync(path.join(aqui, 'fuentes/inter-700.woff')), weight: 700 },
  { name: 'Inter', data: fs.readFileSync(path.join(aqui, 'fuentes/inter-500.woff')), weight: 500 },
]

const TIPOS = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml' }

/** `base`: carpeta contra la que se resuelven las rutas que empiezan con / (p. ej. dist/). */
export function recursosNode({ base } = {}) {
  return {
    fuentes,
    leer: async (ruta) => {
      const [tipo, archivo] = ruta.split('/')
      const f = path.join(DIRS[tipo] ?? '', path.basename(archivo))
      return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null
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
