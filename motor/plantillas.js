// Las plantillas de la fábrica. Cada una recibe los parámetros ya limpios
// (normalizar en render.js) y devuelve el árbol que dibuja Satori a 1200×630.
// Las usan los tres caminos: el Worker (/og/<plantilla>), el comando para otros
// proyectos (bin/) y las muestras que se generan en el build (scripts/).
//
// Satori pide display:flex en todo div con más de un hijo; h() se lo pone a
// todos los div por defecto.

export const ANCHO = 1200
export const ALTO = 630

/**
 * Tamaños por red. W × H es el PNG que sale; `lienzo` es el ancho en el que
 * dibuja la plantilla (p.W × p.H) antes de ampliarse. Las plantillas están
 * pensadas para un alto de 630: en los formatos altos se dibuja en un lienzo
 * más chico para que la letra salga grande al ampliar. Con p.alto (cuadrado o
 * más alto que ancho) lo que va lado a lado se apila.
 */
export const FORMATOS = {
  og: { nombre: 'Link compartido', W: 1200, H: 630, lienzo: 1200, redes: 'WhatsApp, Slack, links' },
  cuadrado: { nombre: 'Cuadrado', W: 1080, H: 1080, lienzo: 680, redes: 'LinkedIn, Facebook' },
  vertical: { nombre: 'Vertical 4:5', W: 1080, H: 1350, lienzo: 680, redes: 'Feed de Instagram' },
  horizontal: { nombre: 'Horizontal', W: 1200, H: 675, lienzo: 1200, redes: 'X' },
  historia: { nombre: 'Historia', W: 1080, H: 1920, lienzo: 620, redes: 'Stories, Reels, TikTok' },
}

// Las llaves en undefined se quitan: así una plantilla puede decir
// `width: p.alto ? undefined : 110` y Satori no se tropieza.
const limpio = (style = {}) => Object.fromEntries(Object.entries(style).filter(([, v]) => v !== undefined))
const h = (type, style, ...hijos) => ({
  type,
  props: {
    style: type === 'div' ? { display: 'flex', ...limpio(style) } : limpio(style),
    children: hijos.flat().filter((x) => x !== null && x !== undefined && x !== false && x !== ''),
  },
})
const img = (src, style) => ({ type: 'img', props: { src, style } })

/** Tamaño de letra según el largo del texto: textos cortos, letra grande. */
const escala = (texto, pasos) => pasos.find(([max]) => texto.length <= max)?.[1] ?? pasos.at(-1)[1]

/**
 * Texto con *resaltado*: lo que va entre asteriscos sale en el color de acento.
 * Satori no parte líneas entre spans distintos, así que va palabra por palabra.
 */
function resaltar(texto, acento, estiloMarcado = {}) {
  const palabras = []
  let anterior = ''
  texto.split(/(\*[^*]+\*)/).filter(Boolean).forEach((trozo) => {
    const marcado = trozo.startsWith('*') && trozo.endsWith('*')
    const limpio = marcado ? trozo.slice(1, -1) : trozo
    // Un trozo pegado al anterior ("*resaltado*.") une su primera palabra a la última.
    const pegado = anterior && !/\s$/.test(anterior)
    limpio.split(/(\s+)/).forEach((p, i) => {
      if (!p || /^\s+$/.test(p)) return
      if (i === 0 && pegado && palabras.length) palabras.at(-1).push({ p, marcado })
      else palabras.push([{ p, marcado }])
    })
    anterior = trozo
  })
  return palabras.map((partes) =>
    h('span', { marginRight: '0.24em' }, partes.map(({ p, marcado }) => h('span', marcado ? { color: acento, ...estiloMarcado } : {}, p))),
  )
}

const firma = (p, color) =>
  (p.autor || p.sitio) &&
  h('div', { display: 'flex', alignItems: 'center', fontSize: 26, color },
    p.foto && img(p.foto, { width: 56, height: 56, borderRadius: 999, marginRight: 18, objectFit: 'cover' }),
    p.autor && h('span', { fontWeight: 700, color: p.texto }, p.autor),
    p.autor && p.sitio && h('span', { margin: '0 12px', opacity: 0.6 }, '·'),
    p.sitio && h('span', {}, p.sitio),
  )

/** Línea mono con *resaltado*, sin partir palabras (para etiquetas cortas). */
const monoResaltado = (texto, acento) =>
  texto.split(/(\*[^*]+\*)/).filter(Boolean).map((t) => h('span', { color: t.startsWith('*') ? acento : undefined, whiteSpace: 'pre' }, t.replace(/\*/g, '')))

/**
 * Terminal con título y líneas: "Nombre | > comando | ✓ paso | ✓ paso".
 * Las líneas con ✓ salen en el color de la ventana.
 */
function ventana(p, texto, etiqueta, color, extra = {}) {
  const [nombre, ...lineas] = texto.split(/\s*\|\s*/)
  return h('div', { flexDirection: 'column', width: 440, borderRadius: 14, background: '#18191b', border: '2px solid #2c2d30', boxShadow: '0 24px 50px rgba(0,0,0,0.7)', ...extra },
    h('div', { alignItems: 'center', padding: '12px 18px', borderBottom: '2px solid #2c2d30' },
      ...[0, 1, 2].map(() => h('div', { width: 11, height: 11, borderRadius: 99, background: '#4a4b4f', marginRight: 8 })),
      h('div', { marginLeft: 'auto', fontFamily: 'Mono', fontSize: 13, letterSpacing: '0.16em', color: '#8a8c91' }, etiqueta),
    ),
    h('div', { flexDirection: 'column', padding: '16px 20px 20px' },
      h('div', { fontFamily: 'Lilita', fontSize: 30, textTransform: 'uppercase', color: p.texto }, nombre),
      ...lineas.slice(0, 3).map((l) => {
        // La fuente mono no trae ✓: la palomita se dibuja con dos bordes.
        const hecho = /^[✓✔]/.test(l)
        return h('div', { alignItems: 'center', marginTop: 8, fontFamily: 'Mono', fontSize: 16, color: hecho ? color : '#d6d6d2' },
          hecho && h('div', { width: 6, height: 11, borderRight: `2px solid ${color}`, borderBottom: `2px solid ${color}`, transform: 'rotate(45deg)', margin: '0 12px 4px 3px' }),
          hecho ? l.replace(/^[✓✔]\s*/, '') : l)
      }),
    ),
  )
}

// Lo que comparten las plantillas de El CEO agéntico.
const CEO = { fondo: '#060a14', texto: '#ffffff', acento: '#3ef2a4' }
const ceoFondo = (p) => `radial-gradient(circle at 10% 20%, #1c2a3f 0%, ${p.fondo} 55%)`

/** El logo en dos renglones, con el episodio (p.sitio) en una pastilla al lado. */
const ceoLogo = (p, tam, conEpisodio = true) =>
  h('div', { alignItems: 'center' },
    h('div', { flexDirection: 'column', fontFamily: 'Lilita', fontSize: tam, lineHeight: 0.95, textTransform: 'uppercase' },
      h('div', {}, 'El CEO'),
      h('div', { color: p.acento }, 'agéntico'),
    ),
    conEpisodio && p.sitio && h('div', { marginLeft: 18, padding: '6px 14px', borderRadius: 999, border: `2px solid ${p.acento}`, color: p.acento, fontFamily: 'Mono', fontSize: 16, letterSpacing: '0.12em', textTransform: 'uppercase' }, p.sitio),
  )

