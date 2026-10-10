# Catálogo de plantillas

<!-- Generado por scripts/catalogo.mjs en cada build. No se edita a mano: se cambia motor/plantillas.js. -->

28 plantillas. Todas salen en los cinco tamaños con `?formato=`:

| formato | PNG | para |
|---|---|---|
| `og` | 1200×630 | WhatsApp, Slack, links |
| `cuadrado` | 1080×1080 | LinkedIn, Facebook |
| `vertical` | 1080×1350 | Feed de Instagram |
| `horizontal` | 1200×675 | X |
| `historia` | 1080×1920 | Stories, Reels, TikTok |

Colores: `fondo`, `texto` y `acento` aceptan hex sin `#` (`acento=e5252a`). Cómo hacer una nueva: `motor/README.md`.

## `marca`: Marca

Título grande a la izquierda, subtítulo y firma abajo. La de gabrielneuman.com.

**Cuándo:** El post es una idea o postura de Gabriel, sin dato ni evento. La opción por defecto.

| campo | qué es |
|---|---|
| `titulo` | Título. Pon *entre asteriscos* lo que va en color de acento. |
| `sub` | Subtítulo |
| `autor` | Autor o nombre |
| `sitio` | Sitio |
| `foto` | Foto (URL) |
| `fondo` | Fondo |
| `texto` | Texto |
| `acento` | Acento |

```
/og/marca/?titulo=Equipos%20chicos%2C%20*resultados%20grandes*&sub=Director%20de%20IA%20fraccional&autor=Gabriel%20Neuman&sitio=gabrielneuman.com
```

## `articulo`: Artículo

Título, extracto y autor con foto. Para posts de blog y newsletters.

**Cuándo:** El post enlaza a un artículo, newsletter o guía larga.

| campo | qué es |
|---|---|
| `titulo` | Título. Pon *entre asteriscos* lo que va en color de acento. |
| `extracto` | Extracto |
| `autor` | Autor o nombre |
| `foto` | Foto (URL) |
| `sitio` | Sitio |
| `fondo` | Fondo |
| `texto` | Texto |
| `acento` | Acento |

```
/og/articulo/?titulo=C%C3%B3mo%20dirigir%20agentes%20de%20IA%20sin%20escribir%20c%C3%B3digo&extracto=Lo%20que%20cambia%20cuando%20el%20equipo%20deja%20de%20pedirle%20cosas%20a%20ChatGPT%20y%20empieza%20a%20delegarle%20trabajo.&autor=Gabriel%20Neuman&sitio=gabrielneuman.com
```

## `titular`: Titular

Un titular centrado con una palabra resaltada y un botón. Para landings.

**Cuándo:** El post cabe en una frase fuerte y no trae lista, cifra ni comparación.

| campo | qué es |
|---|---|
| `titulo` | Título. Pon *entre asteriscos* lo que va en color de acento. |
| `sub` | Subtítulo |
| `boton` | Texto del botón |
| `fondo` | Fondo |
| `texto` | Texto |
| `acento` | Acento |

```
/og/titular/?titulo=Im%C3%A1genes%20OG%20en%20*un%20minuto*&sub=En%20espa%C3%B1ol%2C%20gratis%20y%20de%20c%C3%B3digo%20abierto.&boton=Hacer%20la%20m%C3%ADa
```

## `emoji`: Emoji

Un emoji grande sobre degradado, con título opcional.

**Cuándo:** Anuncio corto y alegre: un lanzamiento, un logro, una novedad.

| campo | qué es |
|---|---|
| `emoji` | Emoji |
| `titulo` | Título. Pon *entre asteriscos* lo que va en color de acento. |
| `fondo` | Fondo |
| `acento` | Acento |
| `texto` | Texto |

```
/og/emoji/?emoji=%F0%9F%9A%80&titulo=Lanzamos%20la%20versi%C3%B3n%202&fondo=%233b5bdb&acento=%23e2553d&texto=%23ffffff
```

