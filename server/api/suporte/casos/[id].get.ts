import { createError, defineEventHandler, getRouterParam } from 'h3'
import { container } from '../../../utils/container'
import { apresentarCaso } from '../../../utils/casos'
import { exigirSuporte } from '../../../utils/suporte-auth'

export default defineEventHandler((event) => {
  exigirSuporte(event)
  const c = container()
  const caso = c.casos.obter(getRouterParam(event, 'id') ?? '')
  if (!caso) throw createError({ statusCode: 404, statusMessage: 'Caso não encontrado' })
  const sessao = c.sessoes.obter(caso.sessaoId)
  return { caso: apresentarCaso(caso), mensagens: sessao?.historico ?? [], esperaEstimadaMin: c.casos.esperaEstimadaMin(caso) }
})
