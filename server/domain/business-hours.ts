import type { Momento } from './momento'

export const ABERTURA = 8 * 60
export const FECHAMENTO = 20 * 60

// Humano das 8h às 20h, todos os dias (08h00 inclusive, 20h00 exclusive: premissa D4). A segurança atende a qualquer hora.
export function humanoDisponivel(m: Momento): boolean {
  return m.minutos >= ABERTURA && m.minutos < FECHAMENTO
}

export function descreverRetorno(m: Momento): string {
  const hoje = m.minutos < ABERTURA
  return `${hoje ? 'hoje' : 'amanhã'} a partir das 8h`
}
