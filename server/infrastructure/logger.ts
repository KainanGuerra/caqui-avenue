import { randomUUID } from 'node:crypto'
import { mascararCpf } from '../domain/normalize'

export type Logger = { info(evento: string, campos?: Record<string, unknown>): void; novoTrace(): string }

// Log estruturado em JSON. Nunca recebe o texto cru da conversa: só evento, contagens, sinais e ações.
// Por garantia extra, qualquer string passa pela máscara de CPF antes de sair.
const limpar = (v: unknown): unknown =>
  typeof v === 'string' ? mascararCpf(v) : Array.isArray(v) ? v.map(limpar) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, limpar(x)])) : v

export function criarLogger(saida: (linha: string) => void = (l) => console.log(l)): Logger {
  return {
    novoTrace: () => randomUUID().slice(0, 8),
    info(evento, campos = {}) {
      saida(JSON.stringify({ nivel: 'info', evento, em: new Date().toISOString(), ...(limpar(campos) as object) }))
    },
  }
}

export const loggerMudo: Logger = { info() {}, novoTrace: () => 'teste' }
