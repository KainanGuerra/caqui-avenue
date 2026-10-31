import { describe, expect, it } from 'vitest'
import { relogioFixo } from '../infrastructure/clock'
import { loadEnv } from '../infrastructure/env'
import { loggerMudo } from '../infrastructure/logger'
import { sugerir, type ContextoSugestao } from '../domain/suggestions'
import { montarContainer } from '../utils/container'
import { em } from '../testing/fixtures'

// Sugestão que o agente não entende seria uma promessa quebrada: toda frase sugerida precisa ter resposta.
describe('toda sugestão tem resposta', () => {
  // Centenas de frases passam pelo pipeline inteiro; com a suíte em paralelo, os 5s padrão do Vitest ficam no limite.
  const TEMPO_PARA_TODAS_AS_FRASES_MS = 30_000
  const DIA = '2026-11-18T14:00-03:00'
  const c = montarContainer({ env: loadEnv({}), clock: relogioFixo(em(DIA)), logger: loggerMudo })
  const ctx = (id: string, extra: Partial<ContextoSugestao> = {}): ContextoSugestao => {
    const conta = c.dados.dadosDoCliente(id)!
    return { cliente: conta.cliente, posicoes: conta.posicoes, produtos: c.dados.taxas.produtos, ultimaAcao: null, ultimasIntencoes: [], ultimoProduto: null, humanoAssumiu: false, rascunho: '', hoje: '2026-11-18', ...extra }
  }

  const frases = new Set<string>()
  const digitados = ['', 'golp', 'imposto', 'poup', 'resgate', 'encerr', 'reclam', 'sms', 'cdb', 'prazo', 'pessoa', 'garantia', 'senha']
  const acoes = [null, 'seguranca_imediata', 'encaminhar_especialista', 'encaminhar_humano', 'protocolo'] as const
  for (const id of c.dados.clientes.keys()) {
    for (const rascunho of digitados) for (const ultimaAcao of acoes) {
      for (const s of sugerir(ctx(id, { rascunho, ultimaAcao, ultimasIntencoes: ['prazo_resgate', 'imposto'] }), 8).sugestoes) frases.add(`${id}|${s}`)
    }
  }

  it('gera frases para todos os clientes', () => {
    expect(frases.size).toBeGreaterThan(200)
  })

  it('o agente entende todas elas, nunca pede para reformular e nunca diz que não tem a informação', async () => {
    const problemas: string[] = []
    for (const par of frases) {
      const [id, frase] = par.split('|') as [string, string]
      const s = c.sessoes.criar(id, DIA)
      const r = await c.pipeline.processar(s.id, frase, DIA)
      if (r.motivos.includes('NAO_ENTENDEU') || /não tenho na minha base|Não consegui entender/.test(r.texto)) problemas.push(`${id}: "${frase}" -> ${r.acao} ${r.texto.slice(0, 70)}`)
    }
    expect(problemas).toEqual([])
  }, TEMPO_PARA_TODAS_AS_FRASES_MS)
})
