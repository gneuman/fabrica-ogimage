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
function resaltar(texto, acento) {
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
    h('span', { marginRight: '0.24em' }, partes.map(({ p, marcado }) => h('span', { color: marcado ? acento : undefined }, p))),
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

export const PLANTILLAS = {
  marca: {
    nombre: 'Marca',
    descripcion: 'Título grande a la izquierda, subtítulo y firma abajo. La de gabrielneuman.com.',
    cuando: 'El post es una idea o postura de Gabriel, sin dato ni evento. La opción por defecto.',
    campos: ['titulo', 'sub', 'autor', 'sitio', 'foto', 'fondo', 'texto', 'acento'],
    ejemplo: { titulo: 'Equipos chicos, *resultados grandes*', sub: 'Director de IA fraccional', autor: 'Gabriel Neuman', sitio: 'gabrielneuman.com' },
    dibujar: (p) =>
      h('div', { width: p.W, height: p.H, display: 'flex', flexDirection: 'column', justifyContent: p.alto ? 'center' : 'space-between', padding: '72px 80px', background: p.fondo, color: p.texto },
        h('div', { display: 'flex', flexDirection: 'column', maxWidth: 900 },
          h('div', { display: 'flex', flexWrap: 'wrap', fontSize: escala(p.titulo, [[24, 84], [44, 72], [70, 60], [100, 50], [999, 42]]), fontWeight: 700, lineHeight: 1.06, letterSpacing: '-0.025em' }, resaltar(p.titulo, p.acento)),
          p.sub && h('div', { marginTop: 28, fontSize: 30, fontWeight: 500, lineHeight: 1.35, color: p.suave }, p.sub),
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
      h('div', { width: p.W, height: p.H, display: 'flex', flexDirection: 'column', justifyContent: p.alto ? 'center' : 'space-between', padding: 64, background: p.fondo, color: p.texto, borderTop: `14px solid ${p.acento}` },
        h('div', { display: 'flex', flexDirection: 'column' },
          h('div', { display: 'flex', flexWrap: 'wrap', fontSize: escala(p.titulo, [[40, 66], [70, 56], [100, 48], [999, 40]]), fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em' }, resaltar(p.titulo, p.acento)),
          p.extracto && h('div', { marginTop: 24, fontSize: 30, fontWeight: 500, lineHeight: 1.4, color: p.suave }, p.extracto),
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
  emoji: { etiqueta: 'Emoji', tipo: 'texto' },
  icono: { etiqueta: 'Ícono de Lucide', tipo: 'texto', ayuda: 'El nombre en lucide.dev, p. ej. rocket, workflow, bot.' },
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
  puntos: { etiqueta: 'Puntos', tipo: 'texto', ayuda: 'De 2 a 4, separados con |.' },
}
