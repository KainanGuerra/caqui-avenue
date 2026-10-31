import { momentoDe, parseMomento, type Momento } from '../domain/momento'

// Porta do relógio: em produção é o horário de São Paulo; nos testes e na demo é injetável.
export type Clock = { agora(): Momento }

export const relogioReal: Clock = { agora: () => momentoDe(new Date()) }
export const relogioFixo = (m: Momento): Clock => ({ agora: () => m })

/** Dia dos dados do case (18/11/2026), mas com a hora real: as contas batem com os dados e o horário de atendimento é de verdade. */
export const DIA_DOS_DADOS = '2026-11-18'
export const relogioDosDados = (base: Clock = relogioReal): Clock => ({ agora: () => ({ data: DIA_DOS_DADOS, minutos: base.agora().minutos }) })

export function criarRelogio(modo: string): Clock {
  if (modo === 'real') return relogioReal
  if (modo === 'dados') return relogioDosDados()
  return relogioFixo(parseMomento(modo))
}
