import type { Acao, Fonte } from './types'

export type Papel = 'cliente' | 'agente' | 'humano'

export type Mensagem = {
  papel: Papel
  texto: string
  em: string
  acao?: Acao
  fontes?: Fonte[]
  protocolo?: string
}

export type Sessao = {
  id: string
  clienteId: string
  criadaEm: string
  passosSemResolver: number
  /** Respostas "não entendi" já dadas. */
  malEntendidos: number
  retencaoOferecida: boolean
  modoSeguranca: boolean
  vulneravel: boolean
  ultimoProduto: string | null
  ultimaOperacaoId: string | null
  /** Intenções entendidas na última mensagem: alimentam as sugestões de continuação. */
  ultimasIntencoes: string[]
  casoId: string | null
  historico: Mensagem[]
}

export function novaSessao(id: string, clienteId: string, criadaEm: string): Sessao {
  return {
    id, clienteId, criadaEm, passosSemResolver: 0, malEntendidos: 0, retencaoOferecida: false,
    modoSeguranca: false, vulneravel: false, ultimoProduto: null, ultimaOperacaoId: null, ultimasIntencoes: [], casoId: null, historico: [],
  }
}

export const MAX_PASSOS = 5
export const MAX_MAL_ENTENDIDOS = 2
