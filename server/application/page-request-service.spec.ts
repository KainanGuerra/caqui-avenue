import { describe, expect, it } from 'vitest'
import { montarContainer } from '../utils/container'
import { loadEnv } from '../infrastructure/env'
import { loggerMudo } from '../infrastructure/logger'
import { relogioFixo } from '../infrastructure/clock'
import { em } from '../testing/fixtures'

const TARDE = '2026-11-18T14:00-03:00'
const NOITE = '2026-11-18T23:00-03:00'
const novo = (momento = TARDE) => {
  const c = montarContainer({ env: loadEnv({}), logger: loggerMudo, clock: relogioFixo(em(momento)) })
  return { c, sessao: c.sessoes.criar('C-0003', momento) }
}

describe('pedido feito pela página, sem passar pela conversa', () => {
  it('segurança: prioridade 0 a qualquer hora, protocolo e os passos da KB-020', () => {
    for (const momento of [TARDE, NOITE]) {
      const { c, sessao } = novo(momento)
      const r = c.pedidos.registrar(sessao.id, 'seguranca', 'Atendimento')!
      expect(r.acao, momento).toBe('seguranca_imediata')
      expect(r.protocolo).toMatch(/^P-\d{4}$/)
      expect(c.casos.obter(sessao.casoId!)!.prioridade).toBe(0)
      expect(sessao.modoSeguranca).toBe(true)
      expect(r.orientacao.map((a) => a.id)).toEqual(['KB-020'])
      expect(c.casos.obter(sessao.casoId!)!.fontes.map((f) => f.id)).toEqual(['KB-020', 'KB-019'])
    }
  })

  it('pessoa no horário vai à fila; fora do horário vira protocolo com o retorno', () => {
    const tarde = novo(TARDE)
    const r1 = tarde.c.pedidos.registrar(tarde.sessao.id, 'pessoa', 'Atendimento')!
    expect(r1).toMatchObject({ acao: 'encaminhar_humano', humanoDisponivel: true, retorno: null })

    const noite = novo(NOITE)
    const r2 = noite.c.pedidos.registrar(noite.sessao.id, 'pessoa', 'Atendimento')!
    expect(r2).toMatchObject({ acao: 'protocolo', humanoDisponivel: false, retorno: 'amanhã a partir das 8h' })
    expect(r2.texto).toContain(r2.protocolo)
    expect(r2.texto).toContain('amanhã a partir das 8h')
  })

  it('especialista: encaminha com a KB-029 como fonte do caso e protocolo', () => {
    const { c, sessao } = novo()
    const r = c.pedidos.registrar(sessao.id, 'especialista', 'Investir')!
    expect(r.acao).toBe('encaminhar_especialista')
    const caso = c.casos.obter(sessao.casoId!)!
    expect(caso.fontes.map((f) => f.id)).toContain('KB-029')
    expect(r.texto).toMatch(/agendamento/)
  })

  it('o pedido fica no histórico da sessão: quem abrir a conversa vê a fala e o protocolo', () => {
    const { c, sessao } = novo()
    const r = c.pedidos.registrar(sessao.id, 'pessoa', 'Atendimento')!
    const [cliente, agente] = sessao.historico
    expect(cliente).toMatchObject({ papel: 'cliente', texto: 'Pedi pela página Atendimento: falar com uma pessoa.' })
    expect(agente).toMatchObject({ papel: 'agente', protocolo: r.protocolo, acao: 'encaminhar_humano' })
  })

  it('um caso por sessão: pedir de novo não duplica o protocolo, e a gravidade só sobe', () => {
    const { c, sessao } = novo()
    const pessoa = c.pedidos.registrar(sessao.id, 'pessoa', 'Atendimento')!
    const seguranca = c.pedidos.registrar(sessao.id, 'seguranca', 'Atendimento')!
    expect(seguranca.protocolo).toBe(pessoa.protocolo)
    expect(c.casos.fila()).toHaveLength(1)
    expect(c.casos.fila()[0]!.prioridade).toBe(0)
  })

  it('depois de o caso ser resolvido, um novo pedido abre outro protocolo', () => {
    const { c, sessao } = novo()
    const primeiro = c.pedidos.registrar(sessao.id, 'pessoa', 'Atendimento')!
    c.casos.resolver(sessao.casoId!, TARDE)
    const segundo = c.pedidos.registrar(sessao.id, 'pessoa', 'Atendimento')!
    expect(segundo.protocolo).not.toBe(primeiro.protocolo)
  })

  it('sessão inexistente não registra nada', () => {
    const { c } = novo()
    expect(c.pedidos.registrar('nao-existe', 'pessoa', 'Atendimento')).toBeNull()
    expect(c.casos.fila()).toEqual([])
  })
})
