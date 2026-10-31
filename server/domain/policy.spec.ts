import { describe, expect, it } from 'vitest'
import { em } from '../testing/fixtures'
import { decidir } from './policy'
import { novaSessao, type Sessao } from './session'
import type { Sinais } from './signals'

const dia = em('2026-11-18T14:00-03:00')
const noite = em('2026-11-18T23:00-03:00')
const sessao = (parcial: Partial<Sessao> = {}): Sessao => ({ ...novaSessao('s1', 'C-0002', '2026-11-18T14:00'), ...parcial })
const d = (sinais: Sinais, extra: { entendeu?: boolean; sessao?: Partial<Sessao>; momento?: typeof dia } = {}) =>
  decidir({ sinais, entendeu: extra.entendeu ?? true, sessao: sessao(extra.sessao), momento: extra.momento ?? dia })

describe('política de decisão', () => {
  it('golpe vence tudo, a qualquer hora', () => {
    expect(d({ golpe: ['G'], recomendacao: ['R'], vulneravel: ['V'] }, { momento: noite })).toMatchObject({ acao: 'seguranca_imediata', prioridade: 0 })
  })

  it('modo segurança trava a sessão mesmo sem novo sinal', () => {
    expect(d({}, { sessao: { modoSeguranca: true } })).toMatchObject({ acao: 'seguranca_imediata', motivos: ['GOLPE_SESSAO'] })
  })

  it.each([
    [{ vulneravel: ['V'], recomendacao: ['R'] }, 'encaminhar_humano'],
    [{ dado_alheio: ['D'], recomendacao: ['R'] }, 'recusar'],
    [{ recomendacao: ['R'], humano: ['H'] }, 'encaminhar_especialista'],
    [{ injecao: ['I'], recomendacao: ['R'] }, 'encaminhar_especialista'],
    [{ cancelamento: ['C'] }, 'responder'],
    [{ reclamacao: ['R'] }, 'protocolo'],
    [{ humano: ['H'] }, 'encaminhar_humano'],
  ] as const)('sinais %j -> %s', (sinais, acao) => {
    expect(d(sinais as Sinais).acao).toBe(acao)
  })

  it('vulnerável persiste na sessão', () => {
    expect(d({}, { sessao: { vulneravel: true } })).toMatchObject({ acao: 'encaminhar_humano', motivos: ['VULNERAVEL_SESSAO'] })
  })

  it('fora do horário humano vira protocolo, mas golpe segue imediato', () => {
    expect(d({ humano: ['H'] }, { momento: noite })).toMatchObject({ acao: 'protocolo', humanoAgora: false })
    expect(d({ vulneravel: ['V'] }, { momento: noite })).toMatchObject({ acao: 'protocolo', prioridade: 1 })
  })

  it('retenção só é oferecida uma vez', () => {
    expect(d({ cancelamento: ['C'] }).oferecerRetencao).toBe(true)
    expect(d({ cancelamento: ['C'] }, { sessao: { retencaoOferecida: true } }).oferecerRetencao).toBe(false)
  })

  it('PT-27: duas respostas sem entender, a segunda já oferece humano, a terceira encaminha', () => {
    expect(d({}, { entendeu: false })).toMatchObject({ acao: 'responder', naoEntendeu: true, oferecerHumano: false })
    expect(d({}, { entendeu: false, sessao: { malEntendidos: 1 } })).toMatchObject({ acao: 'responder', oferecerHumano: true })
    expect(d({}, { entendeu: false, sessao: { malEntendidos: 2 } })).toMatchObject({ acao: 'encaminhar_humano', motivos: ['NAO_ENTENDEU_2X'] })
  })

  it('quinto passo sem resolver entrega ao humano', () => {
    expect(d({}, { sessao: { passosSemResolver: 5 } })).toMatchObject({ acao: 'encaminhar_humano', motivos: ['PASSOS_MAX'] })
  })

  it('mesma entrada, mesma decisão', () => {
    const entrada = { golpe: ['G'] }
    expect(d(entrada)).toEqual(d(entrada))
  })
})
