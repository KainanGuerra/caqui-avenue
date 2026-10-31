import { createError, defineEventHandler, getRouterParam } from 'h3'
import { isoDe } from '../../../../domain/momento'
import { container } from '../../../../utils/container'
import { exigirSuporte } from '../../../../utils/suporte-auth'

export default defineEventHandler((event) => {
  exigirSuporte(event)
  const c = container()
  const m = c.pipeline.agora()
  const caso = c.casos.resolver(getRouterParam(event, 'id') ?? '', isoDe(m))
  if (!caso) throw createError({ statusCode: 404, statusMessage: 'Caso não encontrado' })
  return caso
})
