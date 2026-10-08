import { GALERIA } from './sitio'
export const POR_PAGINA = 36
export const PAGINAS = Math.ceil(GALERIA.length / POR_PAGINA)
export const tramo = (n: number) => GALERIA.slice((n - 1) * POR_PAGINA, n * POR_PAGINA)
