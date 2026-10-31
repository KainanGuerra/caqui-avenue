import { describe, expect, it } from 'vitest'
import { relogioFixo } from '../../server/infrastructure/clock'
import { loadEnv } from '../../server/infrastructure/env'
import { loggerMudo } from '../../server/infrastructure/logger'
import { montarContainer } from '../../server/utils/container'
import { montarAtendimento } from '../../server/domain/support-view'
import { em } from '../../server/testing/fixtures'
import { PEDIDOS } from './pedidos'

const DIA = '2026-11-18T14:00-03:00'
const NOITE = '2026-11-18T23:00-03:00'
const c = montarContainer({ env: loadEnv({}), clock: relogioFixo(em(DIA)), logger: loggerMudo })
const diz = (texto: string, momento = DIA) => c.pipeline.processar(c.sessoes.criar('C-0001', momento).id, texto, momento)

describe('o que cada botão da tela pede ao pipeline', () => {
  it.each([DIA, NOITE])('"Falar com a segurança agora" vira segurança imediata, com prioridade de golpe (%s, regra 5)', async (momento) => {
    const r = await diz(PEDIDOS.seguranca, momento)
    expect(r.acao).toBe('seguranca_imediata')
    expect(c.casos.obter(r.casoId!)!.prioridade).toBe(0)
  })

  it('"Falar com uma pessoa" às 14h encaminha a uma pessoa', async () => {
    expect((await diz(PEDIDOS.pessoa)).acao).toBe('encaminhar_humano')
  })

  it('"Registrar minha demanda" às 23h devolve o protocolo na resposta (regra 12)', async () => {
    const r = await diz(PEDIDOS.pessoa, NOITE)
    expect(r.acao).toBe('protocolo')
    expect(r.protocolo).toMatch(/^P-\d{4}$/)
  })

  it('"Resgatar" pergunta o prazo e a resposta cita a KB-006', async () => {
    const r = await diz(PEDIDOS.resgate)
    expect(r.acao).toBe('responder')
    expect(r.fontes.map((f) => f.id)).toContain('KB-006')
  })

  it('cada pergunta frequente, levada à conversa, é respondida pela mesma fonte que a tela mostra', async () => {
    const v = montarAtendimento({ momento: em(DIA), kb: c.dados.kb, casos: [], clienteId: 'C-0001' })
    for (const { pergunta, kbId } of v.faq) {
      const r = await diz(pergunta)
      expect(r.acao, pergunta).toBe('responder')
      expect(r.fontes.map((f) => f.id), pergunta).toContain(kbId)
    }
  })

  it('"Quer saber onde investir?" vai ao especialista (regra 4)', async () => {
    const v = montarAtendimento({ momento: em(DIA), kb: c.dados.kb, casos: [], clienteId: 'C-0001' })
    expect((await diz(v.especialista.pergunta)).acao).toBe('encaminhar_especialista')
  })
})