/** Una de las dos personas de la conversación: foto recortada (o iniciales) y su nombre. */
function ceoPersona(p, src, nombre, w, alto, voltear = false) {
  // Las fotos recortadas suelen ser más anchas que su columna: se enciman un poco.
  const ancho = Math.round(w * 1.4)
  const etiqueta = Math.max(14, Math.round(w / 15))
  return h('div', { flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', width: w, height: alto, position: 'relative' },
    src
      ? img(src, { position: 'absolute', bottom: 0, left: Math.round((w - ancho) / 2), width: ancho, height: alto, objectFit: 'contain', objectPosition: 'bottom', ...(voltear ? { transform: 'scaleX(-1)' } : {}) })
      : h('div', { alignItems: 'center', justifyContent: 'center', width: Math.round(w * 0.75), height: Math.round(w * 0.75), marginBottom: etiqueta * 4, borderRadius: 999, background: '#1a2233', border: `4px solid ${p.acento}`, fontSize: Math.round(w * 0.28), fontWeight: 700 }, iniciales(nombre)),
    h('div', { position: 'absolute', bottom: Math.round(etiqueta * 0.9), padding: '6px 14px', borderRadius: 8, background: p.fondo, border: `2px solid ${p.acento}`, fontSize: etiqueta, fontWeight: 700, whiteSpace: 'nowrap' }, nombre),
  )
}

// Silueta aproximada de América en coordenadas del disco (0 a 1), de norte a sur.
const AMERICA = [[0.22, 0.12], [0.42, 0.06], [0.62, 0.1], [0.7, 0.2], [0.6, 0.3], [0.56, 0.4], [0.46, 0.46], [0.42, 0.52],
  [0.5, 0.55], [0.66, 0.6], [0.74, 0.68], [0.66, 0.78], [0.58, 0.88], [0.52, 0.94], [0.5, 0.84], [0.44, 0.7], [0.4, 0.58],
  [0.34, 0.5], [0.28, 0.38], [0.18, 0.28]]
const dentro = (x, y, pol) => pol.reduce((d, [xi, yi], i) => {
  const [xj, yj] = pol.at(i - 1)
  return (yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi ? !d : d
}, false)

/** El planeta: red de puntos de luz sobre América, como SVG (sin imagen que subir). */
function planeta(acento, lado) {
  // Pseudoazar fijo: la misma imagen en cada build.
  let semilla = 7
  const azar = () => ((semilla = (semilla * 16807) % 2147483647) / 2147483647)
  const nodos = []
  for (let y = 0.08; y < 0.96; y += 0.045) {
    for (let x = 0.15; x < 0.78; x += 0.045) {
      const px = x + (azar() - 0.5) * 0.03, py = y + (azar() - 0.5) * 0.03
      // Corrida a la izquierda: el disco se recorta por la derecha en el lienzo.
      if (dentro(px, py, AMERICA) && azar() > 0.25) nodos.push([(0.06 + px * 0.78) * lado, py * lado])
    }
  }
  const lineas = []
  nodos.forEach(([x1, y1], i) => nodos.slice(i + 1).forEach(([x2, y2]) => {
    if (Math.hypot(x2 - x1, y2 - y1) < lado * 0.07) lineas.push(`M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`)
  }))
  const r = lado / 2
  const arcos = [0.22, 0.38].map((k) => `<ellipse cx="${r}" cy="${r}" rx="${r * 0.98}" ry="${r * k}" transform="rotate(-24 ${r} ${r})" fill="none" stroke="${acento}" stroke-opacity="0.35" stroke-dasharray="2 5"/>`).join('')
  const puntos = nodos.map(([x, y], i) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${i % 5 ? lado * 0.004 : lado * 0.008}"/>`).join('')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${lado}" height="${lado}" viewBox="0 0 ${lado} ${lado}">`
    + `<defs><radialGradient id="g" cx="0.42" cy="0.45" r="0.6"><stop offset="0" stop-color="${acento}" stop-opacity="0.16"/><stop offset="1" stop-color="${acento}" stop-opacity="0"/></radialGradient>`
    + `<filter id="b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${(lado * 0.006).toFixed(1)}"/></filter></defs>`
    + `<circle cx="${r}" cy="${r}" r="${r}" fill="url(#g)"/>${arcos}`
    + `<path d="${lineas.join('')}" stroke="${acento}" stroke-opacity="0.55" stroke-width="${(lado * 0.0018).toFixed(2)}" fill="none"/>`
    + `<g fill="${acento}" filter="url(#b)">${puntos}</g><g fill="#ffe2cc">${puntos}</g></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export const PLANTILLAS = {
  marca: {
    nombre: 'Marca',
    descripcion: 'Título grande a la izquierda, subtítulo y firma abajo. La de gabrielneuman.com.',
    cuando: 'El post es una idea o postura de Gabriel, sin dato ni evento. La opción por defecto.',
    campos: ['titulo', 'sub', 'autor', 'sitio', 'foto', 'fondo', 'texto', 'acento'],
    ejemplo: { titulo: 'Equipos chicos, *resultados grandes*', sub: 'Director de IA fraccional', autor: 'Gabriel Neuman', sitio: 'gabrielneuman.com' },
    dibujar: (p) =>
      h('div', { width: p.W, height: p.H, display: 'flex', flexDirection: 'column', justifyContent: p.alto ? 'center' : 'space-between', padding: p.alto ? '56px 52px' : '72px 80px', background: p.fondo, color: p.texto },
        h('div', { display: 'flex', flexDirection: 'column', maxWidth: 900 },
          h('div', { display: 'flex', flexWrap: 'wrap', fontSize: escala(p.titulo, [[24, 84], [44, 72], [70, 60], [100, 50], [999, 42]]) * (p.alto ? 1.25 : 1), fontWeight: 700, lineHeight: 1.06, letterSpacing: '-0.025em' }, resaltar(p.titulo, p.acento)),
          p.sub && h('div', { marginTop: 28, fontSize: p.alto ? 36 : 30, fontWeight: 500, lineHeight: 1.35, color: p.suave }, p.sub),
        ),
        h('div', { marginTop: p.alto ? 56 : 0 }, firma(p, p.suave)),
      ),
  },

  articulo: {
    nombre: 'Artículo',
    descripcion: 'Título, extracto y autor con foto. Para posts de blog y newsletters.',
    cuando: 'El post enlaza a un artículo, newsletter o guía larga.',
    campos: ['titulo', 'extracto', 'autor', 'foto', 'sitio', 'fondo', 'texto', 'acento'],
    ejemplo: { titulo: 'Cómo dirigir agentes de IA sin escribir código', extracto: 'Lo que cambia cuando el equipo deja de pedirle cosas a ChatGPT y empieza a delegarle trabajo.', autor: 'Gabriel Neuman', sitio: 'gabrielneuman.com' },
    dibujar: (p) =>
      h('div', { width: p.W, height: p.H, display: 'flex', flexDirection: 'column', justifyContent: p.alto ? 'center' : 'space-between', padding: p.alto ? 52 : 64, background: p.fondo, color: p.texto, borderTop: `14px solid ${p.acento}` },
        h('div', { display: 'flex', flexDirection: 'column' },
          h('div', { display: 'flex', flexWrap: 'wrap', fontSize: escala(p.titulo, [[40, 66], [70, 56], [100, 48], [999, 40]]) * (p.alto ? 1.3 : 1), fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em' }, resaltar(p.titulo, p.acento)),
          p.extracto && h('div', { marginTop: 24, fontSize: p.alto ? 34 : 30, fontWeight: 500, lineHeight: 1.4, color: p.suave }, p.extracto),
        ),
        h('div', { marginTop: p.alto ? 56 : 0 }, firma(p, p.suave)),
      ),
  },

  titular: {
    nombre: 'Titular',
    descripcion: 'Un titular centrado con una palabra resaltada y un botón. Para landings.',
    cuando: 'El post cabe en una frase fuerte y no trae lista, cifra ni comparación.',
    campos: ['titulo', 'sub', 'boton', 'fondo', 'texto', 'acento'],
    ejemplo: { titulo: 'Imágenes OG en *un minuto*', sub: 'En español, gratis y de código abierto.', boton: 'Hacer la mía' },
    dibujar: (p) =>
      h('div', { width: p.W, height: p.H, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 80, background: p.fondo, color: p.texto, textAlign: 'center' },
        h('div', { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', fontSize: escala(p.titulo, [[24, 92], [44, 76], [70, 62], [999, 50]]), fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.03em' }, resaltar(p.titulo, p.acento)),
        p.sub && h('div', { marginTop: 28, fontSize: 32, fontWeight: 500, color: p.suave }, p.sub),
        p.boton && h('div', { marginTop: 44, padding: '20px 52px', borderRadius: 999, background: p.acento, color: p.sobreAcento, fontSize: 32, fontWeight: 700 }, p.boton),
      ),
  },

  emoji: {
    nombre: 'Emoji',
    descripcion: 'Un emoji grande sobre degradado, con título opcional.',
    cuando: 'Anuncio corto y alegre: un lanzamiento, un logro, una novedad.',
    campos: ['emoji', 'titulo', 'fondo', 'acento', 'texto'],
    ejemplo: { emoji: '🚀', titulo: 'Lanzamos la versión 2', fondo: '#3b5bdb', acento: '#e2553d', texto: '#ffffff' },
    dibujar: (p) =>
      h('div', { width: p.W, height: p.H, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundImage: `linear-gradient(135deg, ${p.fondo}, ${p.acento})`, color: p.texto },
        h('div', { display: 'flex', fontSize: p.titulo ? 200 : 300, lineHeight: 1 }, p.emoji || '✨'),
        p.titulo && h('div', { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', marginTop: 40, padding: '0 80px', fontSize: escala(p.titulo, [[30, 64], [60, 52], [999, 42]]), fontWeight: 700, textAlign: 'center' }, p.titulo),
      ),
  },

  icono: {
    nombre: 'Ícono',
    descripcion: 'Un ícono de Lucide en recuadro, título y subtítulo. Para docs y features.',
    cuando: 'El post explica una función o una tarea concreta que se automatiza.',
    campos: ['icono', 'titulo', 'sub', 'fondo', 'texto', 'acento'],
    ejemplo: { icono: 'workflow', titulo: 'Automatiza la cobranza', sub: 'Recordatorios que salen solos, con tu tono.' },
    dibujar: (p) =>
      h('div', { width: p.W, height: p.H, display: 'flex', flexDirection: p.alto ? 'column' : 'row', alignItems: p.alto ? 'flex-start' : 'center', justifyContent: 'center', padding: '0 90px', background: p.fondo, color: p.texto },
        h('div', { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 260, height: 260, borderRadius: 48, background: p.acento, flexShrink: 0 },
          p.iconoSvg && img(p.iconoSvg, { width: 150, height: 150 }),
        ),
        h('div', { display: 'flex', flexDirection: 'column', marginLeft: p.alto ? 0 : 70, marginTop: p.alto ? 60 : 0, flex: p.alto ? undefined : 1, width: p.alto ? p.W - 180 : undefined },
          h('div', { display: 'flex', flexWrap: 'wrap', fontSize: escala(p.titulo, [[24, 72], [44, 60], [999, 48]]), fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.02em' }, resaltar(p.titulo, p.acento)),
          p.sub && h('div', { marginTop: 22, fontSize: 30, fontWeight: 500, lineHeight: 1.35, color: p.suave }, p.sub),
        ),
      ),
  },

  perfil: {
    nombre: 'Perfil',
    descripcion: 'Foto redonda, nombre y rol. Para páginas de autor, equipo o ponentes.',
    cuando: 'El post presenta a una persona: un invitado, alguien del equipo, un cliente con nombre.',
    campos: ['foto', 'autor', 'sub', 'sitio', 'fondo', 'texto', 'acento'],
    ejemplo: { autor: 'Gabriel Neuman', sub: 'Director de IA fraccional', sitio: 'gabrielneuman.com' },
    dibujar: (p) =>
      h('div', { width: p.W, height: p.H, display: 'flex', flexDirection: p.alto ? 'column' : 'row', alignItems: 'center', justifyContent: 'center', padding: '0 80px', background: p.fondo, color: p.texto, textAlign: p.alto ? 'center' : 'left' },
        p.foto
          ? img(p.foto, { width: 300, height: 300, borderRadius: 999, objectFit: 'cover', border: `10px solid ${p.acento}` })
          : h('div', { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 300, height: 300, borderRadius: 999, background: p.acento, color: p.sobreAcento, fontSize: 130, fontWeight: 700 }, iniciales(p.autor)),
        h('div', { display: 'flex', flexDirection: 'column', alignItems: p.alto ? 'center' : 'flex-start', marginLeft: p.alto ? 0 : 64, marginTop: p.alto ? 56 : 0, maxWidth: p.alto ? p.W - 160 : 640 },
          h('div', { fontSize: escala(p.autor, [[18, 76], [30, 62], [999, 50]]), fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.05 }, p.autor || 'Tu nombre'),
          p.sub && h('div', { marginTop: 18, fontSize: 34, fontWeight: 500, color: p.suave }, p.sub),
          p.sitio && h('div', { marginTop: 30, fontSize: 28, color: p.acento, fontWeight: 700 }, p.sitio),
        ),
      ),
  },

  boton: {
    nombre: 'Botón',
    descripcion: 'Emoji, titular y una llamada a la acción en píldora. Para ofertas y eventos.',
    cuando: 'El post pide una acción directa: registrarse, descargar, escribir.',
    campos: ['emoji', 'titulo', 'boton', 'fondo', 'texto', 'acento'],
    ejemplo: { emoji: '📅', titulo: 'Taller en vivo: tu primer agente', boton: 'Aparta tu lugar' },
    dibujar: (p) =>
      h('div', { width: p.W, height: p.H, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 80, background: p.fondo, color: p.texto, textAlign: 'center' },
        p.emoji && h('div', { display: 'flex', fontSize: 110, lineHeight: 1, marginBottom: 30 }, p.emoji),
        h('div', { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', fontSize: escala(p.titulo, [[30, 72], [60, 58], [999, 46]]), fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em' }, resaltar(p.titulo, p.acento)),
        h('div', { display: 'flex', marginTop: 48, padding: '24px 64px', borderRadius: 999, background: p.acento, color: p.sobreAcento, fontSize: 36, fontWeight: 700 }, p.boton || 'Empieza aquí'),
      ),
  },

  captura: {
    nombre: 'Captura',
    descripcion: 'Una captura de pantalla dentro de una ventana de navegador, con título arriba.',
    cuando: 'El post habla de un sitio o pantalla y hay captura real que enseñar.',
    campos: ['imagen', 'titulo', 'sitio', 'fondo', 'texto', 'acento'],
    ejemplo: { titulo: 'Equipos chicos, resultados grandes', sitio: 'gabrielneuman.com', imagen: '/muestras/captura.png' },
    dibujar: (p) =>
      h('div', { width: p.W, height: p.H, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 56, background: p.fondo, color: p.texto, overflow: 'hidden' },
        h('div', { flexShrink: 0, fontSize: escala(p.titulo, [[34, 54], [60, 44], [999, 38]]), fontWeight: 700, letterSpacing: '-0.02em', padding: '0 80px', textAlign: 'center' }, p.titulo),
        h('div', { flexDirection: 'column', flexShrink: 0, marginTop: 40, width: 1000, height: 560, borderRadius: 18, overflow: 'hidden', background: '#ffffff', border: '1px solid rgba(255,255,255,0.15)' },
          h('div', { display: 'flex', alignItems: 'center', height: 44, padding: '0 18px', background: '#e8e8ec' },
            ...['#ff5f57', '#febc2e', '#28c840'].map((c) => h('div', { width: 14, height: 14, borderRadius: 99, background: c, marginRight: 8 })),
            p.sitio && h('div', { display: 'flex', marginLeft: 20, padding: '4px 16px', borderRadius: 8, background: '#ffffff', color: '#555', fontSize: 18 }, p.sitio),
          ),
          p.imagen
            ? img(p.imagen, { width: 1000, height: 516, objectFit: 'cover', objectPosition: 'top' })
            : h('div', { display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: 28 }, 'Pon tu captura en ?imagen='),
        ),
      ),
  },

  telefono: {
    nombre: 'Teléfono',
    descripcion: 'Una captura vertical dentro de un teléfono, con título y subtítulo al lado.',
    cuando: 'El post habla de una app o algo que se usa desde el celular y hay captura vertical.',
    campos: ['imagen', 'titulo', 'sub', 'fondo', 'texto', 'acento'],
    ejemplo: { titulo: 'El curso, en *tu celular*', sub: 'Ocho semanas para dirigir agentes de IA en tu empresa.', imagen: '/muestras/telefono.png' },
    dibujar: (p) =>
      h('div', { width: p.W, height: p.H, display: 'flex', flexDirection: p.alto ? 'column' : 'row', alignItems: p.alto ? 'flex-start' : 'center', padding: p.alto ? '110px 90px 0' : '0 0 0 90px', background: p.fondo, color: p.texto, overflow: 'hidden' },
        h('div', { display: 'flex', flexDirection: 'column', width: p.alto ? p.W - 180 : 600 },
          h('div', { display: 'flex', flexWrap: 'wrap', fontSize: escala(p.titulo, [[24, 70], [44, 58], [999, 46]]), fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.02em' }, resaltar(p.titulo, p.acento)),
          p.sub && h('div', { marginTop: 22, fontSize: 30, fontWeight: 500, lineHeight: 1.35, color: p.suave }, p.sub),
        ),
        h('div', { alignSelf: p.alto ? 'center' : 'flex-start', flexShrink: 0, marginLeft: p.alto ? 0 : 90, marginTop: p.alto ? 70 : 90, width: 340, height: 700, padding: 14, borderRadius: 56, background: '#111', border: '2px solid rgba(255,255,255,0.18)' },
          p.imagen
            ? img(p.imagen, { width: 312, height: 672, borderRadius: 44, objectFit: 'cover', objectPosition: 'top' })
            : h('div', { display: 'flex', width: 312, height: 672, borderRadius: 44, background: p.acento }),
        ),
      ),
  },
  ciudad: {
    nombre: 'Ciudad',
    descripcion: 'La ciudad y la bandera de quien la ve, detectadas por su conexión. También se fijan por URL.',
    cuando: 'El post es de un evento presencial o de algo que pasa en una ciudad o país.',
    campos: ['titulo', 'sub', 'ciudad', 'pais', 'imagen', 'autor', 'fondo', 'texto', 'acento'],
    ejemplo: { titulo: 'Taller presencial en {ciudad}', sub: 'Cupo para 20 personas', ciudad: 'Ciudad de México', pais: 'MX', autor: 'Gabriel Neuman' },
    dibujar: (p) => {
      const lugar = (t) => t.replaceAll('{ciudad}', p.ciudad || p.nombrePais || 'tu ciudad').replaceAll('{pais}', p.nombrePais || 'tu país')
      return h('div', { width: p.W, height: p.H, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 80, color: p.texto, textAlign: 'center', backgroundImage: p.imagen ? `linear-gradient(rgba(15,23,51,0.55), rgba(15,23,51,0.8)), url(${p.imagen})` : `linear-gradient(135deg, ${p.fondo}, ${p.acento})`, backgroundSize: `${p.W}px ${p.H}px` },
        p.bandera && h('div', { fontSize: 120, lineHeight: 1, marginBottom: 28 }, p.bandera),
        h('div', { flexWrap: 'wrap', justifyContent: 'center', fontSize: escala(lugar(p.titulo), [[30, 76], [55, 62], [999, 48]]), fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.02em' }, resaltar(lugar(p.titulo), p.acento === p.fondo ? p.texto : '#ffd27a')),
        p.sub && h('div', { marginTop: 24, fontSize: 32, fontWeight: 500, opacity: 0.9 }, lugar(p.sub)),
        p.autor && h('div', { marginTop: 44, padding: '12px 32px', borderRadius: 999, background: 'rgba(255,255,255,0.15)', fontSize: 26, fontWeight: 700 }, p.autor),
      )
    },
  },

  cita: {
    nombre: 'Cita',
    descripcion: 'Una frase entre comillas con quién la dijo. Para entrevistas, testimonios y podcast.',
    cuando: 'El post gira alrededor de una frase textual de alguien (cliente, invitado, Gabriel).',
    campos: ['titulo', 'autor', 'sub', 'foto', 'fondo', 'texto', 'acento'],
    ejemplo: { titulo: 'Si me voy mañana, *sigue corriendo*.', autor: 'Gabriel Neuman', sub: 'Director de IA fraccional' },
    dibujar: (p) =>
      h('div', { width: p.W, height: p.H, flexDirection: 'column', justifyContent: 'center', padding: '0 110px', background: p.fondo, color: p.texto },
        h('div', { fontSize: 200, lineHeight: 0.6, color: p.acento, fontWeight: 700, height: 90 }, '“'),
        h('div', { flexWrap: 'wrap', fontSize: escala(p.titulo, [[40, 70], [80, 56], [140, 46], [999, 40]]), fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.02em' }, resaltar(p.titulo, p.acento)),
        (p.autor || p.foto) && h('div', { alignItems: 'center', marginTop: 48 },
          p.foto && img(p.foto, { width: 72, height: 72, borderRadius: 999, marginRight: 20, objectFit: 'cover' }),
          h('div', { flexDirection: 'column' },
            p.autor && h('span', { fontSize: 30, fontWeight: 700 }, p.autor),
            p.sub && h('span', { fontSize: 24, color: p.suave, marginTop: 4 }, p.sub),
          ),
        ),
      ),
  },

  cifra: {
    nombre: 'Cifra',
    descripcion: 'Un número enorme y qué significa. Para resultados, reportes y casos.',
    cuando: 'El post trae UN número real del caso que es el corazón del mensaje. Nunca sin cifra en el texto.',
    campos: ['cifra', 'titulo', 'sub', 'sitio', 'fondo', 'texto', 'acento'],
    ejemplo: { cifra: '595', titulo: 'imágenes OG en cada build', sub: 'Una por página, sin diseñarlas a mano', sitio: 'gabrielneuman.com' },
    dibujar: (p) =>
      h('div', { width: p.W, height: p.H, flexDirection: 'column', justifyContent: 'center', padding: '0 90px', background: p.fondo, color: p.texto },
        h('div', { fontSize: escala(p.cifra || '0', [[3, 260], [5, 210], [8, 160], [999, 120]]), fontWeight: 700, lineHeight: 0.95, letterSpacing: '-0.05em', color: p.acento }, p.cifra || '0'),
        h('div', { flexWrap: 'wrap', marginTop: 18, fontSize: escala(p.titulo, [[30, 56], [60, 46], [999, 38]]), fontWeight: 700, lineHeight: 1.1 }, resaltar(p.titulo, p.acento)),
        p.sub && h('div', { marginTop: 16, fontSize: 28, color: p.suave }, p.sub),
        p.sitio && h('div', { position: 'absolute', right: 90, bottom: 60, fontSize: 24, color: p.suave }, p.sitio),
      ),
  },

  versus: {
    nombre: 'Versus',
    descripcion: 'Dos opciones lado a lado. Para comparativas: esto contra aquello.',
    cuando: 'El post compara dos opciones en pocas palabras: esto contra aquello.',
    campos: ['titulo', 'izquierda', 'derecha', 'fondo', 'texto', 'acento'],
    ejemplo: { titulo: '¿Contratar o automatizar?', izquierda: 'Un asistente más', derecha: 'Un agente de IA' },
    dibujar: (p) => {
      const lado = (t, activo) => h('div', { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, borderRadius: 28, background: activo ? p.acento : 'rgba(255,255,255,0.08)', color: activo ? p.sobreAcento : p.texto, fontSize: escala(t, [[16, 52], [30, 42], [999, 34]]), fontWeight: 700, textAlign: 'center' }, t)
      return h('div', { width: p.W, height: p.H, flexDirection: 'column', padding: 70, background: p.fondo, color: p.texto },
        h('div', { justifyContent: 'center', fontSize: escala(p.titulo, [[30, 60], [60, 48], [999, 40]]), fontWeight: 700, letterSpacing: '-0.02em', textAlign: 'center' }, p.titulo),
        h('div', { flex: 1, flexDirection: p.alto ? 'column' : 'row', alignItems: 'stretch', marginTop: 50 },
          lado(p.izquierda || 'A', false),
          h('div', { alignItems: 'center', justifyContent: 'center', width: p.alto ? undefined : 110, height: p.alto ? 110 : undefined, fontSize: 40, fontWeight: 700, color: p.suave }, 'vs'),
          lado(p.derecha || 'B', true),
        ),
      )
    },
  },

  evento: {
    nombre: 'Evento',
    descripcion: 'Fecha grande, nombre del evento, lugar y botón. Para talleres, webinars y lanzamientos.',
    cuando: 'El post invita a un evento con fecha: taller, webinar, lanzamiento.',
    campos: ['fecha', 'titulo', 'lugar', 'boton', 'fondo', 'texto', 'acento'],
    ejemplo: { fecha: '29 OCT', titulo: 'Tu primer empleado de IA', lugar: 'En vivo por Zoom · 19:00 CDMX', boton: 'Aparta tu lugar' },
    dibujar: (p) => {
      const [dia, ...mes] = (p.fecha || '1 ENE').split(/\s+/)
      return h('div', { width: p.W, height: p.H, flexDirection: p.alto ? 'column' : 'row', alignItems: p.alto ? 'flex-start' : 'center', justifyContent: 'center', padding: '0 90px', background: p.fondo, color: p.texto },
        h('div', { flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 280, height: 320, borderRadius: 36, background: p.acento, color: p.sobreAcento, flexShrink: 0 },
          h('div', { fontSize: 150, fontWeight: 700, lineHeight: 1 }, dia),
          mes.length > 0 && h('div', { fontSize: 46, fontWeight: 700, letterSpacing: '0.08em', marginTop: 8 }, mes.join(' ').toUpperCase()),
        ),
        h('div', { flexDirection: 'column', marginLeft: p.alto ? 0 : 70, marginTop: p.alto ? 60 : 0, flex: p.alto ? undefined : 1 },
          h('div', { flexWrap: 'wrap', fontSize: escala(p.titulo, [[24, 68], [44, 56], [999, 46]]), fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.02em' }, resaltar(p.titulo, p.acento)),
          p.lugar && h('div', { marginTop: 22, fontSize: 30, color: p.suave }, p.lugar),
          p.boton && h('div', { marginTop: 40, alignSelf: 'flex-start', padding: '16px 40px', borderRadius: 999, border: `3px solid ${p.acento}`, color: p.texto, fontSize: 28, fontWeight: 700 }, p.boton),
        ),
      )
    },
  },

  duelo: {
    nombre: 'Duelo',
    descripcion: 'Fondo negro, titular gordo y dos terminales cara a cara con un VS. Para webinars y comparativas de herramientas.',
    cuando: 'El post o evento compara dos herramientas o formas de trabajar, con ejemplos de qué hace cada una.',
    campos: ['sub', 'titulo', 'fecha', 'lugar', 'izquierda', 'derecha', 'fondo', 'texto', 'acento'],
    marca: { fondo: '#0b0b0b', texto: '#f4f4f0', acento: '#ffe500' },
    ejemplo: {
      sub: '*En vivo* · Sesión de preguntas',
      titulo: 'Cómo elegir entre *n8n* y *Claude Code*',
      fecha: 'Jueves 29 de octubre',
      lugar: '19:00 CDMX · 45 min · *Gratis en Zoom*',
      izquierda: 'n8n | > arma el reporte de ventas | ✓ lee Sheets, CRM y correo | ✓ todos los lunes a las 8:00',
      derecha: 'Claude Code | > hazme un portal de clientes | ✓ login, facturas y tickets | ✓ vista previa en localhost:3000',
    },
    dibujar: (p) => {
      const verde = '#3ddbb0'
      return h('div', { width: p.W, height: p.H, flexDirection: p.alto ? 'column' : 'row', alignItems: 'center', justifyContent: p.alto ? 'center' : 'flex-start', padding: p.alto ? '0 72px' : '0 0 0 64px', background: p.fondo, color: p.texto },
        h('div', { flexDirection: 'column', width: p.alto ? p.W - 144 : 640 },
          p.sub && h('div', { alignItems: 'center', fontFamily: 'Mono', fontSize: 19, letterSpacing: '0.14em', color: p.suave },
            h('div', { width: 13, height: 13, borderRadius: 99, background: '#ff5a3c', marginRight: 14 }),
            h('div', { flexWrap: 'wrap' }, monoResaltado(p.sub.toUpperCase(), '#ff5a3c')),
          ),
          h('div', { flexWrap: 'wrap', marginTop: 22, fontFamily: 'Lilita', fontSize: escala(p.titulo, p.alto ? [[30, 58], [50, 50], [999, 42]] : [[30, 70], [50, 60], [999, 50]]), lineHeight: 1.02, textTransform: 'uppercase' }, resaltar(p.titulo, p.acento)),
          h('div', { width: 110, height: 7, background: p.acento, marginTop: 34 }),
          p.fecha && h('div', { marginTop: 30, fontFamily: 'Lilita', fontSize: 40 }, p.fecha),
          p.lugar && h('div', { flexWrap: 'wrap', marginTop: 16, fontFamily: 'Mono', fontSize: 21, letterSpacing: '0.06em', color: p.suave }, monoResaltado(p.lugar.toUpperCase(), p.acento)),
        ),
        h('div', { flexDirection: 'column', flex: p.alto ? undefined : 1, alignItems: 'center', justifyContent: 'center', height: p.alto ? undefined : p.H, marginTop: p.alto ? 40 : 0 },
          ventana(p, p.izquierda || 'Opción A', 'CONTENDIENTE 01', verde, { transform: 'rotate(-2deg) translateX(-10px)' }),
          h('div', { alignItems: 'center', justifyContent: 'center', width: 84, height: 84, borderRadius: 99, background: p.acento, border: `5px solid ${p.fondo}`, color: p.fondo, fontFamily: 'Lilita', fontSize: 34, margin: '-26px 0', boxShadow: `0 0 34px ${p.acento}` }, 'VS'),
          ventana(p, p.derecha || 'Opción B', 'CONTENDIENTE 02', p.acento, { transform: 'rotate(1.5deg) translateX(18px)', border: `2px solid ${p.acento}55` }),
        ),
      )
    },
  },

  cohort: {
    nombre: 'Cohort',
    descripcion: 'Nombre del programa en grande, etiqueta amarilla, una terminal con lo que incluye y franja con la fecha de arranque. Para cohorts y cursos en vivo.',
    cuando: 'El post vende o anuncia un programa de varias sesiones: cohort, curso en vivo, mastermind.',
    campos: ['titulo', 'sub', 'puntos', 'fecha', 'sitio', 'fondo', 'texto', 'acento'],
    marca: { fondo: '#0b0b0b', texto: '#f4f4f0', acento: '#ffe500' },
    ejemplo: {
      titulo: 'Copiloto en 4 semanas',
      sub: 'Cohort en vivo',
      puntos: '4 sesiones de 90 min con demos reales | 3 talleres para configurarlo contigo | 1 experto invitado | Grabaciones de por vida',
      fecha: 'Arranca el 9 de noviembre',
      sitio: 'gabrielneuman.com/cohort',
    },
    dibujar: (p) => {
      const puntos = (p.puntos || '').split(/\s*[|;]\s*/).filter(Boolean).slice(0, 4)
      return h('div', { width: p.W, height: p.H, flexDirection: 'column', alignItems: 'center', justifyContent: p.alto ? 'center' : 'flex-start', paddingTop: p.alto ? 0 : 40, paddingBottom: p.alto ? 120 : 0, background: p.fondo, color: p.texto },
        h('div', { justifyContent: 'center', flexWrap: 'wrap', maxWidth: p.W - 100, textAlign: 'center', fontFamily: 'Lilita', fontSize: escala(p.titulo, p.alto ? [[18, 60], [28, 50], [999, 42]] : [[18, 76], [28, 62], [999, 50]]), lineHeight: 1, textTransform: 'uppercase', transform: 'skewX(-8deg)' }, p.titulo),
        p.sub && h('div', { marginTop: 14, padding: '6px 30px', background: p.acento, color: p.fondo, fontFamily: 'Lilita', fontSize: 40, textTransform: 'uppercase', transform: 'skewX(-8deg) rotate(-1.5deg)' }, p.sub),
        h('div', { flexDirection: 'column', width: Math.min(760, p.W - 120), marginTop: p.alto ? 60 : 30, borderRadius: 16, background: '#1c1d1f', border: '2px solid #2c2d30', transform: 'rotate(-1.2deg)', boxShadow: '0 30px 60px rgba(0,0,0,0.6)' },
          h('div', { alignItems: 'center', padding: '14px 20px', borderBottom: '2px solid #2c2d30' },
            ...['#ff5f57', '#febc2e', '#28c840'].map((c) => h('div', { width: 13, height: 13, borderRadius: 99, background: c, marginRight: 9 })),
            h('div', { marginLeft: 18, padding: '2px 0', borderBottom: `3px solid ${p.acento}`, fontFamily: 'Mono', fontSize: 18 }, 'PROGRAMA.md'),
          ),
          h('div', { flexDirection: 'column', padding: '14px 26px 20px' },
            h('div', { fontFamily: 'Mono', fontSize: p.alto ? 17 : 21 }, h('span', { color: '#6b6d72', width: 34 }, '1'), h('span', { color: p.acento }, '## Lo que incluye')),
            ...puntos.map((t, i) => h('div', { marginTop: 8, fontFamily: 'Mono', fontSize: p.alto ? 17 : 21 },
              h('span', { color: '#6b6d72', width: 34 }, String(i + 2)),
              h('span', {}, `- ${t}`),
            )),
          ),
        ),
        h('div', { position: 'absolute', left: p.alto ? 40 : 60, right: p.alto ? 40 : 60, bottom: 30, flexDirection: p.alto ? 'column' : 'row', alignItems: p.alto ? 'flex-start' : 'center', justifyContent: 'center', height: p.alto ? 104 : 64, padding: '0 34px', background: p.acento, color: p.fondo, transform: 'skewX(-14deg)' },
          p.fecha && h('div', { fontFamily: 'Lilita', fontSize: 32, textTransform: 'uppercase', whiteSpace: 'nowrap' }, p.fecha),
          p.sitio && h('div', { marginLeft: p.alto ? 0 : 26, marginTop: p.alto ? 4 : 0, fontSize: 27, fontWeight: 700, whiteSpace: 'nowrap' }, p.sitio),
          !p.alto && h('div', { marginLeft: 'auto' }, ...[0, 1, 2, 3, 4, 5].map(() => h('div', { width: 11, height: 64, background: p.fondo, marginLeft: 11 }))),
        ),
      )
    },
  },

  miniatura: {
    nombre: 'Miniatura',
    descripcion: 'Estilo miniatura de YouTube: titular gordo por renglones en neón y blanco, persona recortada, ventana con flecha, gráfica rosa que sube y botón de play.',
    cuando: 'El post presume un resultado o enlaza a un video, una demo o un caso; mejor con foto recortada (PNG sin fondo) de la persona.',
    campos: ['titulo', 'boton', 'foto', 'imagen', 'fondo', 'texto', 'acento'],
    marca: { fondo: '#0a0f2c', texto: '#ffffff', acento: '#ffe94a' },
    ejemplo: { titulo: '*Copiloto en* | *4 semanas* | sin contratar | a nadie más | *con IA*', boton: 'Ver ahora', foto: '/muestras/persona.png', imagen: '/muestras/captura.png' },
    dibujar: (p) => {
      const rosa = '#ff2d87'
      const morado = '#7b5cff'
      const svg = (cuerpo, vb) => `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${cuerpo}</svg>`)}`

      // Titular por renglones (separados con |). Un renglón con *asteriscos* sale en
      // neón y más grande; los demás en blanco. Cada renglón se ajusta a su ancho.
      const anchoTitulo = p.alto ? p.W - 100 : Math.round(p.W * 0.47)
      const renglones = p.titulo.includes('|') ? p.titulo.split(/\s*\|\s*/).filter(Boolean).slice(0, 6) : null
      const brillo = `0 0 22px ${p.acento}99, 0 0 6px ${p.acento}`
      const lineas = (renglones ?? []).map((r) => {
        const neon = /\*/.test(r)
        const texto = r.replace(/\*/g, '').toUpperCase()
        const tope = neon ? (p.alto ? 72 : 96) : (p.alto ? 50 : 64)
        return { neon, texto, tam: Math.min(tope, Math.floor(anchoTitulo / (texto.length * 0.56))) }
      })
      // Alto del titular, para poner la ventana debajo en los formatos altos.
      const altoTitulo = renglones ? lineas.reduce((n, l) => n + l.tam * 0.98, 0) : 3 * 70
      const titulo = renglones
        ? h('div', { flexDirection: 'column' },
            ...lineas.map(({ neon, texto, tam }) =>
              h('div', { fontFamily: 'Lilita', fontSize: tam, lineHeight: 0.98, whiteSpace: 'nowrap', color: neon ? p.acento : p.texto, textShadow: neon ? brillo : undefined }, texto)))
        : h('div', { flexWrap: 'wrap', width: anchoTitulo, fontFamily: 'Lilita', fontSize: escala(p.titulo, [[30, 84], [50, 70], [999, 56]]), lineHeight: 1, textTransform: 'uppercase', color: p.texto },
            resaltar(p.titulo, p.acento, { textShadow: brillo }))

      // Gráfica que sube, con brillo: dos trazos rosas (uno ancho y borroso) y uno morado.
      const grafica = img(svg(
        `<defs><filter id="b" x="-10%" y="-50%" width="120%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>` +
        `<linearGradient id="a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${morado}" stop-opacity="0.35"/><stop offset="1" stop-color="${morado}" stop-opacity="0"/></linearGradient></defs>` +
        `<path d="M0 230 L160 200 L300 215 L470 150 L620 170 L800 95 L1000 60 L1200 20 L1200 260 L0 260 Z" fill="url(#a)"/>` +
        `<polyline points="0,250 180,235 330,245 500,190 650,205 830,140 1020,110 1200,60" fill="none" stroke="${morado}" stroke-width="4"/>` +
        `<polyline points="0,230 160,200 300,215 470,150 620,170 800,95 1000,60 1200,20" fill="none" stroke="${rosa}" stroke-width="14" filter="url(#b)" opacity="0.8"/>` +
        `<polyline points="0,230 160,200 300,215 470,150 620,170 800,95 1000,60 1200,20" fill="none" stroke="${rosa}" stroke-width="4"/>`,
        '0 0 1200 260'), { position: 'absolute', left: 0, bottom: 0, width: p.W, height: Math.round(p.W * 0.22) })

      const anchoVentana = p.alto ? Math.round(p.W * 0.62) : 400
      const ventana = h('div', { flexDirection: 'column', width: anchoVentana, borderRadius: 14, overflow: 'hidden', background: '#e9ecf5', border: '3px solid rgba(255,255,255,0.3)', boxShadow: '0 24px 50px rgba(0,0,0,0.6)' },
        h('div', { alignItems: 'center', height: 28, padding: '0 12px', background: '#d6dbe8' },
          ...['#ff5f57', '#febc2e', '#28c840'].map((c) => h('div', { width: 10, height: 10, borderRadius: 99, background: c, marginRight: 6 })),
        ),
        p.imagen
          ? img(p.imagen, { width: anchoVentana, height: Math.round(anchoVentana * 0.56), objectFit: 'cover', objectPosition: 'top' })
          : h('div', { flexDirection: 'column', padding: 18, height: Math.round(anchoVentana * 0.56), background: '#f5f7fc' },
              h('div', { width: '60%', height: 18, borderRadius: 6, background: '#c5cbe0' }),
              h('div', { marginTop: 14 }, ...[0, 1, 2].map(() => h('div', { flex: 1, height: 70, marginRight: 10, borderRadius: 10, background: '#dfe4f2' }))),
            ),
      )
      const flecha = img(svg(`<path d="M10 70 C 60 5, 160 0, 205 45" fill="none" stroke="${p.acento}" stroke-width="10" stroke-linecap="round"/><path d="M182 30 L212 54 L176 62 Z" fill="${p.acento}"/>`, '0 0 220 80'), { width: 150, height: 55 })

      const boton = p.boton && h('div', { alignItems: 'center', padding: '10px 12px 10px 30px', borderRadius: 999, backgroundImage: `linear-gradient(90deg, ${rosa}, #ff6fb0)`, color: '#ffffff', fontSize: 34, fontWeight: 700, boxShadow: `0 10px 30px ${rosa}88` },
        p.boton,
        h('div', { alignItems: 'center', justifyContent: 'center', width: 50, height: 50, borderRadius: 99, background: '#ffffff', marginLeft: 20 },
          img(svg(`<path d="M0 0 L20 12 L0 24 Z" fill="${rosa}"/>`, '0 0 20 24'), { width: 18, height: 22, marginLeft: 4 }),
        ),
      )

      const altoFoto = p.alto ? Math.round(p.H * 0.42) : Math.round(p.H * 0.74)
      const aro = h('div', { position: 'absolute', width: altoFoto, height: altoFoto, borderRadius: 999, border: '2px solid rgba(255,255,255,0.08)', background: 'rgba(80,90,200,0.12)' })
      const fondo = { width: p.W, height: p.H, position: 'relative', overflow: 'hidden', backgroundImage: `radial-gradient(circle at 70% 45%, #1d2a6b 0%, ${p.fondo} 65%)`, color: p.texto }

      if (p.alto) {
        return h('div', fondo,
          grafica,
          h('div', { position: 'absolute', left: 50, top: 50 }, titulo),
          h('div', { position: 'absolute', right: 40, top: Math.round(50 + altoTitulo + 40), transform: 'rotate(3deg)' }, ventana),
          h('div', { position: 'absolute', left: Math.round(p.W * 0.06), top: Math.round(50 + altoTitulo + 10) }, flecha),
          h('div', { position: 'absolute', left: Math.round((p.W - altoFoto) / 2), bottom: 0, width: altoFoto, height: altoFoto, alignItems: 'center', justifyContent: 'center' }, aro),
          p.foto && img(p.foto, { position: 'absolute', left: Math.round(p.W * 0.12), bottom: 0, height: altoFoto, objectFit: 'contain' }),
          boton && h('div', { position: 'absolute', right: 40, bottom: 40 }, boton),
        )
      }
      return h('div', fondo,
        grafica,
        h('div', { position: 'absolute', right: 34, top: 40, transform: 'rotate(3deg)' }, ventana),
        h('div', { position: 'absolute', right: 300, top: 6, transform: 'rotate(-8deg)' }, flecha),
        h('div', { position: 'absolute', left: Math.round(p.W * 0.48), bottom: -Math.round(altoFoto * 0.1), width: altoFoto, height: altoFoto, alignItems: 'center', justifyContent: 'center' }, aro),
        p.foto && img(p.foto, { position: 'absolute', left: Math.round(p.W * 0.5), bottom: 0, height: altoFoto, objectFit: 'contain' }),
        h('div', { position: 'absolute', left: 44, top: 0, bottom: 0, alignItems: 'center' }, titulo),
        boton && h('div', { position: 'absolute', right: 40, bottom: 40 }, boton),
      )
    },
  },

  escaparate: {
    nombre: 'Escaparate',
    descripcion: 'Franja amarilla arriba, titular blanco gigante, dos íconos en mosaico brillante a los lados y la persona al centro. Para listas, herramientas y "lo mejor de la semana".',
    cuando: 'El post presenta herramientas, recursos o una selección ("las 5 herramientas que…"), sobre todo si nombra dos productos.',
    campos: ['sub', 'titulo', 'icono', 'icono2', 'foto', 'imagen', 'fondo', 'texto', 'acento'],
    marca: { fondo: '#121212', texto: '#ffffff', acento: '#ffe600' },
    /** El primer ícono va blanco sobre el mosaico naranja, no del color sobre el acento. */
    colorIcono: '#ffffff',
    ejemplo: { sub: 'Lo mejor de la semana', titulo: 'Herramientas de IA', icono: 'sparkles', icono2: 'git-branch', foto: '/muestras/persona.png' },
    dibujar: (p) => {
      const naranja = '#f25c1f'
      const lado = p.alto ? Math.round(p.W * 0.3) : 240
      const mosaico = (fondo, icono, tono) => h('div', { alignItems: 'center', justifyContent: 'center', width: lado, height: lado, borderRadius: Math.round(lado * 0.2), backgroundImage: fondo, border: '8px solid rgba(255,255,255,0.85)', boxShadow: `0 0 0 3px rgba(0,0,0,0.5), 0 20px 40px rgba(0,0,0,0.6), inset 0 0 30px ${tono}` },
        icono && img(icono, { width: Math.round(lado * 0.56), height: Math.round(lado * 0.56) }))
      const fondo = p.imagen
        ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.7)), url(${p.imagen})`, backgroundSize: `${p.W}px ${p.H}px` }
        : { backgroundImage: `radial-gradient(circle at 50% 35%, #3a3530 0%, ${p.fondo} 70%)` }
      const tamTitulo = escala(p.titulo, p.alto ? [[14, 92], [22, 70], [999, 56]] : [[14, 112], [22, 92], [999, 70]])
      // En los altos, los mosaicos van debajo de donde termina el titular.
      const renglonesTitulo = Math.ceil((p.titulo.length * tamTitulo * 0.6) / (p.W - 80))
      const debajoTitulo = 70 + (p.sub ? 70 : 0) + renglonesTitulo * tamTitulo + 30
      const topMosaico = p.alto ? Math.max(Math.round(p.H * 0.27), debajoTitulo) : 250
      return h('div', { width: p.W, height: p.H, position: 'relative', overflow: 'hidden', flexDirection: 'column', alignItems: 'center', color: p.texto, ...fondo },
        p.sub && h('div', { marginTop: p.alto ? 70 : 26, padding: '6px 40px', background: p.acento, color: '#111111', transform: 'skewX(-12deg)', fontSize: Math.min(escala(p.sub, [[24, 52], [999, 40]]), Math.floor((p.W - 140) / (p.sub.length * 0.62))), fontWeight: 700, textTransform: 'uppercase', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }, p.sub),
        h('div', { marginTop: 4, padding: '0 40px', justifyContent: 'center', textAlign: 'center', fontFamily: 'Lilita', fontSize: tamTitulo, lineHeight: 1, textTransform: 'uppercase', transform: 'skewX(-8deg)', textShadow: '0 6px 0 rgba(0,0,0,0.45)' }, p.titulo),
        h('div', { position: 'absolute', left: p.alto ? 40 : 60, top: topMosaico }, mosaico(`linear-gradient(160deg, #ff8a4c, ${naranja})`, p.iconoSvg, '#ffffff66')),
        h('div', { position: 'absolute', right: p.alto ? 40 : 60, top: topMosaico }, mosaico('linear-gradient(160deg, #ffffff, #dcdcdc)', p.icono2Svg, '#00000022')),
        p.foto && img(p.foto, { position: 'absolute', left: Math.round(p.W / 2 - (p.alto ? p.H * 0.5 : p.H * 0.62) * 0.7), bottom: 0, height: Math.round(p.alto ? p.H * 0.5 : p.H * 0.62), objectFit: 'contain' }),
      )
    },
  },

  tuit: {
    nombre: 'Tuit',
    descripcion: 'Foto de fondo y una tarjeta negra con borde amarillo: avatar, @usuario con palomita y la frase en grande, como un tuit.',
    cuando: 'El post tiene una frase corta y contundente que funciona sola (una opinión, una regla, un "deja de…").',
    campos: ['titulo', 'autor', 'foto', 'imagen', 'fondo', 'texto', 'acento'],
    marca: { fondo: '#1c1c1e', texto: '#ffffff', acento: '#f7c948' },
    ejemplo: { titulo: 'Deja de vender consultoría', autor: '@gabrielneuman', foto: '/muestras/persona.png' },
    dibujar: (p) => {
      const azul = '#1d9bf0'
      const palomita = img(`data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="${azul}"/><path d="M6.5 12.5 L10.5 16 L17.5 8.5" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`)}`, { width: 30, height: 30, marginLeft: 10 })
      const avatar = p.foto
        ? h('div', { width: 64, height: 64, borderRadius: 99, overflow: 'hidden', background: '#3a3a3c', alignItems: 'flex-end', justifyContent: 'center' }, img(p.foto, { height: 64, objectFit: 'contain' }))
        : h('div', { alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: 99, background: p.acento, color: '#111', fontSize: 28, fontWeight: 700 }, iniciales((p.autor || '?').replace('@', '')))
      const anchoTarjeta = p.alto ? p.W - 100 : 560
      const tarjeta = h('div', { flexDirection: 'column', width: anchoTarjeta, padding: '30px 38px 38px', borderRadius: 30, background: '#000000', border: `6px solid ${p.acento}`, boxShadow: '0 30px 60px rgba(0,0,0,0.55)' },
        h('div', { alignItems: 'center' }, avatar, h('div', { marginLeft: 16, fontSize: 28, fontWeight: 500, color: '#e7e7e7' }, p.autor || '@tu_usuario'), palomita),
        h('div', { flexWrap: 'wrap', marginTop: 18, fontSize: escala(p.titulo, p.alto ? [[20, 96], [40, 80], [80, 62], [999, 50]] : [[20, 84], [40, 66], [80, 52], [999, 42]]), fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.02em', color: p.texto }, resaltar(p.titulo, p.acento)))
      const fondo = p.imagen
        ? { backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.15), rgba(0,0,0,0.5)), url(${p.imagen})`, backgroundSize: `${p.W}px ${p.H}px` }
        : { backgroundImage: `linear-gradient(120deg, #4a4a4c 0%, ${p.fondo} 75%)` }
      const altoFoto = Math.round(p.alto ? p.H * 0.55 : p.H * 0.92)
      return h('div', { width: p.W, height: p.H, position: 'relative', overflow: 'hidden', color: p.texto, ...fondo },
        !p.imagen && p.foto && img(p.foto, { position: 'absolute', left: p.alto ? Math.round(p.W * 0.05) : 30, bottom: 0, height: altoFoto, objectFit: 'contain' }),
        h('div', { position: 'absolute', right: 50, left: p.alto ? 50 : undefined, top: p.alto ? 70 : 0, bottom: p.alto ? undefined : 0, alignItems: 'center' }, tarjeta),
      )
    },
  },

  ruta: {
    nombre: 'Ruta',
    descripcion: 'Fondo azul, título grande y una ruta de 3 a 5 pasos en recuadros unidos con flechas punteadas, con la persona abajo. Estilo miniatura de podcast.',
    cuando: 'El post explica un camino o proceso en pasos ("de 0 a 50 mil", "cómo pasé de X a Y", un método en etapas).',
    campos: ['titulo', 'puntos', 'foto', 'fondo', 'texto', 'acento'],
    marca: { fondo: '#2b7bff', texto: '#ffffff', acento: '#0b2a6b' },
    ejemplo: { titulo: 'La ruta de *50 mil*', puntos: 'Elige un nicho | Arma la oferta | Primeros 10 clientes | Automatiza | Escala', foto: '/muestras/persona.png' },
    dibujar: (p) => {
      const pasos = (p.puntos || '').split(/\s*[|;]\s*/).filter(Boolean).slice(0, 5)
      const n = Math.max(pasos.length, 1)
      // Zigzag: los pasos alternan arriba y abajo (en los altos, izquierda y derecha).
      const altoFoto = p.foto ? Math.round(p.alto ? p.H * 0.28 : p.H * 0.5) : 0
      // En los altos la ruta va entre el título y la persona: cada recuadro mide
      // lo que deja ese espacio, para que no se enciman.
      const zonaY0 = p.alto ? Math.max(150, Math.round(p.H * 0.15)) : 150
      const disponible = p.H - altoFoto - zonaY0 - 30
      const altoCaja = p.alto ? Math.min(Math.round(p.W * 0.13), Math.floor(disponible / n) - 12) : 76
      const zonaY1 = p.alto ? zonaY0 + (n - 1) * (altoCaja + 12) : Math.round(p.H * 0.62)
      const anchoCaja = p.alto ? Math.round(p.W * 0.52) : Math.min(230, Math.round((p.W - 80) / n) - 14)
      const pos = pasos.map((_, i) => {
        const t = n === 1 ? 0.5 : i / (n - 1)
        return p.alto
          ? { x: i % 2 ? p.W - 50 - anchoCaja : 50, y: Math.round(zonaY0 + t * (zonaY1 - zonaY0)) }
          : { x: Math.round(40 + t * (p.W - 80 - anchoCaja)), y: i % 2 ? zonaY0 + 120 : zonaY0 }
      })
      const centro = (q) => [q.x + anchoCaja / 2, q.y + altoCaja / 2]
      const flechas = pos.slice(1).map((q, i) => {
        const [x1, y1] = centro(pos[i])
        const [x2, y2] = centro(q)
        const cx = (x1 + x2) / 2 + (p.alto ? 0 : 0)
        const cy = (y1 + y2) / 2 + (p.alto ? 0 : (i % 2 ? 50 : -50))
        return `<path d="M${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}" fill="none" stroke="#ffffff" stroke-width="4" stroke-dasharray="10 10" stroke-linecap="round"/>`
      }).join('')
      const lienzoFlechas = img(`data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="${p.W}" height="${p.H}" viewBox="0 0 ${p.W} ${p.H}">${flechas}</svg>`)}`, { position: 'absolute', left: 0, top: 0, width: p.W, height: p.H })
      const cuadricula = img(`data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="${p.W}" height="${p.H}"><defs><pattern id="g" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0 L0 0 0 40" fill="none" stroke="#ffffff" stroke-opacity="0.08" stroke-width="2"/></pattern></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`)}`, { position: 'absolute', left: 0, top: 0, width: p.W, height: p.H })
      return h('div', { width: p.W, height: p.H, position: 'relative', overflow: 'hidden', color: p.texto, backgroundImage: `linear-gradient(170deg, ${p.fondo}, #1a56d6)` },
        cuadricula,
        h('div', { position: 'absolute', left: 0, right: 0, top: p.alto ? 50 : 26, justifyContent: 'center' },
          h('div', { padding: '6px 34px', borderRadius: 18, background: p.acento, fontFamily: 'Lilita', fontSize: escala(p.titulo, p.alto ? [[20, 64], [32, 52], [999, 42]] : [[20, 70], [32, 58], [999, 46]]), textTransform: 'uppercase', boxShadow: '0 8px 0 rgba(0,0,0,0.25)' },
            resaltar(p.titulo, '#ffe600'))),
        lienzoFlechas,
        ...pasos.map((t, i) => h('div', { position: 'absolute', left: pos[i].x, top: pos[i].y, width: anchoCaja, height: altoCaja, alignItems: 'center', justifyContent: 'center', padding: '0 14px', borderRadius: 16, background: '#ffffff', color: '#0b1b3a', border: `4px solid ${p.acento}`, boxShadow: '0 8px 0 rgba(0,0,0,0.2)', fontSize: Math.round(Math.min(p.alto ? 32 : 24, altoCaja * 0.42) * (t.length > 18 ? 0.85 : 1)), fontWeight: 700, textAlign: 'center', lineHeight: 1.1 },
          h('div', { position: 'absolute', left: -14, top: -14, width: 34, height: 34, borderRadius: 99, background: '#ffe600', color: '#0b1b3a', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700 }, String(i + 1)),
          t)),
        p.foto && img(p.foto, { position: 'absolute', left: Math.round(p.W / 2 - altoFoto * 0.7), bottom: 0, height: altoFoto, objectFit: 'contain' }),
      )
    },
  },

  lista: {
    nombre: 'Lista',
    descripcion: 'Un título y de 2 a 4 puntos numerados. Para guías, checklists y resúmenes.',
    cuando: 'El post trae de 2 a 4 pasos, criterios o puntos.',
    campos: ['titulo', 'puntos', 'sitio', 'fondo', 'texto', 'acento'],
    ejemplo: { titulo: 'Antes de automatizar, revisa:', puntos: 'Que la tarea se repita cada semana | Que alguien la haga igual siempre | Que sepas medir si salió bien', sitio: 'gabrielneuman.com' },
    dibujar: (p) => {
      const puntos = (p.puntos || '').split(/\s*[|;]\s*/).filter(Boolean).slice(0, 4)
      return h('div', { width: p.W, height: p.H, flexDirection: 'column', justifyContent: 'center', padding: '0 90px', background: p.fondo, color: p.texto },
        h('div', { flexWrap: 'wrap', fontSize: escala(p.titulo, [[30, 58], [60, 48], [999, 40]]), fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 36 }, resaltar(p.titulo, p.acento)),
        ...puntos.map((t, i) => h('div', { alignItems: 'center', marginTop: 18 },
          h('div', { alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: 999, background: p.acento, color: p.sobreAcento, fontSize: 28, fontWeight: 700, flexShrink: 0 }, String(i + 1)),
          h('div', { marginLeft: 24, fontSize: puntos.length > 3 ? 30 : 34, fontWeight: 500 }, t),
        )),
        p.sitio && h('div', { position: 'absolute', right: 90, bottom: 50, fontSize: 24, color: p.suave }, p.sitio),
      )
    },
  },

  entrevista: {
    nombre: 'Entrevista',
    descripcion: 'Marca arriba, nombre del invitado en minúsculas, titular oscuro sobre franja amarilla, remate en blanco y la persona a la derecha.',
    cuando: 'El post es de una entrevista, episodio o charla con invitado y una frase fuerte; mejor con foto recortada de la persona.',
    campos: ['sitio', 'autor', 'titulo', 'sub', 'foto', 'fondo', 'texto', 'acento'],
    marca: { fondo: '#08090f', texto: '#ffffff', acento: '#ffe600' },
    ejemplo: { sitio: 'Tu podcast | Episodio 1', autor: 'Gabriel Neuman', titulo: 'Vender servicios tiene reglas nuevas', sub: 'Esto es lo que cambió', foto: '/muestras/persona.png' },
    dibujar: (p) => {
      // Texto y persona no se enciman: lado a lado en OG, apilados en los altos.
      const [s1, s2] = (p.sitio || '').split(/\s*\|\s*/)
      const anchoFoto = p.alto ? p.W : Math.round(p.W * 0.4)
      const altoFoto = p.alto ? Math.round(p.H * 0.4) : p.H
      const anchoTexto = p.alto ? p.W - 80 : p.W - anchoFoto - 60
      const tam = p.alto ? escala(p.titulo, [[25, 64], [45, 52], [70, 44], [999, 36]]) : escala(p.titulo, [[25, 74], [45, 60], [70, 50], [999, 42]])
      const texto = h('div', { flexDirection: 'column', width: anchoTexto, flex: 1, justifyContent: 'center' },
        p.autor && h('div', { fontSize: p.alto ? 34 : 38, fontWeight: 700, marginLeft: 4, marginBottom: 10, textTransform: 'lowercase' }, p.autor),
        h('div', { flexWrap: 'wrap', padding: '14px 22px 20px', background: p.acento, color: p.sobreAcento, fontSize: tam, fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.03em' }, resaltar(p.titulo, p.sobreAcento)),
        p.sub && h('div', { flexWrap: 'wrap', marginTop: 16, marginLeft: 4, fontSize: Math.round(tam * 0.55), fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em' }, p.sub),
      )
      const foto = p.foto && h('div', { width: anchoFoto, height: altoFoto, justifyContent: 'center', alignItems: 'flex-end' },
        img(p.foto, { width: anchoFoto, height: altoFoto, objectFit: 'contain', objectPosition: 'bottom' }))
      return h('div', { width: p.W, height: p.H, flexDirection: p.alto ? 'column' : 'row', color: p.texto, backgroundImage: `radial-gradient(circle at 10% 20%, #2a2f45 0%, ${p.fondo} 55%)` },
        h('div', { flexDirection: 'column', flex: 1, padding: p.alto ? '36px 40px 10px' : '36px 0 36px 40px' },
          (s1 || s2) && h('div', { flexDirection: 'column', fontFamily: 'Lilita', fontSize: 28, lineHeight: 1, textTransform: 'uppercase' },
            s1 && h('div', {}, s1.replace(/\*/g, '')),
            s2 && h('div', { color: p.acento }, s2.replace(/\*/g, '')),
          ),
          texto,
        ),
        foto,
      )
    },
  },

  ceoagentico: {
    nombre: 'El CEO agéntico',
    descripcion: 'Portada del podcast El CEO agéntico: logo, episodio, los dos de la conversación (anfitrión e invitado) con sus fotos y el titular sobre franja verde.',
    cuando: 'El post es de un episodio de El CEO agéntico.',
    campos: ['sitio', 'anfitrion', 'autor', 'titulo', 'sub', 'foto2', 'foto', 'fondo', 'texto', 'acento'],
    marca: CEO,
    ejemplo: { sitio: 'Episodio 1', anfitrion: 'Gabriel Neuman', autor: 'Tu invitado', titulo: 'Un CEO que delega en agentes, no en más gente', sub: 'Lo que cambia en tu empresa', foto2: '/muestras/persona.png' },
    dibujar: (p) => {
      const anfitrion = p.anfitrion || 'Gabriel Neuman'
      const logo = ceoLogo(p, 30)
      // Dos personas lado a lado: a la derecha en OG, abajo en los formatos altos.
      const anchoFotos = p.alto ? p.W : Math.round(p.W * 0.44)
      const altoFotos = p.alto ? Math.round(p.H * (p.H / p.W > 1.5 ? 0.46 : 0.36)) : Math.round(p.H * 0.8)
      const anchoTexto = p.alto ? p.W - 80 : p.W - anchoFotos - 50
      const tam = p.alto ? escala(p.titulo, [[25, 60], [45, 50], [70, 42], [999, 34]]) : escala(p.titulo, [[25, 66], [45, 54], [70, 46], [999, 38]])
      const persona = (src, nombre, voltear) => ceoPersona(p, src, nombre, Math.round(anchoFotos / 2), altoFotos, voltear)
      return h('div', { width: p.W, height: p.H, flexDirection: p.alto ? 'column' : 'row', color: p.texto, backgroundImage: ceoFondo(p) },
        h('div', { flexDirection: 'column', flex: 1, padding: p.alto ? '36px 40px 10px' : '36px 0 36px 40px' },
          logo,
          h('div', { flexDirection: 'column', width: anchoTexto, flex: 1, justifyContent: 'center' },
            h('div', { flexWrap: 'wrap', fontSize: p.alto ? 26 : 28, fontWeight: 700, marginLeft: 4, marginBottom: 12, textTransform: 'lowercase' },
              h('span', {}, anfitrion), h('span', { color: p.acento, margin: '0 10px' }, '×'), h('span', {}, p.autor || 'invitado')),
            h('div', { flexWrap: 'wrap', padding: '14px 22px 20px', background: p.acento, color: p.sobreAcento, fontSize: tam, fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.03em' }, resaltar(p.titulo, p.sobreAcento)),
            p.sub && h('div', { flexWrap: 'wrap', marginTop: 16, marginLeft: 4, fontSize: Math.round(tam * 0.55), fontWeight: 700, lineHeight: 1.1 }, p.sub),
          ),
        ),
        h('div', { width: anchoFotos, alignSelf: 'flex-end' }, persona(p.foto2, anfitrion, true), persona(p.foto, p.autor || 'Invitado')),
      )
    },
  },

  ceoportada: {
    nombre: 'El CEO agéntico: portada',
    descripcion: 'El ícono del podcast El CEO agéntico: logo grande, "un podcast de" y el anfitrión. Para Spotify, Apple Podcasts y el perfil.',
    cuando: 'Se necesita la portada o el ícono del show, no la de un episodio.',
    campos: ['anfitrion', 'sub', 'foto2', 'fondo', 'texto', 'acento'],
    marca: CEO,
    ejemplo: { anfitrion: 'Gabriel Neuman', sub: 'Conversaciones sobre dirigir con agentes de IA', foto2: '/muestras/persona.png' },
    dibujar: (p) => {
      const anfitrion = p.anfitrion || 'Gabriel Neuman'
      // Siempre cuadrada al centro del lienzo: así sirve de ícono en cualquier formato.
      const lado = Math.min(p.W, p.H)
      const altoFotos = Math.round(lado * 0.48)
      return h('div', { width: p.W, height: p.H, alignItems: 'center', justifyContent: 'center', color: p.texto, backgroundImage: ceoFondo(p) },
        h('div', { flexDirection: 'column', width: lado, height: lado, position: 'relative', alignItems: 'center', border: `${Math.round(lado / 60)}px solid ${p.acento}` },
          h('div', { marginTop: Math.round(lado * 0.07) }, ceoLogo(p, Math.round(lado * 0.15), false)),
          h('div', { marginTop: Math.round(lado * 0.025), fontFamily: 'Mono', fontSize: Math.round(lado * 0.03), letterSpacing: '0.14em', color: p.acento, textTransform: 'uppercase' }, 'un podcast de ' + anfitrion),
          p.sub && h('div', { marginTop: Math.round(lado * 0.02), width: Math.round(lado * 0.8), justifyContent: 'center', textAlign: 'center', fontSize: Math.round(lado * 0.032), fontWeight: 500, color: p.suave }, p.sub),
          h('div', { position: 'absolute', bottom: 0, left: Math.round(lado * 0.2) },
            ceoPersona(p, p.foto2, anfitrion, Math.round(lado * 0.6), altoFotos)),
        ),
      )
    },
  },

  ceopromo: {
    nombre: 'El CEO agéntico: promo',
    descripcion: 'Para anunciar el podcast o un episodio que viene: "Muy pronto", qué vamos a hacer en puntos, fecha de estreno y las dos personas.',
    cuando: 'Se anuncia el lanzamiento del podcast o el próximo episodio, antes de que salga.',
    campos: ['sitio', 'titulo', 'puntos', 'fecha', 'anfitrion', 'autor', 'foto2', 'foto', 'fondo', 'texto', 'acento'],
    marca: CEO,
    ejemplo: { sitio: 'Muy pronto', titulo: 'Un podcast para dirigir tu empresa *con agentes de IA*', puntos: 'Casos reales de CEOs | Qué delegar a un agente y qué no | Herramientas que sí funcionan', fecha: 'Estreno 29 OCT', anfitrion: 'Gabriel Neuman', autor: 'Tu invitado', foto2: '/muestras/persona.png' },
    dibujar: (p) => {
      const anfitrion = p.anfitrion || 'Gabriel Neuman'
      const puntos = (p.puntos || '').split(/\s*\|\s*/).filter(Boolean).slice(0, 4)
      const anchoFotos = p.alto ? p.W : Math.round(p.W * 0.42)
      const altoFotos = p.alto ? Math.round(p.H * (p.H / p.W > 1.5 ? 0.4 : 0.32)) : Math.round(p.H * 0.78)
      const tam = escala(p.titulo, [[30, p.alto ? 50 : 52], [60, p.alto ? 40 : 42], [999, p.alto ? 34 : 36]])
      return h('div', { width: p.W, height: p.H, flexDirection: p.alto ? 'column' : 'row', color: p.texto, backgroundImage: ceoFondo(p) },
        h('div', { flexDirection: 'column', flex: 1, padding: p.alto ? '36px 40px 10px' : '36px 0 36px 40px' },
          ceoLogo(p, 30),
          h('div', { flexDirection: 'column', flex: 1, justifyContent: 'center', width: p.alto ? p.W - 80 : p.W - anchoFotos - 50 },
            h('div', { flexWrap: 'wrap', fontSize: tam, fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.03em' }, resaltar(p.titulo, p.acento)),
            ...puntos.map((t) => h('div', { alignItems: 'center', marginTop: 12, fontSize: p.alto ? 22 : 24, fontWeight: 500 },
              h('div', { width: 14, height: 14, borderRadius: 4, background: p.acento, marginRight: 14, flexShrink: 0 }), t)),
            p.fecha && h('div', { marginTop: 22, alignSelf: 'flex-start', padding: '10px 20px', borderRadius: 999, background: p.acento, color: p.sobreAcento, fontSize: 24, fontWeight: 700 }, p.fecha),
          ),
        ),
        h('div', { width: anchoFotos, alignSelf: 'flex-end' },
          ceoPersona(p, p.foto2, anfitrion, Math.round(anchoFotos / 2), altoFotos, true),
          ceoPersona(p, p.foto, p.autor || 'Invitado', Math.round(anchoFotos / 2), altoFotos)),
      )
    },
  },

  alianza: {
    nombre: 'Alianza',
    descripcion: 'Dos marcas lado a lado, titular en dos pesos, tres pilares con ícono, remate y botón; un globo de luz a la derecha.',
    cuando: 'Se anuncia una alianza o colaboración entre dos marcas, con lo que ofrecen juntas.',
    campos: ['logo', 'sitio', 'autor', 'titulo', 'sub', 'pilares', 'extracto', 'boton', 'foto', 'fondo', 'texto', 'acento'],
    marca: { fondo: '#050505', texto: '#ffffff', acento: '#ff6a2b' },
    ejemplo: { sitio: 'Margara', autor: 'Gabriel Neuman', titulo: '*Una alianza* que llega a toda *América.*', sub: 'Tecnología, datos y sostenibilidad para un futuro más eficiente y responsable.', pilares: 'truck: Monitoreo de flotas | leaf: Gestión ambiental | chart-column: Datos para decisiones reales', extracto: '*Dos soluciones. Una misma visión.* Empresas más eficientes y un impacto positivo en la región.', boton: 'Conocé más' },
    dibujar: (p) => {
      // Medidas relativas al lado corto: el mismo diseño en los cinco tamaños.
      const u = Math.min(p.W, p.H) / 680
      const ancho = p.W > p.H * 1.3
      // En historia el globo llena el hueco de arriba y el texto baja.
      const muyAlto = p.H > p.W * 1.5
      const pad = Math.round((ancho ? 56 : 40) * u)
      const globo = Math.round(ancho ? p.H * 0.98 : p.W * (muyAlto ? 1.05 : 0.82))
      const columna = ancho ? Math.round(p.W * 0.6) : p.W - pad * 2
      const pilares = p.pilares.slice(0, 3)
      const tam = escala(p.titulo, [[34, 62], [60, 52], [999, 42]]) * u * (ancho ? 0.9 : 1)
      // Lo marcado va en negrita; lo demás, fino.
      const remate = p.extracto.match(/^\*([^*]+)\*\s*(.*)$/)
      return h('div', { width: p.W, height: p.H, position: 'relative', overflow: 'hidden', background: p.fondo, color: p.texto },
        // El globo: la imagen de ?foto= o, sin ella, el planeta de puntos en el acento.
        h('div', { position: 'absolute', width: globo, height: globo, right: -Math.round(globo * (ancho ? 0.18 : muyAlto ? 0.3 : 0.42)), top: ancho ? Math.round((p.H - globo) / 2) : Math.round(p.H * (muyAlto ? 0.1 : 0.16)), borderRadius: 9999, border: `${Math.max(2, Math.round(3 * u))}px solid ${p.acento}`, boxShadow: `0 0 ${Math.round(40 * u)}px ${p.acento}`, background: p.fondo, overflow: 'hidden' },
          img(p.foto || planeta(p.acento, globo), { width: globo, height: globo, objectFit: 'cover' })),
        h('div', { flexDirection: 'column', justifyContent: 'space-between', width: p.W, height: p.H, padding: pad, backgroundImage: `linear-gradient(90deg, ${p.fondo} 0%, ${p.fondo}cc 45%, ${p.fondo}00 75%)` },
          h('div', { alignItems: 'center' },
            p.logo ? img(p.logo, { height: Math.round(44 * u), maxWidth: Math.round(220 * u), objectFit: 'contain' })
              : p.sitio && h('div', { fontSize: Math.round(30 * u), fontWeight: 700, letterSpacing: '0.02em', textTransform: 'uppercase' }, p.sitio),
            (p.logo || p.sitio) && p.autor && h('div', { width: 2, height: Math.round(44 * u), margin: `0 ${Math.round(22 * u)}px`, background: `${p.texto}66` }),
            p.autor && h('div', { flexDirection: 'column', fontSize: Math.round(18 * u), letterSpacing: '0.3em', lineHeight: 1.15, textTransform: 'uppercase' },
              ...(p.autor.split(/\s+/).length > 1 ? [h('div', { fontWeight: 500 }, p.autor.split(/\s+/)[0]), h('div', { fontWeight: 700 }, p.autor.split(/\s+/).slice(1).join(' '))] : [h('div', { fontWeight: 700 }, p.autor)])),
          ),
          h('div', { flexDirection: 'column', width: columna, flex: muyAlto ? 1 : undefined, justifyContent: 'flex-end', marginBottom: muyAlto ? Math.round(60 * u) : 0 },
            h('div', { flexWrap: 'wrap', fontSize: tam, fontWeight: 500, lineHeight: 1.02, letterSpacing: '-0.02em', textTransform: 'uppercase' }, resaltar(p.titulo, p.texto, { fontWeight: 700 })),
            p.sub && h('div', { marginTop: Math.round(18 * u), fontSize: Math.round(22 * u), fontWeight: 500, lineHeight: 1.3, color: p.suave, maxWidth: Math.round(480 * u) }, p.sub),
            pilares.length > 0 && h('div', { marginTop: Math.round(26 * u), alignItems: 'flex-start' },
              ...pilares.map(({ texto, svg }, i) => h('div', { alignItems: 'flex-start' },
                i > 0 && h('div', { width: 1, height: Math.round(50 * u), marginTop: Math.round(14 * u), background: `${p.texto}55` }),
                h('div', { flexDirection: 'column', alignItems: 'center', width: Math.round(140 * u) },
                  h('div', { alignItems: 'center', justifyContent: 'center', width: Math.round(76 * u), height: Math.round(76 * u), borderRadius: 999, border: `${Math.max(2, Math.round(3 * u))}px solid ${p.texto}` },
                    svg && img(svg, { width: Math.round(36 * u), height: Math.round(36 * u) })),
                  h('div', { marginTop: Math.round(10 * u), fontSize: Math.round(15 * u), fontWeight: 500, lineHeight: 1.25, textAlign: 'center' }, texto),
                ))),
            ),
          ),
          h('div', { flexDirection: 'column', width: columna },
            p.extracto && h('div', { flexDirection: 'column', fontSize: Math.round(20 * u), lineHeight: 1.3 },
              remate ? h('div', { fontWeight: 700, fontSize: Math.round(24 * u) }, remate[1]) : null,
              h('div', { fontWeight: 500, color: p.suave }, remate ? remate[2] : p.extracto.replace(/\*/g, ''))),
            p.boton && h('div', { alignSelf: 'flex-start', alignItems: 'center', marginTop: Math.round(22 * u), padding: `${Math.round(14 * u)}px ${Math.round(34 * u)}px`, borderRadius: 999, border: `${Math.max(2, Math.round(3 * u))}px solid ${p.texto}`, fontSize: Math.round(22 * u), fontWeight: 700 },
              p.boton,
              p.flechaSvg && img(p.flechaSvg, { width: Math.round(26 * u), height: Math.round(26 * u), marginLeft: Math.round(16 * u) })),
          ),
        ),
      )
    },
  },

  podcast: {
    nombre: 'Podcast',
    descripcion: 'Foto del invitado, nombre, episodio y tema. Para episodios de podcast o YouTube.',
    cuando: 'El post es de un episodio de podcast o video con invitado.',
    campos: ['titulo', 'autor', 'sub', 'foto', 'sitio', 'fondo', 'texto', 'acento'],
    ejemplo: { titulo: 'Cómo crecer un negocio de servicios sin contratar más', autor: 'Tu invitado', sub: 'Episodio 101', sitio: 'Growth Tactics' },
    dibujar: (p) =>
      h('div', { width: p.W, height: p.H, flexDirection: p.alto ? 'column-reverse' : 'row', alignItems: p.alto ? 'flex-start' : 'center', justifyContent: 'center', padding: '0 80px', background: p.fondo, color: p.texto },
        h('div', { flexDirection: 'column', flex: p.alto ? undefined : 1, marginRight: p.alto ? 0 : 60, marginTop: p.alto ? 60 : 0 },
          h('div', { alignItems: 'center', fontSize: 24, fontWeight: 700, color: p.acento, letterSpacing: '0.12em' },
            p.micSvg && img(p.micSvg, { width: 34, height: 34, marginRight: 12 }),
            (p.sub || 'Episodio').toUpperCase(),
          ),
          h('div', { flexWrap: 'wrap', marginTop: 22, fontSize: escala(p.titulo, [[30, 62], [60, 50], [999, 42]]), fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em' }, resaltar(p.titulo, p.acento)),
          p.autor && h('div', { marginTop: 26, fontSize: 32, fontWeight: 500, color: p.suave }, `con ${p.autor}`),
          p.sitio && h('div', { marginTop: 40, fontSize: 24, fontWeight: 700 }, p.sitio),
        ),
        p.foto
          ? img(p.foto, { width: 380, height: 380, borderRadius: 40, objectFit: 'cover', border: `8px solid ${p.acento}` })
          : h('div', { alignItems: 'center', justifyContent: 'center', width: 380, height: 380, borderRadius: 40, background: p.acento, color: p.sobreAcento, fontSize: 150, fontWeight: 700 }, iniciales(p.autor)),
      ),
  },
}

function iniciales(nombre = '') {
  return nombre.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('') || '?'
}

/** Qué pide cada campo, para el editor y la documentación. */
export const CAMPOS = {
  titulo: { etiqueta: 'Título', tipo: 'texto', ayuda: 'Pon *entre asteriscos* lo que va en color de acento.' },
  sub: { etiqueta: 'Subtítulo', tipo: 'texto' },
  extracto: { etiqueta: 'Extracto', tipo: 'texto' },
  autor: { etiqueta: 'Autor o nombre', tipo: 'texto' },
  sitio: { etiqueta: 'Sitio', tipo: 'texto' },
  boton: { etiqueta: 'Texto del botón', tipo: 'texto' },
  foto: { etiqueta: 'Foto (URL)', tipo: 'url' },
  imagen: { etiqueta: 'Captura (URL)', tipo: 'url' },
  foto2: { etiqueta: 'Foto del anfitrión (URL)', tipo: 'url' },
  anfitrion: { etiqueta: 'Anfitrión', tipo: 'texto' },
  emoji: { etiqueta: 'Emoji', tipo: 'texto' },
  icono: { etiqueta: 'Ícono de Lucide', tipo: 'texto', ayuda: 'El nombre en lucide.dev, p. ej. rocket, workflow, bot.' },
  icono2: { etiqueta: 'Segundo ícono de Lucide', tipo: 'texto', ayuda: 'El de la derecha, sobre fondo blanco. P. ej. github, bot.' },
  fondo: { etiqueta: 'Fondo', tipo: 'color' },
  texto: { etiqueta: 'Texto', tipo: 'color' },
  acento: { etiqueta: 'Acento', tipo: 'color' },
  ciudad: { etiqueta: 'Ciudad', tipo: 'texto', ayuda: 'Vacío: la de quien ve la imagen. En el título usa {ciudad} y {pais}.' },
  pais: { etiqueta: 'País (código de 2 letras)', tipo: 'texto', ayuda: 'MX, CO, AR, ES… Vacío: el de quien ve la imagen.' },
  cifra: { etiqueta: 'Cifra', tipo: 'texto' },
  izquierda: { etiqueta: 'Opción de la izquierda', tipo: 'texto', ayuda: 'En duelo: Nombre | > comando | ✓ paso | ✓ paso.' },
  derecha: { etiqueta: 'Opción de la derecha (resaltada)', tipo: 'texto' },
  fecha: { etiqueta: 'Fecha', tipo: 'texto', ayuda: 'Día y mes, p. ej. 29 OCT.' },
  lugar: { etiqueta: 'Lugar u horario', tipo: 'texto' },
  logo: { etiqueta: 'Logo (URL)', tipo: 'url', ayuda: 'Sin logo sale el sitio en texto.' },
  pilares: { etiqueta: 'Pilares', tipo: 'texto', ayuda: 'Hasta 3, separados con |: ícono de Lucide: texto. P. ej. truck: Monitoreo de flotas.' },
  puntos: { etiqueta: 'Puntos', tipo: 'texto', ayuda: 'De 2 a 4, separados con |.' },
}