## `icono`: Ícono

Un ícono de Lucide en recuadro, título y subtítulo. Para docs y features.

**Cuándo:** El post explica una función o una tarea concreta que se automatiza.

| campo | qué es |
|---|---|
| `icono` | Ícono de Lucide. El nombre en lucide.dev, p. ej. rocket, workflow, bot. |
| `titulo` | Título. Pon *entre asteriscos* lo que va en color de acento. |
| `sub` | Subtítulo |
| `fondo` | Fondo |
| `texto` | Texto |
| `acento` | Acento |

```
/og/icono/?icono=workflow&titulo=Automatiza%20la%20cobranza&sub=Recordatorios%20que%20salen%20solos%2C%20con%20tu%20tono.
```

## `perfil`: Perfil

Foto redonda, nombre y rol. Para páginas de autor, equipo o ponentes.

**Cuándo:** El post presenta a una persona: un invitado, alguien del equipo, un cliente con nombre.

| campo | qué es |
|---|---|
| `foto` | Foto (URL) |
| `autor` | Autor o nombre |
| `sub` | Subtítulo |
| `sitio` | Sitio |
| `fondo` | Fondo |
| `texto` | Texto |
| `acento` | Acento |

```
/og/perfil/?autor=Gabriel%20Neuman&sub=Director%20de%20IA%20fraccional&sitio=gabrielneuman.com
```

## `boton`: Botón

Emoji, titular y una llamada a la acción en píldora. Para ofertas y eventos.

**Cuándo:** El post pide una acción directa: registrarse, descargar, escribir.

| campo | qué es |
|---|---|
| `emoji` | Emoji |
| `titulo` | Título. Pon *entre asteriscos* lo que va en color de acento. |
| `boton` | Texto del botón |
| `fondo` | Fondo |
| `texto` | Texto |
| `acento` | Acento |

```
/og/boton/?emoji=%F0%9F%93%85&titulo=Taller%20en%20vivo%3A%20tu%20primer%20agente&boton=Aparta%20tu%20lugar
```

## `captura`: Captura

Una captura de pantalla dentro de una ventana de navegador, con título arriba.

**Cuándo:** El post habla de un sitio o pantalla y hay captura real que enseñar.

| campo | qué es |
|---|---|
| `imagen` | Captura (URL) |
| `titulo` | Título. Pon *entre asteriscos* lo que va en color de acento. |
| `sitio` | Sitio |
| `fondo` | Fondo |
| `texto` | Texto |
| `acento` | Acento |

```
/og/captura/?titulo=Equipos%20chicos%2C%20resultados%20grandes&sitio=gabrielneuman.com&imagen=%2Fmuestras%2Fcaptura.png
```

## `telefono`: Teléfono

Una captura vertical dentro de un teléfono, con título y subtítulo al lado.

**Cuándo:** El post habla de una app o algo que se usa desde el celular y hay captura vertical.

| campo | qué es |
|---|---|
| `imagen` | Captura (URL) |
| `titulo` | Título. Pon *entre asteriscos* lo que va en color de acento. |
| `sub` | Subtítulo |
| `fondo` | Fondo |
| `texto` | Texto |
| `acento` | Acento |

```
/og/telefono/?titulo=El%20curso%2C%20en%20*tu%20celular*&sub=Ocho%20semanas%20para%20dirigir%20agentes%20de%20IA%20en%20tu%20empresa.&imagen=%2Fmuestras%2Ftelefono.png
```

## `ciudad`: Ciudad

La ciudad y la bandera de quien la ve, detectadas por su conexión. También se fijan por URL.

**Cuándo:** El post es de un evento presencial o de algo que pasa en una ciudad o país.

