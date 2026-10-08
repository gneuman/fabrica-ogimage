// Antes del build de Astro:
// 1. Copia emoji (Twemoji) e íconos (Lucide) a public/_recursos/ para que el
//    Worker los lea de los assets en vez de cargarlos en su código (no caben).
// 2. Dibuja la muestra de cada plantilla en public/_muestras/<plantilla>.png,
//    con sus parámetros de ejemplo. Las páginas las usan sin pasar por el Worker.
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { PLANTILLAS } from '../motor/plantillas.js'
import { pngNode } from '../motor/node.js'

const requerir = createRequire(import.meta.url)
const copiar = (origen, destino) => {
  fs.rmSync(destino, { recursive: true, force: true })
  fs.mkdirSync(destino, { recursive: true })
  for (const f of fs.readdirSync(origen).filter((f) => f.endsWith('.svg'))) fs.copyFileSync(path.join(origen, f), path.join(destino, f))
  return fs.readdirSync(destino).length
}
const emoji = copiar(path.dirname(requerir.resolve('@twemoji/svg/package.json')), 'public/_recursos/emoji')
const iconos = copiar(path.join(path.dirname(requerir.resolve('lucide-static/package.json')), 'icons'), 'public/_recursos/iconos')
console.log(`recursos: ${emoji} emoji, ${iconos} íconos`)

fs.mkdirSync('public/_muestras', { recursive: true })
for (const [slug, pl] of Object.entries(PLANTILLAS)) {
  fs.writeFileSync(`public/_muestras/${slug}.png`, await pngNode(slug, pl.ejemplo, { base: 'public' }))
}
console.log(`muestras: ${Object.keys(PLANTILLAS).length} plantillas`)
