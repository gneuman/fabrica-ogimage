// Antes del build de Astro:
// 1. Copia emoji (Twemoji), íconos (Lucide), logos (Simple Icons) y fuentes a public/_recursos/ para
//    que el Worker y el editor del navegador los lean como archivos.
// 2. Dibuja la muestra de cada plantilla en public/_muestras/<plantilla>.png,
//    con sus parámetros de ejemplo. Las páginas las usan sin pasar por el Worker.
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { FORMATOS, PLANTILLAS } from '../motor/plantillas.js'
import { marcaConColor, pngNode } from '../motor/node.js'

const requerir = createRequire(import.meta.url)
const copiar = (origen, destino) => {
  fs.rmSync(destino, { recursive: true, force: true })
  fs.mkdirSync(destino, { recursive: true })
  for (const f of fs.readdirSync(origen).filter((f) => f.endsWith('.svg'))) fs.copyFileSync(path.join(origen, f), path.join(destino, f))
  return fs.readdirSync(destino).length
}
const emoji = copiar(path.dirname(requerir.resolve('@twemoji/svg/package.json')), 'public/_recursos/emoji')
const iconos = copiar(path.join(path.dirname(requerir.resolve('lucide-static/package.json')), 'icons'), 'public/_recursos/iconos')
// Logos de marca (Simple Icons, CC0), ya con el color de cada marca como fill.
const marcas = copiar(path.join(path.join(path.dirname(requerir.resolve('simple-icons')), ''), 'icons'), 'public/_recursos/marcas')
for (const f of fs.readdirSync('public/_recursos/marcas')) {
  const ruta = `public/_recursos/marcas/${f}`
  fs.writeFileSync(ruta, marcaConColor(fs.readFileSync(ruta, 'utf8'), f.slice(0, -4)))
}
fs.mkdirSync('public/_recursos/fuentes', { recursive: true })
for (const f of ['inter-500.woff', 'inter-700.woff', 'lilita-400.woff', 'lora-700.woff', 'mono-500.woff', 'archivo-900.woff', 'lora-500-italic.woff']) fs.copyFileSync(`motor/fuentes/${f}`, `public/_recursos/fuentes/${f}`)
console.log(`recursos: ${emoji} emoji, ${iconos} íconos, ${marcas} logos, 7 fuentes`)

fs.mkdirSync('public/_muestras', { recursive: true })
for (const [slug, pl] of Object.entries(PLANTILLAS)) {
  fs.writeFileSync(`public/_muestras/${slug}.png`, await pngNode(slug, pl.ejemplo, { base: 'public' }))
}
// 3. Y en cada formato, en public/_muestras/<formato>/<plantilla>.png, para las
//    páginas de /formatos/ y /plantillas/<plantilla>/<formato>/.
for (const formato of Object.keys(FORMATOS).filter((f) => f !== 'og')) {
  fs.mkdirSync(`public/_muestras/${formato}`, { recursive: true })
  for (const [slug, pl] of Object.entries(PLANTILLAS)) {
    fs.writeFileSync(`public/_muestras/${formato}/${slug}.png`, await pngNode(slug, { ...pl.ejemplo, formato }, { base: 'public' }))
  }
}
console.log(`muestras: ${Object.keys(PLANTILLAS).length} plantillas en ${Object.keys(FORMATOS).length} formatos`)