| campo | qué es |
|---|---|
| `titulo` | Título. Pon *entre asteriscos* lo que va en color de acento. |
| `sub` | Subtítulo |
| `ciudad` | Ciudad. Vacío: la de quien ve la imagen. En el título usa {ciudad} y {pais}. |
| `pais` | País (código de 2 letras). MX, CO, AR, ES… Vacío: el de quien ve la imagen. |
| `imagen` | Captura (URL) |
| `autor` | Autor o nombre |
| `fondo` | Fondo |
| `texto` | Texto |
| `acento` | Acento |

```
/og/ciudad/?titulo=Taller%20presencial%20en%20%7Bciudad%7D&sub=Cupo%20para%2020%20personas&ciudad=Ciudad%20de%20M%C3%A9xico&pais=MX&autor=Gabriel%20Neuman
```

## `cita`: Cita

Una frase entre comillas con quién la dijo. Para entrevistas, testimonios y podcast.

**Cuándo:** El post gira alrededor de una frase textual de alguien (cliente, invitado, Gabriel).

| campo | qué es |
|---|---|
| `titulo` | Título. Pon *entre asteriscos* lo que va en color de acento. |
| `autor` | Autor o nombre |
| `sub` | Subtítulo |
| `foto` | Foto (URL) |
| `fondo` | Fondo |
| `texto` | Texto |
| `acento` | Acento |

```
/og/cita/?titulo=Si%20me%20voy%20ma%C3%B1ana%2C%20*sigue%20corriendo*.&autor=Gabriel%20Neuman&sub=Director%20de%20IA%20fraccional
```

## `cifra`: Cifra

Un número enorme y qué significa. Para resultados, reportes y casos.

**Cuándo:** El post trae UN número real del caso que es el corazón del mensaje. Nunca sin cifra en el texto.

| campo | qué es |
|---|---|
| `cifra` | Cifra |
| `titulo` | Título. Pon *entre asteriscos* lo que va en color de acento. |
| `sub` | Subtítulo |
| `sitio` | Sitio |
| `fondo` | Fondo |
| `texto` | Texto |
| `acento` | Acento |

```
/og/cifra/?cifra=595&titulo=im%C3%A1genes%20OG%20en%20cada%20build&sub=Una%20por%20p%C3%A1gina%2C%20sin%20dise%C3%B1arlas%20a%20mano&sitio=gabrielneuman.com
```

## `versus`: Versus

Dos opciones lado a lado. Para comparativas: esto contra aquello.

**Cuándo:** El post compara dos opciones en pocas palabras: esto contra aquello.

| campo | qué es |
|---|---|
| `titulo` | Título. Pon *entre asteriscos* lo que va en color de acento. |
| `izquierda` | Opción de la izquierda. En duelo: Nombre \| > comando \| ✓ paso \| ✓ paso. |
| `derecha` | Opción de la derecha (resaltada) |
| `fondo` | Fondo |
| `texto` | Texto |
| `acento` | Acento |

```
/og/versus/?titulo=%C2%BFContratar%20o%20automatizar%3F&izquierda=Un%20asistente%20m%C3%A1s&derecha=Un%20agente%20de%20IA
```

## `evento`: Evento

Fecha grande, nombre del evento, lugar y botón. Para talleres, webinars y lanzamientos.

**Cuándo:** El post invita a un evento con fecha: taller, webinar, lanzamiento.

| campo | qué es |
|---|---|
| `fecha` | Fecha. Día y mes, p. ej. 29 OCT. |
| `titulo` | Título. Pon *entre asteriscos* lo que va en color de acento. |
| `lugar` | Lugar u horario |
| `boton` | Texto del botón |
| `fondo` | Fondo |
| `texto` | Texto |
| `acento` | Acento |

```
/og/evento/?fecha=29%20OCT&titulo=Tu%20primer%20empleado%20de%20IA&lugar=En%20vivo%20por%20Zoom%20%C2%B7%2019%3A00%20CDMX&boton=Aparta%20tu%20lugar
```

## `duelo`: Duelo

Fondo negro, titular gordo y dos terminales cara a cara con un VS. Para webinars y comparativas de herramientas.

**Cuándo:** El post o evento compara dos herramientas o formas de trabajar, con ejemplos de qué hace cada una.

