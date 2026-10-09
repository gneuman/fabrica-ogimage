// Dibuja una plantilla en los cinco tamaños, en local:
//   npm run probar -- alianza                                  (con su ejemplo)
//   npm run probar -- ceoagentico autor="Jorge Ávila" foto=local/inbox/jorge-sinfondo.png
//   npm run probar -- alianza sitio=Ajax --salida ../mi-sitio/public/og
// Todo se queda en tu máquina (local/ no entra a git; el repo es público):
// - local/inbox/: lo que llega (fotos, referencias).
// - local/hechas/AAAA-MM-DD-<plantilla>-<nombre>/: lo que sale, en orden.
//   <nombre> sale de --nombre, o de autor, sitio o título.
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { pngNode } from '../motor/node.js'
import { FORMATOS, PLANTILLAS } from '../motor/plantillas.js'

const args = process.argv.slice(2)
const iSalida = args.indexOf('--salida')
const elegida = iSalida >= 0 ? args.splice(iSalida, 2)[1] : null
const iNombre = args.indexOf('--nombre')
const nombre = iNombre >= 0 ? args.splice(iNombre, 2)[1] : null
const [slug, ...pares] = args
if (!PLANTILLAS[slug]) throw new Error(`Uso: npm run probar -- <plantilla> [campo=valor…] [--salida carpeta]. Hay: ${Object.keys(PLANTILLAS).join(', ')}`)
const params = { ...PLANTILLAS[slug].ejemplo, ...Object.fromEntries(pares.map((p) => [p.slice(0, p.indexOf('=')), p.slice(p.indexOf('=') + 1)])) }

// Archivos locales en campos de imagen → copia en public/_local/ para que el motor los lea.
for (const k of ['foto', 'foto2', 'imagen', 'logo']) {
  const v = params[k]?.replace(/^~(?=\/)/, os.homedir())
  if (!v || /^https?:\/\//.test(v) || !fs.existsSync(v)) continue
  fs.mkdirSync('public/_local', { recursive: true })
  const nombre = `${k}${path.extname(v).toLowerCase()}`
  fs.copyFileSync(v, path.join('public/_local', nombre))
  params[k] = `/_local/${nombre}`
}

const corto = (t) => t.normalize('NFD').replace(/[\u0300-\u036f*]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)
const hoy = new Date().toISOString().slice(0, 10)
const salida = elegida ?? path.join('local/hechas', [hoy, slug, corto(nombre ?? params.autor ?? params.sitio ?? params.titulo ?? '')].filter(Boolean).join('-'))
fs.mkdirSync(salida, { recursive: true })
for (const formato of Object.keys(FORMATOS)) {
  const archivo = path.join(salida, `${slug}-${formato}.png`)
  fs.writeFileSync(archivo, await pngNode(slug, { ...params, formato }, { base: 'public' }))
  console.log(archivo)
}
