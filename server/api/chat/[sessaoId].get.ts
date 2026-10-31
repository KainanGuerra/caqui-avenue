import { createError, defineEventHandler, getRouterParam } from 'h3'
import { descreverHorario, humanoDisponivel } from '../../domain/business-hours'
import { container } from '../../utils/container'

// Polling do chat do cliente: histórico completo (inclusive as falas do atendente) e o estado do caso.
export default defineEventHandler((event) => {
  const c = container()
  const sessao = c.sessoes.obter(getRouterParam(event, 'sessaoId') ?? '')
  if (!sessao) throw createError({ statusCode: 404, statusMessage: 'Sessão não encontrada' })
  const caso = sessao.casoId ? c.casos.obter(sessao.casoId) : null
  return {
    mensagens: sessao.historico,
    caso: caso ? { protocolo: caso.protocolo, status: caso.status, atendente: caso.atendente } : null,
    humanoDisponivel: humanoDisponivel(c.pipeline.agora()),
    horario: descreverHorario(),
  }
})