| campo | qué es |
|---|---|
| `sub` | Subtítulo |
| `titulo` | Título. Pon *entre asteriscos* lo que va en color de acento. |
| `fecha` | Fecha. Día y mes, p. ej. 29 OCT. |
| `lugar` | Lugar u horario |
| `izquierda` | Opción de la izquierda. En duelo: Nombre \| > comando \| ✓ paso \| ✓ paso. |
| `derecha` | Opción de la derecha (resaltada) |
| `fondo` | Fondo |
| `texto` | Texto |
| `acento` | Acento |

```
/og/duelo/?sub=*En%20vivo*%20%C2%B7%20Sesi%C3%B3n%20de%20preguntas&titulo=C%C3%B3mo%20elegir%20entre%20*n8n*%20y%20*Claude%20Code*&fecha=Jueves%2029%20de%20octubre&lugar=19%3A00%20CDMX%20%C2%B7%2045%20min%20%C2%B7%20*Gratis%20en%20Zoom*&izquierda=n8n%20%7C%20%3E%20arma%20el%20reporte%20de%20ventas%20%7C%20%E2%9C%93%20lee%20Sheets%2C%20CRM%20y%20correo%20%7C%20%E2%9C%93%20todos%20los%20lunes%20a%20las%208%3A00&derecha=Claude%20Code%20%7C%20%3E%20hazme%20un%20portal%20de%20clientes%20%7C%20%E2%9C%93%20login%2C%20facturas%20y%20tickets%20%7C%20%E2%9C%93%20vista%20previa%20en%20localhost%3A3000
```

## `cohort`: Cohort

Nombre del programa en grande, etiqueta amarilla, una terminal con lo que incluye y franja con la fecha de arranque. Para cohorts y cursos en vivo.

**Cuándo:** El post vende o anuncia un programa de varias sesiones: cohort, curso en vivo, mastermind.

| campo | qué es |
|---|---|
| `titulo` | Título. Pon *entre asteriscos* lo que va en color de acento. |
| `sub` | Subtítulo |
| `puntos` | Puntos. De 2 a 4, separados con \|. |
| `fecha` | Fecha. Día y mes, p. ej. 29 OCT. |
| `sitio` | Sitio |
| `fondo` | Fondo |
| `texto` | Texto |
| `acento` | Acento |

```
/og/cohort/?titulo=Copiloto%20en%204%20semanas&sub=Cohort%20en%20vivo&puntos=4%20sesiones%20de%2090%20min%20con%20demos%20reales%20%7C%203%20talleres%20para%20configurarlo%20contigo%20%7C%201%20experto%20invitado%20%7C%20Grabaciones%20de%20por%20vida&fecha=Arranca%20el%209%20de%20noviembre&sitio=gabrielneuman.com%2Fcohort
```

## `miniatura`: Miniatura

Estilo miniatura de YouTube: titular gordo por renglones en neón y blanco, persona recortada, ventana con flecha, gráfica rosa que sube y botón de play.

**Cuándo:** El post presume un resultado o enlaza a un video, una demo o un caso; mejor con foto recortada (PNG sin fondo) de la persona.

| campo | qué es |
|---|---|
| `titulo` | Título. Pon *entre asteriscos* lo que va en color de acento. |
| `boton` | Texto del botón |
| `foto` | Foto (URL) |
| `imagen` | Captura (URL) |
| `fondo` | Fondo |
| `texto` | Texto |
| `acento` | Acento |

```
/og/miniatura/?titulo=*Copiloto%20en*%20%7C%20*4%20semanas*%20%7C%20sin%20contratar%20%7C%20a%20nadie%20m%C3%A1s%20%7C%20*con%20IA*&boton=Ver%20ahora&foto=%2Fmuestras%2Fpersona.png&imagen=%2Fmuestras%2Fcaptura.png
```

## `escaparate`: Escaparate

