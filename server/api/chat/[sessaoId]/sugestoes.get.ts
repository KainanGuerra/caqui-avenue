import { createError, defineEventHandler, getQuery, getRouterParam } from 'h3'
import { z } from 'zod'
import { sugerir } from '../../../domain/suggestions'
import { container } from '../../../utils/container'

const consulta = z.object({ q: z.string().max(200).default('') })

// Sugestões para o cliente: dependem do tipo de cliente, do que ele tem na conta, da conversa até aqui
// e do que ele está digitando. Só lê os dados da própria sessão.
export default defineEventHandler((event) => {
  const c = container()
  const sessao = c.sessoes.obter(getRouterParam(event, 'sessaoId') ?? '')
  if (!sessao) throw createError({ statusCode: 404, statusMessage: 'Sessão não encontrada' })
  const conta = c.dados.dadosDoCliente(sessao.clienteId)
  if (!conta) throw createError({ statusCode: 404, statusMessage: 'Cliente não encontrado' })
  const { q } = consulta.parse(getQuery(event))
  const caso = sessao.casoId ? c.casos.obter(sessao.casoId) : null
  const ultimaDoAgente = [...sessao.historico].reverse().find((m) => m.papel === 'agente')
  return sugerir({
    cliente: conta.cliente, posicoes: conta.posicoes, produtos: c.dados.taxas.produtos,
    ultimaAcao: ultimaDoAgente?.acao ?? null, ultimasIntencoes: sessao.ultimasIntencoes, ultimoProduto: sessao.ultimoProduto,
    humanoAssumiu: caso?.status === 'assumido', rascunho: q, hoje: c.pipeline.agora().data,
  })
})
