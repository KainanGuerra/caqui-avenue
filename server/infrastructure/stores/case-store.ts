import type { Caso } from '../../domain/case-summary'

export type CaseStore = {
  proximoProtocolo(): string
  salvar(caso: Caso): void
  obter(id: string): Caso | null
  porSessao(sessaoId: string): Caso | null
  todos(): Caso[]
}

export function criarCaseStore(): CaseStore {
  const casos = new Map<string, Caso>()
  let contador = 0
  return {
    proximoProtocolo: () => `P-${String(++contador).padStart(4, '0')}`,
    salvar: (c) => void casos.set(c.id, c),
    obter: (id) => casos.get(id) ?? null,
    porSessao: (sessaoId) => [...casos.values()].find((c) => c.sessaoId === sessaoId && c.status !== 'resolvido') ?? null,
    todos: () => [...casos.values()],
  }
}
