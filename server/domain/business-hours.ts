import type { Momento } from './momento'

export const ABERTURA = 8 * 60
export const FECHAMENTO = 20 * 60

// Humano das 8h às 20h, todos os dias (08h00 inclusive, 20h00 exclusive: premissa D4). A segurança atende a qualquer hora.
export function humanoDisponivel(m: Momento): boolean {
  return m.minutos >= ABERTURA && m.minutos < FECHAMENTO
}

const horaCheia = (minutos: number) => `${Math.floor(minutos / 60)}h${minutos % 60 ? String(minutos % 60).padStart(2, '0') : ''}`

/** "das 8h às 20h": sai das mesmas constantes que decidem se há pessoa agora. */
export const descreverHorario = (): string => `das ${horaCheia(ABERTURA)} às ${horaCheia(FECHAMENTO)}`

export function descreverRetorno(m: Momento): string {
  const hoje = m.minutos < ABERTURA
  return `${hoje ? 'hoje' : 'amanhã'} a partir das 8h`
}
