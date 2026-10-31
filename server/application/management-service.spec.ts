import { describe, expect, it } from 'vitest'
import { relogioFixo } from '../infrastructure/clock'
import { loadEnv } from '../infrastructure/env'
import { comMedicao, type LlmPort } from '../infrastructure/llm/port'
import { loggerMudo } from '../infrastructure/logger'
import { em } from '../testing/fixtures'
import { montarContainer } from '../utils/container'
import type { Redator } from './pipeline'

const DIA = '2026-11-18T14:00-03:00'
const PRAZO = 'Pedi o resgate do Caqui Renda Fixa na sexta, 30/10, às 17h. Quando o dinheiro cai?'

function novo(redator?: Redator) {
  const c = montarContainer({ env: loadEnv({}), clock: relogioFixo(em(DIA)), logger: loggerMudo, ...(redator ? { redator } : {}) })
  const conversa = (clienteId: string) => {
    const s = c.sessoes.criar(clienteId, DIA)
    return (texto: string) => c.pipeline.processar(s.id, texto, DIA)
  }
  return { c, conversa }
}

describe('painel do gerente: o que passa pelo pipeline aparece no painel', () => {
  it('antes do primeiro atendimento o painel está vazio, sem 0% inventado', () => {
    const p = novo().c.gestao.painel()
    expect(p.conversas).toBe(0)
    expect(p.resolucaoAutomaticaPct).toBeNull()
    expect(p.redacao).toBe('template')
  })

  it('conta conversas, mensagens, escalonadas e lista o caso com o protocolo', async () => {
    const { c, conversa } = novo()
    const rafael = conversa('C-0002')
    await rafael(PRAZO)
    await rafael('qual o horário de corte do CDB?')
    const marta = conversa('C-0001')
    const golpe = await marta('ligaram da segurança pedindo minha senha')

    const p = c.gestao.painel()
    expect(p.conversas).toBe(2)
    expect(p.mensagens).toBe(3)
    expect(p.escalonadas).toBe(1)
    expect(p.resolucaoAutomaticaPct).toBe(50)
    expect(p.casos.total).toBe(1)
    expect(p.casos.itens[0]).toMatchObject({ protocolo: golpe.protocolo, acao: 'Segurança imediata', clienteNome: 'Marta Siqueira' })
    expect(p.qualidade.comFontePct).toBe(100)
    expect(p.latencia.mediaMs).not.toBeNull()
  })

  it('texto do modelo reprovado pelo validador entra na qualidade', async () => {
    const { c, conversa } = novo({ redigir: async () => 'Cai logo, fique tranquilo (KB-006).' })
    await conversa('C-0002')(PRAZO)
    expect(c.gestao.painel().qualidade).toMatchObject({ redacoesLlm: 1, reprovadasPct: 100 })
  })

  it('erro do provedor não conta como resposta barrada: a IA nem chegou a escrever', async () => {
    const { c, conversa } = novo({ redigir: async () => { throw new Error('timeout') } })
    await conversa('C-0002')(PRAZO)
    expect(c.gestao.painel().qualidade).toMatchObject({ redacoesLlm: 0, reprovadasPct: null })
  })
})

describe('medição das chamadas ao modelo', () => {
  it('registra tamanho do pedido e da resposta, tempo e sucesso, também quando falha', async () => {
    const registros: unknown[] = []
    let t = 0
    const relogio = () => (t += 100)
    const ok: LlmPort = { completar: async () => 'resposta' }
    const falha: LlmPort = { completar: async () => { throw new Error('fora do ar') } }

    await comMedicao(ok, (r) => registros.push(r), relogio).completar({ system: 'abc', usuario: 'de' })
    await expect(comMedicao(falha, (r) => registros.push(r), relogio).completar({ system: 'a', usuario: '' })).rejects.toThrow('fora do ar')

    expect(registros).toEqual([
      { caracteresEntrada: 5, caracteresSaida: 8, ms: 100, ok: true },
      { caracteresEntrada: 1, caracteresSaida: 0, ms: 100, ok: false },
    ])
  })
})
