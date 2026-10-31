import { describe, expect, it } from 'vitest'
import { relogioFixo } from '../infrastructure/clock'
import { loadEnv } from '../infrastructure/env'
import { loggerMudo } from '../infrastructure/logger'
import { montarContainer } from '../utils/container'
import { montarAtendimento } from '../domain/support-view'
import { decisaoDoPedido } from '../domain/page-request'
import { em } from '../testing/fixtures'

// A página e a conversa são duas portas para a mesma regra: o mesmo pedido não pode ter respostas diferentes.
const TARDE = '2026-11-18T14:00-03:00'
const NOITE = '2026-11-18T23:00-03:00'
const c = montarContainer({ env: loadEnv({}), clock: relogioFixo(em(TARDE)), logger: loggerMudo })
const diz = (texto: string, momento = TARDE) => c.pipeline.processar(c.sessoes.criar('C-0001', momento).id, texto, momento)

describe('o que a página decide é o que a conversa decidiria', () => {
  it.each([TARDE, NOITE])('pedir uma pessoa pela página ou pela conversa dá a mesma ação (%s, regra 12)', async (momento) => {
    expect((await diz('Quero falar com uma pessoa', momento)).acao).toBe(decisaoDoPedido('pessoa', em(momento)).acao)
  })

  it.each([TARDE, NOITE])('relatar golpe pela página ou pela conversa é segurança imediata (%s, regra 5)', async (momento) => {
    const r = await diz('Preciso falar com a segurança agora: acho que estou sofrendo um golpe.', momento)
    expect(r.acao).toBe(decisaoDoPedido('seguranca', em(momento)).acao)
    expect(c.casos.obter(r.casoId!)!.prioridade).toBe(0)
  })

  it('"Quer saber onde investir?" vai ao especialista nos dois caminhos (regra 4)', async () => {
    const v = montarAtendimento({ momento: em(TARDE), kb: c.dados.kb, casos: [], clienteId: 'C-0001' })
    expect((await diz(v.especialista.pergunta)).acao).toBe(decisaoDoPedido('especialista', em(TARDE)).acao)
  })

  it('cada pergunta frequente, se levada à conversa, é respondida pela mesma fonte que abre na página', async () => {
    const v = montarAtendimento({ momento: em(TARDE), kb: c.dados.kb, casos: [], clienteId: 'C-0001' })
    for (const { pergunta, kbId, artigo } of v.faq) {
      const r = await diz(pergunta)
      expect(r.acao, pergunta).toBe('responder')
      expect(r.fontes.map((f) => f.id), pergunta).toContain(kbId)
      expect(artigo?.id, pergunta).toBe(kbId)
    }
  })
})
