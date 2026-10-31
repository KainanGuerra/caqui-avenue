import { randomUUID } from 'node:crypto'
import { novaSessao, type Sessao } from '../../domain/session'

export type SessionStore = {
  criar(clienteId: string, agora: string): Sessao
  obter(id: string): Sessao | null
}

// Em memória: suficiente para uso local (processo único). Trocar por Redis/banco só muda esta porta.
export function criarSessionStore(): SessionStore {
  const sessoes = new Map<string, Sessao>()
  return {
    criar(clienteId, agora) {
      const s = novaSessao(randomUUID(), clienteId, agora)
      sessoes.set(s.id, s)
      return s
    },
    obter: (id) => sessoes.get(id) ?? null,
  }
}
