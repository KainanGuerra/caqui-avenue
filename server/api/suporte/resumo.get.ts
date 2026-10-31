import { defineEventHandler } from 'h3'
import { resumirFila } from '../../domain/queue-summary'
import { container } from '../../utils/container'
import { exigirSuporte } from '../../utils/suporte-auth'

// Cartões do painel de suporte: contagens da fila, calculadas aqui e só exibidas na tela.
export default defineEventHandler((event) => {
  exigirSuporte(event)
  return resumirFila(container().casos.fila())
})
