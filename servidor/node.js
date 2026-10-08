// La API de imágenes en Node, para correrla fuera de Cloudflare: un VPS, Docker,
// Render, Railway o Fly. Mismo motor y mismas URLs que el Worker:
//
//   GET /og/<plantilla>?titulo=…   → PNG 1200×630
//   GET /api/ubicacion/            → { pais, region, ciudad } (solo detrás de Cloudflare)
//
// Cada URL se dibuja una vez y se guarda en disco (CACHE_DIR). Variables:
// PORT (3000), CACHE_DIR (.cache/og), CACHE_MAX_MB (500).
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { pngNode } from '../motor/node.js'
import { PLANTILLAS } from '../motor/plantillas.js'

const PUERTO = Number(process.env.PORT ?? 3000)
const CACHE = path.resolve(process.env.CACHE_DIR ?? '.cache/og')
const CACHE_MAX = Number(process.env.CACHE_MAX_MB ?? 500) * 1024 * 1024
fs.mkdirSync(CACHE, { recursive: true })

const CABECERAS = { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable', 'Access-Control-Allow-Origin': '*' }

/** Si la caché pasa del tope, borra las imágenes más viejas hasta quedar en 80%. */
function podar() {
  const archivos = fs.readdirSync(CACHE).map((f) => ({ f, ...fs.statSync(path.join(CACHE, f)) }))
  let total = archivos.reduce((s, a) => s + a.size, 0)
  if (total <= CACHE_MAX) return
  for (const a of archivos.sort((x, y) => x.atimeMs - y.atimeMs)) {
    fs.rmSync(path.join(CACHE, a.f), { force: true })
    if ((total -= a.size) <= CACHE_MAX * 0.8) break
  }
}

const servidor = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://local')

  if (url.pathname.replace(/\/$/, '') === '/api/ubicacion') {
    // Detrás del proxy de Cloudflare llegan estas cabeceras; sin él, van vacías.
    const datos = { pais: req.headers['cf-ipcountry'] ?? '', region: req.headers['cf-region'] ?? '', ciudad: req.headers['cf-ipcity'] ?? '' }
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'private, no-store', 'Access-Control-Allow-Origin': '*' })
    return res.end(JSON.stringify(datos))
  }

  const slug = url.pathname.match(/^\/og\/([a-z]+)(?:\.png)?\/?$/)?.[1]
  if (!slug || !PLANTILLAS[slug]) {
    res.writeHead(url.pathname === '/' ? 200 : 404, { 'Content-Type': 'text/plain; charset=utf-8' })
    return res.end(`fabrica-ogimage: GET /og/<plantilla>?titulo=…\nPlantillas: ${Object.keys(PLANTILLAS).join(', ')}\n`)
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405)
    return res.end()
  }

  const entrada = Object.fromEntries(url.searchParams)
  // En ciudad, lo que falte se toma de las cabeceras de Cloudflare si las hay.
  const porUbicacion = slug === 'ciudad' && (!entrada.pais || !entrada.ciudad) && !!req.headers['cf-ipcountry']
  if (porUbicacion) {
    entrada.pais ||= String(req.headers['cf-ipcountry'])
    entrada.ciudad ||= String(req.headers['cf-ipcity'] ?? '')
  }
  const clave = crypto.createHash('sha256').update(`${slug}?${new URLSearchParams(entrada)}`).digest('hex')
  const archivo = path.join(CACHE, `${clave}.png`)
  const cabeceras = porUbicacion ? { ...CABECERAS, 'Cache-Control': 'private, max-age=3600' } : CABECERAS

  try {
    let png
    if (fs.existsSync(archivo)) png = fs.readFileSync(archivo)
    else {
      png = await pngNode(slug, entrada)
      fs.writeFileSync(archivo, png)
      podar()
    }
    res.writeHead(200, cabeceras)
    res.end(req.method === 'HEAD' ? undefined : png)
  } catch (e) {
    console.error(slug, url.search, e)
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('No se pudo generar la imagen')
  }
})

servidor.listen(PUERTO, () => console.log(`fabrica-ogimage escuchando en http://localhost:${PUERTO}`))
