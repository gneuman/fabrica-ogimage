// Lo que comparten los scripts de la galería: categorías en español y cómo se
// guarda una imagen (1200×630 en JPG más una miniatura de 600).
import fs from 'node:fs'
import sharp from 'sharp'
import { CATEGORIAS } from './categorias.mjs'

export { CATEGORIAS }

export function categoriasDe(etiquetas = []) {
  const fuera = new Set()
  for (const e of etiquetas) for (const [slug, c] of Object.entries(CATEGORIAS)) if (c.claves.includes(e)) fuera.add(slug)
  return fuera.size ? [...fuera] : ['otros']
}

export const slugDe = (dominio) => dominio.replace(/^www\./, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase()

/** Guarda la imagen normalizada y su miniatura. Devuelve el color dominante. */
export async function guardarImagen(bytes, slug) {
  fs.mkdirSync('public/galeria/img', { recursive: true })
  const base = sharp(bytes, { animated: false }).flatten({ background: '#ffffff' })
  await base.clone().resize(1200, 630, { fit: 'cover', position: 'top' }).jpeg({ quality: 80, mozjpeg: true }).toFile(`public/galeria/img/${slug}.jpg`)
  await base.clone().resize(600, 315, { fit: 'cover', position: 'top' }).jpeg({ quality: 76, mozjpeg: true }).toFile(`public/galeria/img/${slug}-600.jpg`)
  const { dominant } = await sharp(bytes).stats()
  return '#' + [dominant.r, dominant.g, dominant.b].map((n) => n.toString(16).padStart(2, '0')).join('')
}
