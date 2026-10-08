// La build ESM de satori trae código de Emscripten que en Node lee __dirname al
// cargarse, y en un módulo ESM no existe. Se define antes de importar el motor.
import path from 'node:path'
import { fileURLToPath } from 'node:url'
globalThis.__dirname ??= path.dirname(fileURLToPath(import.meta.url))
