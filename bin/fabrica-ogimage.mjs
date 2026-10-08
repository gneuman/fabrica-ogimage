#!/usr/bin/env node
// Genera las imágenes OG de un sitio ya construido. Ver motor/build.js.
//
//   npx fabrica-ogimage dist --url https://misitio.com --plantilla articulo --autor "Ana López"
import { parseArgs } from 'node:util'
import { generarParaDist } from '../motor/build.js'
import { PLANTILLAS } from '../motor/plantillas.js'

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    plantilla: { type: 'string', default: 'marca' },
    url: { type: 'string' },
    carpeta: { type: 'string', default: 'og' },
    marca: { type: 'string', default: '' },
    autor: { type: 'string' }, sitio: { type: 'string' }, foto: { type: 'string' },
    fondo: { type: 'string' }, texto: { type: 'string' }, acento: { type: 'string' },
    ayuda: { type: 'boolean', short: 'h' },
  },
})
if (values.ayuda || !positionals[0]) {
  console.log(`Uso: fabrica-ogimage <carpeta del build> [opciones]

  --plantilla   ${Object.keys(PLANTILLAS).join(', ')} (por defecto: marca)
  --url         URL pública del sitio. Con ella, a las páginas sin og:image se les agrega.
  --carpeta     Dónde van las imágenes dentro del build (por defecto: og)
  --marca       Texto que se quita del título ("Mi Empresa" en "Precios | Mi Empresa")
  --autor --sitio --foto --fondo --texto --acento   Iguales en todas las imágenes`)
  process.exit(values.ayuda ? 0 : 1)
}
const { plantilla, url, carpeta, marca, ayuda, ...resto } = values
const fijos = Object.fromEntries(Object.entries(resto).filter(([, v]) => v !== undefined))
await generarParaDist(positionals[0], { plantilla, url, carpeta, marca, fijos })
