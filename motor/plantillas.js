// Las plantillas de la fábrica. Cada una recibe los parámetros ya limpios
// (normalizar en render.js) y devuelve el árbol que dibuja Satori a 1200×630.
// Las usan los tres caminos: el Worker (/og/<plantilla>), el comando para otros
// proyectos (bin/) y las muestras que se generan en el build (scripts/).
//
// Satori pide display:flex en todo div con más de un hijo; h() se lo pone a
// todos los div por defecto.

export const ANCHO = 1200
export const ALTO = 630

const h = (type, style, ...hijos) => ({
  type,
  props: {
    style: type === 'div' ? { display: 'flex', ...style } : style,
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

export const PLANTILLAS = {
  marca: {
    nombre: 'Marca',
    descripcion: 'Título grande a la izquierda, subtítulo y firma abajo. La de gabrielneuman.com.',
    campos: ['titulo', 'sub', 'autor', 'sitio', 'foto', 'fondo', 'texto', 'acento'],
    ejemplo: { titulo: 'Equipos chicos, *resultados grandes*', sub: 'Director de IA fraccional', autor: 'Gabriel Neuman', sitio: 'gabrielneuman.com' },
    dibujar: (p) =>
      h('div', { width: ANCHO, height: ALTO, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '72px 80px', background: p.fondo, color: p.texto },
        h('div', { display: 'flex', flexDirection: 'column', maxWidth: 900 },
          h('div', { display: 'flex', flexWrap: 'wrap', fontSize: escala(p.titulo, [[24, 84], [44, 72], [70, 60], [100, 50], [999, 42]]), fontWeight: 700, lineHeight: 1.06, letterSpacing: '-0.025em' }, resaltar(p.titulo, p.acento)),
          p.sub && h('div', { marginTop: 28, fontSize: 30, fontWeight: 500, lineHeight: 1.35, color: p.suave }, p.sub),
        ),
        firma(p, p.suave),
      ),
  },

  articulo: {
    nombre: 'Artículo',
    descripcion: 'Título, extracto y autor con foto. Para posts de blog y newsletters.',
    campos: ['titulo', 'extracto', 'autor', 'foto', 'sitio', 'fondo', 'texto', 'acento'],
    ejemplo: { titulo: 'Cómo dirigir agentes de IA sin escribir código', extracto: 'Lo que cambia cuando el equipo deja de pedirle cosas a ChatGPT y empieza a delegarle trabajo.', autor: 'Gabriel Neuman', sitio: 'gabrielneuman.com' },
    dibujar: (p) =>
      h('div', { width: ANCHO, height: ALTO, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 64, background: p.fondo, color: p.texto, borderTop: `14px solid ${p.acento}` },
        h('div', { display: 'flex', flexDirection: 'column' },
          h('div', { display: 'flex', flexWrap: 'wrap', fontSize: escala(p.titulo, [[40, 66], [70, 56], [100, 48], [999, 40]]), fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em' }, resaltar(p.titulo, p.acento)),
          p.extracto && h('div', { marginTop: 24, fontSize: 30, fontWeight: 500, lineHeight: 1.4, color: p.suave }, p.extracto),
        ),
        firma(p, p.suave),
      ),
  },

  titular: {
    nombre: 'Titular',
    descripcion: 'Un titular centrado con una palabra resaltada y un botón. Para landings.',
    campos: ['titulo', 'sub', 'boton', 'fondo', 'texto', 'acento'],
    ejemplo: { titulo: 'Imágenes OG en *un minuto*', sub: 'Plantillas por URL, en español y gratis.', boton: 'Hacer la mía' },
    dibujar: (p) =>
      h('div', { width: ANCHO, height: ALTO, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 80, background: p.fondo, color: p.texto, textAlign: 'center' },
        h('div', { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', fontSize: escala(p.titulo, [[24, 92], [44, 76], [70, 62], [999, 50]]), fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.03em' }, resaltar(p.titulo, p.acento)),
        p.sub && h('div', { marginTop: 28, fontSize: 32, fontWeight: 500, color: p.suave }, p.sub),
        p.boton && h('div', { marginTop: 44, padding: '20px 52px', borderRadius: 999, background: p.acento, color: p.sobreAcento, fontSize: 32, fontWeight: 700 }, p.boton),
      ),
  },

  emoji: {
    nombre: 'Emoji',
    descripcion: 'Un emoji grande sobre degradado, con título opcional.',
    campos: ['emoji', 'titulo', 'fondo', 'acento', 'texto'],
    ejemplo: { emoji: '🚀', titulo: 'Lanzamos la versión 2', fondo: '#3b5bdb', acento: '#e2553d', texto: '#ffffff' },
    dibujar: (p) =>
      h('div', { width: ANCHO, height: ALTO, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundImage: `linear-gradient(135deg, ${p.fondo}, ${p.acento})`, color: p.texto },
        h('div', { display: 'flex', fontSize: p.titulo ? 200 : 300, lineHeight: 1 }, p.emoji || '✨'),
        p.titulo && h('div', { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', marginTop: 40, padding: '0 80px', fontSize: escala(p.titulo, [[30, 64], [60, 52], [999, 42]]), fontWeight: 700, textAlign: 'center' }, p.titulo),
      ),
  },

  icono: {
    nombre: 'Ícono',
    descripcion: 'Un ícono de Lucide en recuadro, título y subtítulo. Para docs y features.',
    campos: ['icono', 'titulo', 'sub', 'fondo', 'texto', 'acento'],
    ejemplo: { icono: 'workflow', titulo: 'Automatiza la cobranza', sub: 'Recordatorios que salen solos, con tu tono.' },
    dibujar: (p) =>
      h('div', { width: ANCHO, height: ALTO, display: 'flex', alignItems: 'center', padding: '0 90px', background: p.fondo, color: p.texto },
        h('div', { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 260, height: 260, borderRadius: 48, background: p.acento, flexShrink: 0 },
          p.iconoSvg && img(p.iconoSvg, { width: 150, height: 150 }),
        ),
        h('div', { display: 'flex', flexDirection: 'column', marginLeft: 70, flex: 1 },
          h('div', { display: 'flex', flexWrap: 'wrap', fontSize: escala(p.titulo, [[24, 72], [44, 60], [999, 48]]), fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.02em' }, resaltar(p.titulo, p.acento)),
          p.sub && h('div', { marginTop: 22, fontSize: 30, fontWeight: 500, lineHeight: 1.35, color: p.suave }, p.sub),
        ),
      ),
  },

  perfil: {
    nombre: 'Perfil',
    descripcion: 'Foto redonda, nombre y rol. Para páginas de autor, equipo o ponentes.',
    campos: ['foto', 'autor', 'sub', 'sitio', 'fondo', 'texto', 'acento'],
    ejemplo: { autor: 'Gabriel Neuman', sub: 'Director de IA fraccional', sitio: 'gabrielneuman.com' },
    dibujar: (p) =>
      h('div', { width: ANCHO, height: ALTO, display: 'flex', alignItems: 'center', justifyContent: 'center', background: p.fondo, color: p.texto },
        p.foto
          ? img(p.foto, { width: 300, height: 300, borderRadius: 999, objectFit: 'cover', border: `10px solid ${p.acento}` })
          : h('div', { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 300, height: 300, borderRadius: 999, background: p.acento, color: p.sobreAcento, fontSize: 130, fontWeight: 700 }, iniciales(p.autor)),
        h('div', { display: 'flex', flexDirection: 'column', marginLeft: 64, maxWidth: 640 },
          h('div', { fontSize: escala(p.autor, [[18, 76], [30, 62], [999, 50]]), fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.05 }, p.autor || 'Tu nombre'),
          p.sub && h('div', { marginTop: 18, fontSize: 34, fontWeight: 500, color: p.suave }, p.sub),
          p.sitio && h('div', { marginTop: 30, fontSize: 28, color: p.acento, fontWeight: 700 }, p.sitio),
        ),
      ),
  },

  boton: {
    nombre: 'Botón',
    descripcion: 'Emoji, titular y una llamada a la acción en píldora. Para ofertas y eventos.',
    campos: ['emoji', 'titulo', 'boton', 'fondo', 'texto', 'acento'],
    ejemplo: { emoji: '📅', titulo: 'Taller en vivo: tu primer agente', boton: 'Aparta tu lugar' },
    dibujar: (p) =>
      h('div', { width: ANCHO, height: ALTO, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 80, background: p.fondo, color: p.texto, textAlign: 'center' },
        p.emoji && h('div', { display: 'flex', fontSize: 110, lineHeight: 1, marginBottom: 30 }, p.emoji),
        h('div', { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', fontSize: escala(p.titulo, [[30, 72], [60, 58], [999, 46]]), fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em' }, resaltar(p.titulo, p.acento)),
        h('div', { display: 'flex', marginTop: 48, padding: '24px 64px', borderRadius: 999, background: p.acento, color: p.sobreAcento, fontSize: 36, fontWeight: 700 }, p.boton || 'Empieza aquí'),
      ),
  },

  captura: {
    nombre: 'Captura',
    descripcion: 'Una captura de pantalla dentro de una ventana de navegador, con título arriba.',
    campos: ['imagen', 'titulo', 'sitio', 'fondo', 'texto', 'acento'],
    ejemplo: { titulo: 'Equipos chicos, resultados grandes', sitio: 'gabrielneuman.com', imagen: '/muestras/captura.png' },
    dibujar: (p) =>
      h('div', { width: ANCHO, height: ALTO, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 56, background: p.fondo, color: p.texto, overflow: 'hidden' },
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
    campos: ['imagen', 'titulo', 'sub', 'fondo', 'texto', 'acento'],
    ejemplo: { titulo: 'El curso, en *tu celular*', sub: 'Ocho semanas para dirigir agentes de IA en tu empresa.', imagen: '/muestras/telefono.png' },
    dibujar: (p) =>
      h('div', { width: ANCHO, height: ALTO, display: 'flex', alignItems: 'center', padding: '0 0 0 90px', background: p.fondo, color: p.texto, overflow: 'hidden' },
        h('div', { display: 'flex', flexDirection: 'column', width: 600 },
          h('div', { display: 'flex', flexWrap: 'wrap', fontSize: escala(p.titulo, [[24, 70], [44, 58], [999, 46]]), fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.02em' }, resaltar(p.titulo, p.acento)),
          p.sub && h('div', { marginTop: 22, fontSize: 30, fontWeight: 500, lineHeight: 1.35, color: p.suave }, p.sub),
        ),
        h('div', { alignSelf: 'flex-start', flexShrink: 0, marginLeft: 90, marginTop: 90, width: 340, height: 700, padding: 14, borderRadius: 56, background: '#111', border: '2px solid rgba(255,255,255,0.18)' },
          p.imagen
            ? img(p.imagen, { width: 312, height: 672, borderRadius: 44, objectFit: 'cover', objectPosition: 'top' })
            : h('div', { display: 'flex', width: 312, height: 672, borderRadius: 44, background: p.acento }),
        ),
      ),
  },
  ciudad: {
    nombre: 'Ciudad',
    descripcion: 'La ciudad y la bandera de quien la ve, detectadas por su conexión. También se fijan por URL.',
    campos: ['titulo', 'sub', 'ciudad', 'pais', 'imagen', 'autor', 'fondo', 'texto', 'acento'],
    ejemplo: { titulo: 'Taller presencial en {ciudad}', sub: 'Cupo para 20 personas', ciudad: 'Ciudad de México', pais: 'MX', autor: 'Gabriel Neuman' },
    dibujar: (p) => {
      const lugar = (t) => t.replaceAll('{ciudad}', p.ciudad || p.nombrePais || 'tu ciudad').replaceAll('{pais}', p.nombrePais || 'tu país')
      return h('div', { width: ANCHO, height: ALTO, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 80, color: p.texto, textAlign: 'center', backgroundImage: p.imagen ? `linear-gradient(rgba(15,23,51,0.55), rgba(15,23,51,0.8)), url(${p.imagen})` : `linear-gradient(135deg, ${p.fondo}, ${p.acento})`, backgroundSize: '1200px 630px' },
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
    campos: ['titulo', 'autor', 'sub', 'foto', 'fondo', 'texto', 'acento'],
    ejemplo: { titulo: 'Si me voy mañana, *sigue corriendo*.', autor: 'Gabriel Neuman', sub: 'Director de IA fraccional' },
    dibujar: (p) =>
      h('div', { width: ANCHO, height: ALTO, flexDirection: 'column', justifyContent: 'center', padding: '0 110px', background: p.fondo, color: p.texto },
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
    campos: ['cifra', 'titulo', 'sub', 'sitio', 'fondo', 'texto', 'acento'],
    ejemplo: { cifra: '595', titulo: 'imágenes OG en cada build', sub: 'Una por página, sin diseñarlas a mano', sitio: 'gabrielneuman.com' },
    dibujar: (p) =>
      h('div', { width: ANCHO, height: ALTO, flexDirection: 'column', justifyContent: 'center', padding: '0 90px', background: p.fondo, color: p.texto },
        h('div', { fontSize: escala(p.cifra || '0', [[3, 260], [5, 210], [8, 160], [999, 120]]), fontWeight: 700, lineHeight: 0.95, letterSpacing: '-0.05em', color: p.acento }, p.cifra || '0'),
        h('div', { flexWrap: 'wrap', marginTop: 18, fontSize: escala(p.titulo, [[30, 56], [60, 46], [999, 38]]), fontWeight: 700, lineHeight: 1.1 }, resaltar(p.titulo, p.acento)),
        p.sub && h('div', { marginTop: 16, fontSize: 28, color: p.suave }, p.sub),
        p.sitio && h('div', { position: 'absolute', right: 90, bottom: 60, fontSize: 24, color: p.suave }, p.sitio),
      ),
  },

  versus: {
    nombre: 'Versus',
    descripcion: 'Dos opciones lado a lado. Para comparativas: esto contra aquello.',
    campos: ['titulo', 'izquierda', 'derecha', 'fondo', 'texto', 'acento'],
    ejemplo: { titulo: '¿Contratar o automatizar?', izquierda: 'Un asistente más', derecha: 'Un agente de IA' },
    dibujar: (p) => {
      const lado = (t, activo) => h('div', { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, borderRadius: 28, background: activo ? p.acento : 'rgba(255,255,255,0.08)', color: activo ? p.sobreAcento : p.texto, fontSize: escala(t, [[16, 52], [30, 42], [999, 34]]), fontWeight: 700, textAlign: 'center' }, t)
      return h('div', { width: ANCHO, height: ALTO, flexDirection: 'column', padding: 70, background: p.fondo, color: p.texto },
        h('div', { justifyContent: 'center', fontSize: escala(p.titulo, [[30, 60], [60, 48], [999, 40]]), fontWeight: 700, letterSpacing: '-0.02em', textAlign: 'center' }, p.titulo),
        h('div', { flex: 1, alignItems: 'stretch', marginTop: 50 },
          lado(p.izquierda || 'A', false),
          h('div', { alignItems: 'center', justifyContent: 'center', width: 110, fontSize: 40, fontWeight: 700, color: p.suave }, 'vs'),
          lado(p.derecha || 'B', true),
        ),
      )
    },
  },

  evento: {
    nombre: 'Evento',
    descripcion: 'Fecha grande, nombre del evento, lugar y botón. Para talleres, webinars y lanzamientos.',
    campos: ['fecha', 'titulo', 'lugar', 'boton', 'fondo', 'texto', 'acento'],
    ejemplo: { fecha: '29 OCT', titulo: 'Tu primer empleado de IA', lugar: 'En vivo por Zoom · 19:00 CDMX', boton: 'Aparta tu lugar' },
    dibujar: (p) => {
      const [dia, ...mes] = (p.fecha || '1 ENE').split(/\s+/)
      return h('div', { width: ANCHO, height: ALTO, alignItems: 'center', padding: '0 90px', background: p.fondo, color: p.texto },
        h('div', { flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 280, height: 320, borderRadius: 36, background: p.acento, color: p.sobreAcento, flexShrink: 0 },
          h('div', { fontSize: 150, fontWeight: 700, lineHeight: 1 }, dia),
          mes.length > 0 && h('div', { fontSize: 46, fontWeight: 700, letterSpacing: '0.08em', marginTop: 8 }, mes.join(' ').toUpperCase()),
        ),
        h('div', { flexDirection: 'column', marginLeft: 70, flex: 1 },
          h('div', { flexWrap: 'wrap', fontSize: escala(p.titulo, [[24, 68], [44, 56], [999, 46]]), fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.02em' }, resaltar(p.titulo, p.acento)),
          p.lugar && h('div', { marginTop: 22, fontSize: 30, color: p.suave }, p.lugar),
          p.boton && h('div', { marginTop: 40, alignSelf: 'flex-start', padding: '16px 40px', borderRadius: 999, border: `3px solid ${p.acento}`, color: p.texto, fontSize: 28, fontWeight: 700 }, p.boton),
        ),
      )
    },
  },

  lista: {
    nombre: 'Lista',
    descripcion: 'Un título y de 2 a 4 puntos numerados. Para guías, checklists y resúmenes.',
    campos: ['titulo', 'puntos', 'sitio', 'fondo', 'texto', 'acento'],
    ejemplo: { titulo: 'Antes de automatizar, revisa:', puntos: 'Que la tarea se repita cada semana | Que alguien la haga igual siempre | Que sepas medir si salió bien', sitio: 'gabrielneuman.com' },
    dibujar: (p) => {
      const puntos = (p.puntos || '').split(/\s*[|;]\s*/).filter(Boolean).slice(0, 4)
      return h('div', { width: ANCHO, height: ALTO, flexDirection: 'column', justifyContent: 'center', padding: '0 90px', background: p.fondo, color: p.texto },
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
    campos: ['titulo', 'autor', 'sub', 'foto', 'sitio', 'fondo', 'texto', 'acento'],
    ejemplo: { titulo: 'Cómo crecer un negocio de servicios sin contratar más', autor: 'Tu invitado', sub: 'Episodio 101', sitio: 'Growth Tactics' },
    dibujar: (p) =>
      h('div', { width: ANCHO, height: ALTO, alignItems: 'center', padding: '0 80px', background: p.fondo, color: p.texto },
        h('div', { flexDirection: 'column', flex: 1, marginRight: 60 },
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
  izquierda: { etiqueta: 'Opción de la izquierda', tipo: 'texto' },
  derecha: { etiqueta: 'Opción de la derecha (resaltada)', tipo: 'texto' },
  fecha: { etiqueta: 'Fecha', tipo: 'texto', ayuda: 'Día y mes, p. ej. 29 OCT.' },
  lugar: { etiqueta: 'Lugar u horario', tipo: 'texto' },
  puntos: { etiqueta: 'Puntos', tipo: 'texto', ayuda: 'De 2 a 4, separados con |.' },
}
