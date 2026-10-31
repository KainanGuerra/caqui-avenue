import { createError, defineEventHandler } from 'h3'
import { z } from 'zod'
import { humanoDisponivel } from '../domain/business-hours'
import { corpo } from '../utils/http'
import { isoDe } from '../domain/momento'
import { container } from '../utils/container'
import { kaki } from '../persona'

const esquema = z.object({ clienteId: z.string().regex(/^C-\d{4}$/) })

export default defineEventHandler(async (event) => {
  const { clienteId } = await corpo(event, esquema)
  const c = container()
  const conta = c.dados.dadosDoCliente(clienteId)
  if (!conta) throw createError({ statusCode: 404, statusMessage: 'Cliente não encontrado' })
  const agora = c.pipeline.agora()
  const sessao = c.sessoes.criar(clienteId, isoDe(agora))
  return {
    sessaoId: sessao.id,
    cliente: { id: conta.cliente.id, nome: conta.cliente.nome, idade: conta.cliente.idade },
    persona: { nome: kaki.nome, saudacao: kaki.saudacao },
    humanoDisponivel: humanoDisponivel(agora),
  }
})
