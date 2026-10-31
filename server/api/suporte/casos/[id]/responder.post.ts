import { createError, defineEventHandler, getRouterParam } from 'h3'
import { z } from 'zod'
import { mascararCpf } from '../../../../domain/normalize'
import { corpo } from '../../../../utils/http'
import { isoDe } from '../../../../domain/momento'
import { container } from '../../../../utils/container'
import { exigirSuporte } from '../../../../utils/suporte-auth'

export default defineEventHandler(async (event) => {
  exigirSuporte(event)
  const { texto, atendente } = await corpo(event, z.object({ texto: z.string().trim().min(1).max(2000), atendente: z.string().trim().min(1).max(40).default('Atendente') }))
  const c = container()
  const caso = c.casos.obter(getRouterParam(event, 'id') ?? '')
  const sessao = caso ? c.sessoes.obter(caso.sessaoId) : null
  if (!caso || !sessao) throw createError({ statusCode: 404, statusMessage: 'Caso não encontrado' })
  const m = c.pipeline.agora()
  const atualizado = c.casos.responder(caso.id, sessao, mascararCpf(texto), atendente, isoDe(m))
  if (!atualizado) throw createError({ statusCode: 409, statusMessage: 'Caso já resolvido' })
  return atualizado
})
