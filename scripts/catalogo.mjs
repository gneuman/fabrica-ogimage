// Escribe PLANTILLAS.md desde motor/plantillas.js: qué plantilla usar, sus
// campos y una URL de ejemplo. Lo lee un agente antes de pedir una imagen;
// sale de las mismas entradas, así que no se desfasa.
import fs from 'node:fs'
import { CAMPOS, FORMATOS, PLANTILLAS } from '../motor/plantillas.js'

const url = (slug, ej) => `/og/${slug}/?` + Object.entries(ej).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')
const lineas = [
  '# Catálogo de plantillas',
  '',
  '<!-- Generado por scripts/catalogo.mjs en cada build. No se edita a mano: se cambia motor/plantillas.js. -->',
  '',
  `${Object.keys(PLANTILLAS).length} plantillas. Todas salen en los cinco tamaños con \`?formato=\`:`,
  '',
  '| formato | PNG | para |',
  '|---|---|---|',
  ...Object.entries(FORMATOS).map(([k, f]) => `| \`${k}\` | ${f.W}×${f.H} | ${f.redes} |`),
  '',
  'Colores: `fondo`, `texto` y `acento` aceptan hex sin `#` (`acento=e5252a`). Cómo hacer una nueva: `motor/README.md`.',
  '',
]
for (const [slug, pl] of Object.entries(PLANTILLAS)) {
  lineas.push(`## \`${slug}\`: ${pl.nombre}`, '', pl.descripcion, '', `**Cuándo:** ${pl.cuando}`, '', '| campo | qué es |', '|---|---|')
  for (const c of pl.campos) {
    const d = CAMPOS[c] ?? {}
    lineas.push(`| \`${c}\` | ${[d.etiqueta, pl.ayuda?.[c] ?? d.ayuda].filter(Boolean).join('. ').replace(/\|/g, '\\|')} |`)
  }
  lineas.push('', '```', url(slug, pl.ejemplo), '```', '')
}
fs.writeFileSync(new URL('../PLANTILLAS.md', import.meta.url), lineas.join('\n'))
console.log(`catálogo: ${Object.keys(PLANTILLAS).length} plantillas en PLANTILLAS.md`)
