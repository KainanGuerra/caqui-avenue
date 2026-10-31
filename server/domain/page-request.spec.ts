import { describe, expect, it } from 'vitest'
import { em } from '../testing/fixtures'
import { rotuloMotivo } from './case-summary'
import { decisaoDoPedido, respostaDoPedido } from './page-request'

const TARDE = em('2026-11-18T14:00-03:00')
const NOITE = em('2026-11-18T23:00-03:00')

describe('decisão do pedido feito pela página', () => {
  it('segurança é prioridade 0 a qualquer hora (regra 5)', () => {
    for (const m of [TARDE, NOITE]) expect(decisaoDoPedido('seguranca', m)).toMatchObject({ acao: 'seguranca_imediata', prioridade: 0, motivos: ['GOLPE_RELATO'] })
  })

  it('pessoa no horário vai à fila; às 20h ou depois vira protocolo (regra 12)', () => {
    expect(decisaoDoPedido('pessoa', TARDE)).toMatchObject({ acao: 'encaminhar_humano', motivos: ['HUMANO_PEDIDO'], humanoAgora: true })
    expect(decisaoDoPedido('pessoa', em('2026-11-18T20:00-03:00'))).toMatchObject({ acao: 'protocolo', motivos: ['HUMANO_PEDIDO', 'FORA_HORARIO'] })
    expect(decisaoDoPedido('pessoa', NOITE).humanoAgora).toBe(false)
  })

  it('especialista é encaminhamento, com o mesmo rótulo de recomendação do chat (regra 4)', () => {
    const d = decisaoDoPedido('especialista', NOITE)
    expect(d.acao).toBe('encaminhar_especialista')
    expect(rotuloMotivo(d.motivos[0]!)).toBe('pedido de recomendação')
  })

  it('a resposta traz o protocolo e, fora do horário, quando a pessoa volta', () => {
    const fora = respostaDoPedido('pessoa', decisaoDoPedido('pessoa', NOITE), 'P-0042', NOITE)
    expect(fora).toBe('Registramos sua demanda no protocolo P-0042 e retornamos amanhã a partir das 8h.')
    expect(respostaDoPedido('seguranca', decisaoDoPedido('seguranca', NOITE), 'P-0042', NOITE)).toMatch(/P-0042.*Não passe senha/)
  })
})
