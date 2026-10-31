import { createError, defineEventHandler, getRouterParam } from 'h3'
import { montarConta } from '../../../domain/account-view'
import { container } from '../../../utils/container'

// Dashboard do cliente: só leitura, só os dados do cliente da sessão (regra 10). Sessão desconhecida é 404.
export default defineEventHandler((event) => {
  const c = container()
  const sessao = c.sessoes.obter(getRouterParam(event, 'sessaoId') ?? '')
  if (!sessao) throw createError({ statusCode: 404, statusMessage: 'Sessão não encontrada' })
  const conta = c.dados.dadosDoCliente(sessao.clienteId)
  if (!conta) throw createError({ statusCode: 404, statusMessage: 'Cliente não encontrado' })
  return montarConta(conta, c.dados.taxas, c.cal, c.relogio.agora())
})
