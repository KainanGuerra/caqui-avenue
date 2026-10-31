import { createError, defineEventHandler, getRouterParam } from 'h3'
import { montarAtendimento } from '../../../domain/support-view'
import { container } from '../../../utils/container'

// Página de Atendimento: estado pelo relógio do servidor e só os casos do cliente da sessão (regra 10).
export default defineEventHandler((event) => {
  const c = container()
  const sessao = c.sessoes.obter(getRouterParam(event, 'sessaoId') ?? '')
  if (!sessao) throw createError({ statusCode: 404, statusMessage: 'Sessão não encontrada' })
  return montarAtendimento({ momento: c.pipeline.agora(), kb: c.dados.kb, casos: c.casos.fila(), clienteId: sessao.clienteId })
})
