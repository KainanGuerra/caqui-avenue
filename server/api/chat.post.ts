import { createError, defineEventHandler } from 'h3'
import { z } from 'zod'
import { corpo } from '../utils/http'
import { container } from '../utils/container'

const esquema = z.object({
  sessaoId: z.string().uuid(),
  texto: z.string().trim().min(1).max(2000),
  // Só para teste e demonstração: simula o horário (ISO com offset).
  momento: z.string().regex(/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/).optional(),
})

export default defineEventHandler(async (event) => {
  const { sessaoId, texto, momento } = await corpo(event, esquema)
  const c = container()
  if (!c.sessoes.obter(sessaoId)) throw createError({ statusCode: 404, statusMessage: 'Sessão não encontrada' })
  return c.pipeline.processar(sessaoId, texto, momento)
})