Franja amarilla arriba, titular blanco gigante, dos íconos en mosaico brillante a los lados y la persona al centro. Para listas, herramientas y "lo mejor de la semana".

**Cuándo:** El post presenta herramientas, recursos o una selección ("las 5 herramientas que…"), sobre todo si nombra dos productos.

| campo | qué es |
|---|---|
| `sub` | Subtítulo |
| `titulo` | Título. Pon *entre asteriscos* lo que va en color de acento. |
| `icono` | Ícono de Lucide. El nombre en lucide.dev, p. ej. rocket, workflow, bot. |
| `icono2` | Segundo ícono de Lucide. El de la derecha, sobre fondo blanco. P. ej. github, bot. |
| `foto` | Foto (URL) |
| `imagen` | Captura (URL) |
| `fondo` | Fondo |
| `texto` | Texto |
| `acento` | Acento |

```
/og/escaparate/?sub=Lo%20mejor%20de%20la%20semana&titulo=Herramientas%20de%20IA&icono=sparkles&icono2=git-branch&foto=%2Fmuestras%2Fpersona.png
```

## `tuit`: Tuit

Foto de fondo y una tarjeta negra con borde amarillo: avatar, @usuario con palomita y la frase en grande, como un tuit.

**Cuándo:** El post tiene una frase corta y contundente que funciona sola (una opinión, una regla, un "deja de…").

| campo | qué es |
|---|---|
| `titulo` | Título. Pon *entre asteriscos* lo que va en color de acento. |
| `autor` | Autor o nombre |
| `foto` | Foto (URL) |
| `imagen` | Captura (URL) |
| `fondo` | Fondo |
| `texto` | Texto |
| `acento` | Acento |

```
/og/tuit/?titulo=Deja%20de%20vender%20consultor%C3%ADa&autor=%40gabrielneuman&foto=%2Fmuestras%2Fpersona.png
```

## `ruta`: Ruta

Fondo azul, título grande y una ruta de 3 a 5 pasos en recuadros unidos con flechas punteadas, con la persona abajo. Estilo miniatura de podcast.

**Cuándo:** El post explica un camino o proceso en pasos ("de 0 a 50 mil", "cómo pasé de X a Y", un método en etapas).

| campo | qué es |
|---|---|
| `titulo` | Título. Pon *entre asteriscos* lo que va en color de acento. |
| `puntos` | Puntos. De 2 a 4, separados con \|. |
| `foto` | Foto (URL) |
| `fondo` | Fondo |
| `texto` | Texto |
| `acento` | Acento |

```
/og/ruta/?titulo=La%20ruta%20de%20*50%20mil*&puntos=Elige%20un%20nicho%20%7C%20Arma%20la%20oferta%20%7C%20Primeros%2010%20clientes%20%7C%20Automatiza%20%7C%20Escala&foto=%2Fmuestras%2Fpersona.png
```

## `lista`: Lista

Un título y de 2 a 4 puntos numerados. Para guías, checklists y resúmenes.

**Cuándo:** El post trae de 2 a 4 pasos, criterios o puntos.

| campo | qué es |
|---|---|
| `titulo` | Título. Pon *entre asteriscos* lo que va en color de acento. |
| `puntos` | Puntos. De 2 a 4, separados con \|. |
| `sitio` | Sitio |
| `fondo` | Fondo |
| `texto` | Texto |
| `acento` | Acento |

```
/og/lista/?titulo=Antes%20de%20automatizar%2C%20revisa%3A&puntos=Que%20la%20tarea%20se%20repita%20cada%20semana%20%7C%20Que%20alguien%20la%20haga%20igual%20siempre%20%7C%20Que%20sepas%20medir%20si%20sali%C3%B3%20bien&sitio=gabrielneuman.com
```

## `entrevista`: Entrevista

Marca arriba, nombre del invitado en minúsculas, titular oscuro sobre franja amarilla, remate en blanco y la persona a la derecha.

**Cuándo:** El post es de una entrevista, episodio o charla con invitado y una frase fuerte; mejor con foto recortada de la persona.

