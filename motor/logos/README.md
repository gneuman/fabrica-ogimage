# Logos de marca propios

Los que **no** trae Simple Icons (los quitó o nunca los tuvo). Un SVG por marca,
ya con su color. `motor/render.js` los busca antes que Simple Icons; PostLeads
los recibe con `plantillas:sincronizar`. Nunca se dibuja un logo: si no hay
fuente, la plantilla pone un ícono genérico.

| Archivo | Marca | De dónde salió (2026-11-01) |
|---|---|---|
| `openai.svg` | OpenAI | gnb-meta `skills/compartidas/imagenes/recursos/logos.json` (Simple Icons, CC0, versión anterior) |
| `slack.svg` | Slack | gnb-meta `logos.json` (Simple Icons, CC0, versión anterior) |
| `canva.svg` | Canva | gnb-meta `logos.json` (Simple Icons, CC0, versión anterior) |
| `linkedin.svg` | LinkedIn | gnb-meta `logos.json` (Simple Icons, CC0, versión anterior) |
| `lovable.svg` | Lovable | svgl (github.com/pheralb/svgl, `static/library/lovable.svg`; marca: lovable.dev/brand). Más nítido que `lovable.png` de gnb-meta, mismo logo |
| `bolt.svg` | Bolt (bolt.new) | svgl (`static/library/bolt-new.svg`), con el `fill` corregido (`#0000000` → `#000000`) |
| `claudecode.svg` | Claude Code | El asterisco de Claude (Simple Icons `claude`, CC0). Gabriel prefiere el asterisco al ícono pixelado de `claudecode` (2026-11-01) |

Para agregar uno: el SVG oficial de la marca (su página de prensa o brand),
Wikimedia Commons o svgl; el archivo se llama como el slug (`minúsculas`, sin
espacios) y se anota aquí su origen.
