import { PLANTILLAS, CAMPOS as CAMPOS_MOTOR } from '../../motor/plantillas.js'
import { CATEGORIAS } from '../../scripts/categorias.mjs'

export interface Campo { etiqueta: string; tipo: 'texto' | 'url' | 'color'; ayuda?: string }
export const CAMPOS: Record<string, Campo> = CAMPOS_MOTOR as Record<string, Campo>
export { PLANTILLAS, CATEGORIAS }

export const NOMBRE = 'Fábrica de imágenes OG'
export const AUTOR = { nombre: 'Gabriel Neuman', url: 'https://www.gabrielneuman.com/' }
export const POST = 'https://www.gabrielneuman.com/fabrica-ogimage-imagenes-og-en-espanol/'
export const REPO = 'https://github.com/gneuman/fabrica-ogimage'

/** Receptor de la captura: el mismo webhook de n8n que el newsletter de gabrielneuman.com. */
export const FORMULARIO = 'https://n8n.gnb.mx/webhook/websiteForm'

export type Plantilla = keyof typeof PLANTILLAS
export const SLUGS = Object.keys(PLANTILLAS) as Plantilla[]

/** "/og/articulo?titulo=…" con los parámetros vacíos fuera. */
export function urlOg(slug: string, params: Record<string, string | undefined>) {
  const q = new URLSearchParams(Object.entries(params).filter((e): e is [string, string] => !!e[1]))
  return `/og/${slug}?${q.toString().replace(/\+/g, '%20')}`
}

export interface Sitio {
  slug: string
  nombre: string
  dominio: string
  url: string
  categorias: string[]
  etiquetas: string[]
  descripcion: string
  color: string
  fuente: string
  agregado: string | null
}

const archivos = import.meta.glob<Sitio>('../../content/galeria/*.json', { eager: true, import: 'default' })
/** Los propios primero, luego por fecha de alta, los más nuevos arriba. */
export const GALERIA: Sitio[] = Object.values(archivos).sort(
  (a, b) => Number(b.fuente === 'propia') - Number(a.fuente === 'propia') || (b.agregado ?? '').localeCompare(a.agregado ?? '') || a.slug.localeCompare(b.slug),
)

export const CATEGORIAS_CON_OTROS: Record<string, { nombre: string }> = { ...CATEGORIAS, otros: { nombre: 'Otros' } }