| campo | qué es |
|---|---|
| `sitio` | Sitio |
| `autor` | Autor o nombre |
| `titulo` | Título. Pon *entre asteriscos* lo que va en color de acento. |
| `sub` | Subtítulo |
| `foto` | Foto (URL) |
| `fondo` | Fondo |
| `texto` | Texto |
| `acento` | Acento |

```
/og/entrevista/?sitio=Tu%20podcast%20%7C%20Episodio%201&autor=Gabriel%20Neuman&titulo=Vender%20servicios%20tiene%20reglas%20nuevas&sub=Esto%20es%20lo%20que%20cambi%C3%B3&foto=%2Fmuestras%2Fpersona.png
```

## `ceoagentico`: El CEO agéntico

Portada del podcast El CEO agéntico: logo, episodio, los dos de la conversación (anfitrión e invitado) con sus fotos y el titular sobre franja verde.

**Cuándo:** El post es de un episodio de El CEO agéntico.

| campo | qué es |
|---|---|
| `sitio` | Sitio |
| `anfitrion` | Anfitrión |
| `autor` | Autor o nombre |
| `titulo` | Título. Pon *entre asteriscos* lo que va en color de acento. |
| `sub` | Subtítulo |
| `foto2` | Foto del anfitrión (URL) |
| `foto` | Foto (URL) |
| `fondo` | Fondo |
| `texto` | Texto |
| `acento` | Acento |

```
/og/ceoagentico/?sitio=Episodio%201&anfitrion=Gabriel%20Neuman&autor=Tu%20invitado&titulo=Un%20CEO%20que%20delega%20en%20agentes%2C%20no%20en%20m%C3%A1s%20gente&sub=Lo%20que%20cambia%20en%20tu%20empresa&foto2=%2Fmuestras%2Fpersona.png
```

## `ceoportada`: El CEO agéntico: portada

El ícono del podcast El CEO agéntico: logo grande, "un podcast de" y el anfitrión. Para Spotify, Apple Podcasts y el perfil.

**Cuándo:** Se necesita la portada o el ícono del show, no la de un episodio.

| campo | qué es |
|---|---|
| `anfitrion` | Anfitrión |
| `sub` | Subtítulo |
| `foto2` | Foto del anfitrión (URL) |
| `fondo` | Fondo |
| `texto` | Texto |
| `acento` | Acento |

```
/og/ceoportada/?anfitrion=Gabriel%20Neuman&sub=Conversaciones%20sobre%20dirigir%20con%20agentes%20de%20IA&foto2=%2Fmuestras%2Fpersona.png
```

## `ceopromo`: El CEO agéntico: promo

Para anunciar el podcast o un episodio que viene: "Muy pronto", qué vamos a hacer en puntos, fecha de estreno y las dos personas.

**Cuándo:** Se anuncia el lanzamiento del podcast o el próximo episodio, antes de que salga.

| campo | qué es |
|---|---|
| `sitio` | Sitio |
| `titulo` | Título. Pon *entre asteriscos* lo que va en color de acento. |
| `puntos` | Puntos. De 2 a 4, separados con \|. |
| `fecha` | Fecha. Día y mes, p. ej. 29 OCT. |
| `anfitrion` | Anfitrión |
| `autor` | Autor o nombre |
| `foto2` | Foto del anfitrión (URL) |
| `foto` | Foto (URL) |
| `fondo` | Fondo |
| `texto` | Texto |
| `acento` | Acento |

```
/og/ceopromo/?sitio=Muy%20pronto&titulo=Un%20podcast%20para%20dirigir%20tu%20empresa%20*con%20agentes%20de%20IA*&puntos=Casos%20reales%20de%20CEOs%20%7C%20Qu%C3%A9%20delegar%20a%20un%20agente%20y%20qu%C3%A9%20no%20%7C%20Herramientas%20que%20s%C3%AD%20funcionan&fecha=Estreno%2029%20OCT&anfitrion=Gabriel%20Neuman&autor=Tu%20invitado&foto2=%2Fmuestras%2Fpersona.png
```

