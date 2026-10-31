import { defineEventHandler } from 'h3'
import { container } from '../../utils/container'
import { apresentarCaso } from '../../utils/casos'
import { exigirSuporte } from '../../utils/suporte-auth'

export default defineEventHandler((event) => {
  exigirSuporte(event)
  return container().casos.fila().map(apresentarCaso)
})
