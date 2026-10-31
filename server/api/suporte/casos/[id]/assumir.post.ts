import { createError, defineEventHandler, getRouterParam } from 'h3'
import { z } from 'zod'
import { corpo } from '../../../../utils/http'
import { isoDe } from '../../../../domain/momento'
import { container } from '../../../../utils/container'
import { exigirSuporte } from '../../../../utils/suporte-auth'

export default defineEventHandler(async (event) => {
  exigirSuporte(event)
  const { atendente } = await corpo(event, z.object({ atendente: z.string().trim().min(1).max(40).default('Atendente') }))
  const c = container()
  const m = c.pipeline.agora()
  const caso = c.casos.assumir(getRouterParam(event, 'id') ?? '', atendente, isoDe(m))
  if (!caso) throw createError({ statusCode: 404, statusMessage: 'Caso não encontrado ou já resolvido' })
  return caso
})