## `alianza`: Alianza

Dos marcas lado a lado, titular en dos pesos, tres pilares con ícono, remate y botón; un globo de luz a la derecha.

**Cuándo:** Se anuncia una alianza o colaboración entre dos marcas, con lo que ofrecen juntas.

| campo | qué es |
|---|---|
| `logo` | Logo (URL). Sin logo sale el sitio en texto. |
| `sitio` | Sitio. La marca aliada, en texto (si no hay logo). |
| `autor` | Autor o nombre. La segunda marca, a la derecha de la raya. |
| `titulo` | Título. Lo *marcado* sale en negrita; lo demás, fino. |
| `sub` | Subtítulo |
| `pilares` | Pilares. Hasta 3, separados con \|: ícono de Lucide: texto. P. ej. truck: Monitoreo de flotas. |
| `extracto` | Extracto. Remate: *frase en negrita.* y lo que sigue, debajo. |
| `boton` | Texto del botón |
| `foto` | Foto (URL). Imagen del globo. Sin ella se dibuja el planeta de puntos en el acento. |
| `fondo` | Fondo |
| `texto` | Texto |
| `acento` | Acento |

```
/og/alianza/?sitio=Margara&autor=Gabriel%20Neuman&titulo=*Una%20alianza*%20que%20llega%20a%20toda%20*Am%C3%A9rica.*&sub=Tecnolog%C3%ADa%2C%20datos%20y%20sostenibilidad%20para%20un%20futuro%20m%C3%A1s%20eficiente%20y%20responsable.&pilares=truck%3A%20Monitoreo%20de%20flotas%20%7C%20leaf%3A%20Gesti%C3%B3n%20ambiental%20%7C%20chart-column%3A%20Datos%20para%20decisiones%20reales&extracto=*Dos%20soluciones.%20Una%20misma%20visi%C3%B3n.*%20Empresas%20m%C3%A1s%20eficientes%20y%20un%20impacto%20positivo%20en%20la%20regi%C3%B3n.&boton=Conoc%C3%A9%20m%C3%A1s
```

## `recibo`: Recibo

Una cifra que brilla a la izquierda y un ticket con lo que ya no pagas, tachado, a la derecha.

**Cuándo:** El post cuenta un ahorro: herramientas o gastos que se reemplazan y lo que cuesta ahora.

| campo | qué es |
|---|---|
| `cifra` | Cifra. Lo que cuesta ahora, p. ej. $0. |
| `sub` | Subtítulo. Debajo de la cifra, p. ej. al mes. |
| `puntos` | Puntos. Lo que se tacha en el ticket, hasta 4: Nombre: precio \| Nombre: precio. |
| `total` | Total. Vacío: la cifra. |
| `fondo` | Fondo |
| `texto` | Texto |
| `acento` | Acento |

```
/og/recibo/?cifra=%240&sub=al%20mes&puntos=Ahrefs%3A%20%24129%20%7C%20Semrush%3A%20%24139&total=%240.00
```

## `podcast`: Podcast

Foto del invitado, nombre, episodio y tema. Para episodios de podcast o YouTube.

**Cuándo:** El post es de un episodio de podcast o video con invitado.

| campo | qué es |
|---|---|
| `titulo` | Título. Pon *entre asteriscos* lo que va en color de acento. |
| `autor` | Autor o nombre |
| `sub` | Subtítulo |
| `foto` | Foto (URL) |
| `sitio` | Sitio |
| `fondo` | Fondo |
| `texto` | Texto |
| `acento` | Acento |

```
/og/podcast/?titulo=C%C3%B3mo%20crecer%20un%20negocio%20de%20servicios%20sin%20contratar%20m%C3%A1s&autor=Tu%20invitado&sub=Episodio%20101&sitio=Growth%20Tactics
```
