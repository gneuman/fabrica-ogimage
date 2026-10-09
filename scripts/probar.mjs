// Dibuja una plantilla en los cinco tamaños para revisarla a ojo:
//   npm run probar -- alianza                      (con su ejemplo)
//   npm run probar -- alianza sitio=Ajax acento=e5252a
// Deja los PNG en .probar/<plantilla>-<formato>.png
import fs from 'node:fs'
import { pngNode } from '../motor/node.js'
import { FORMATOS, PLANTILLAS } from '../motor/plantillas.js'

const [slug, ...pares] = process.argv.slice(2)
if (!PLANTILLAS[slug]) throw new Error(`Uso: npm run probar -- <plantilla> [campo=valor…]. Hay: ${Object.keys(PLANTILLAS).join(', ')}`)
const params = { ...PLANTILLAS[slug].ejemplo, ...Object.fromEntries(pares.map((p) => [p.slice(0, p.indexOf('=')), p.slice(p.indexOf('=') + 1)])) }
fs.mkdirSync('.probar', { recursive: true })
for (const formato of Object.keys(FORMATOS)) {
  fs.writeFileSync(`.probar/${slug}-${formato}.png`, await pngNode(slug, { ...params, formato }, { base: 'public' }))
  console.log(`.probar/${slug}-${formato}.png`)
}
