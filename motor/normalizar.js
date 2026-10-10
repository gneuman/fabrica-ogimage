// De lo que llega por URL a los parámetros limpios que recibe una plantilla:
// recorta textos, valida colores y fija el tamaño del lienzo según el formato.
// Puro, sin Satori ni resvg: lo copian tal cual los proyectos que dibujan las
// plantillas con su propio motor (PostLeads, con next/og).
import { FORMATOS, PLANTILLAS } from './plantillas.js'

const MARCA = { fondo: '#0f1733', texto: '#f7f6f2', acento: '#e2553d' }
const LARGO = { titulo: 140, sub: 160, extracto: 220, autor: 60, anfitrion: 60, sitio: 60, boton: 40, emoji: 16, icono: 40, icono2: 40, ciudad: 40, pais: 2, cifra: 12, izquierda: 160, derecha: 160, fecha: 40, lugar: 80, puntos: 300, pilares: 200, total: 16 }

const hex = (v, def) => {
  const s = String(v ?? '').trim().replace(/^#/, '')
  return /^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s) ? `#${s}` : def
}
const luz = (c) => {
  const s = c.slice(1).length === 3 ? c.slice(1).replace(/./g, '$&$&') : c.slice(1)
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16) / 255)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const cortar = (s, max) => (s.length > max ? s.slice(0, max - 1).replace(/\s+\S*$/, '') + '…' : s)

/** Los parámetros de la URL, recortados y con los colores de la marca por defecto. */
export function normalizar(slug, entrada = {}) {
  const pl = PLANTILLAS[slug]
  const leer = (k) => String(entrada[k] ?? '').trim()
  const p = {}
  for (const k of pl.campos) {
    if (k in MARCA) continue
    const v = leer(k)
    // URL completa, o ruta del propio sitio ("/muestras/captura.png").
    if (k === 'foto' || k === 'foto2' || k === 'imagen' || k === 'logo') p[k] = /^(https?:\/\/|\/[^/])/.test(v) ? v : ''
    else p[k] = cortar(v, LARGO[k] ?? 120)
  }
  const marca = { ...MARCA, ...pl.marca }
  p.fondo = hex(entrada.fondo, marca.fondo)
  p.texto = hex(entrada.texto, luz(p.fondo) > 0.6 ? '#0f1733' : marca.texto)
  p.acento = hex(entrada.acento, marca.acento)
  p.suave = luz(p.fondo) > 0.6 ? '#4b5563' : (pl.marca ? '#b9b9b4' : '#c5d5f8')
  p.sobreAcento = luz(p.acento) > 0.6 ? '#0f1733' : '#ffffff'
  p.formato = FORMATOS[leer('formato')] ? leer('formato') : 'og'
  const f = FORMATOS[p.formato]
  p.W = f.lienzo
  p.H = Math.round((f.H * f.lienzo) / f.W)
  p.alto = p.H >= p.W
  if (!p.titulo && pl.campos.includes('titulo')) p.titulo = pl.ejemplo.titulo
  if (p.pais !== undefined) {
    p.pais = /^[a-z]{2}$/i.test(p.pais) ? p.pais.toUpperCase() : ''
    // "MX" → 🇲🇽 (dos letras indicadoras regionales) y "México".
    p.bandera = p.pais ? String.fromCodePoint(...[...p.pais].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)) : ''
    p.nombrePais = p.pais ? (paises.of(p.pais) ?? p.pais) : ''
  }
  return p
}

const paises = new Intl.DisplayNames(['es-MX'], { type: 'region' })

