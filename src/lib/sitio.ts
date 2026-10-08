import { PLANTILLAS, CAMPOS as CAMPOS_MOTOR } from '../../motor/plantillas.js'
import { CATEGORIAS } from '../../scripts/categorias.mjs'

export interface Campo { etiqueta: string; tipo: 'texto' | 'url' | 'color'; ayuda?: string }
export const CAMPOS: Record<string, Campo> = CAMPOS_MOTOR as Record<string, Campo>
export { PLANTILLAS, CATEGORIAS }

export const NOMBRE = 'Fábrica de imágenes OG'
export const AUTOR = { nombre: 'Gabriel Neuman', url: 'https://www.gabrielneuman.com/' }
export const POST = 'https://www.gabrielneuman.com/fabrica-ogimage-imagenes-og-en-espanol/'
export const REPO = 'https://github.com/gneuman/fabrica-ogimage'
export const DESPLEGAR = `https://deploy.workers.cloudflare.com/?url=${REPO}`
/** Link de afiliado de Hostinger (VPS). Siempre con su aviso al lado. */
export const HOSTINGER = 'https://gnb.mx/HostingerHub'

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

/** Las que abren la galería: marcas que cualquiera reconoce. El resto va por fecha de alta. */
const DESTACADOS = ['stripe-com', 'linear-app', 'vercel-com', 'raycast-com', 'figma-com', 'framer-com', 'openai-com', 'slack-com', 'discord-com', 'webflow-com', 'mailchimp-com', 'intercom-com', 'loops-so', 'retool-com', 'pitch-com', 'attio-com', 'tally-so', 'klarna-com']
const orden = (s: Sitio) => {
  const i = DESTACADOS.indexOf(s.slug)
  return s.fuente === 'propia' ? -1 : i >= 0 ? i : DESTACADOS.length
}
export const GALERIA: Sitio[] = Object.values(archivos).sort(
  (a, b) => orden(a) - orden(b) || (b.agregado ?? '').localeCompare(a.agregado ?? '') || a.slug.localeCompare(b.slug),
)

export const CATEGORIAS_CON_OTROS: Record<string, { nombre: string }> = { ...CATEGORIAS, otros: { nombre: 'Otros' } }
