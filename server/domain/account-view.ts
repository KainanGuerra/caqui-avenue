import type { DadosDoCliente, Operacao, Taxas } from './types'

export type PosicaoVista = {
  id: string
  produto: string
  nomeProduto: string
  dataAplicacao: string
  taxaContratada: string
  vencimento: string | null
  valorAplicadoCentavos: number
  saldoBrutoCentavos: number
  /** Saldo bruto menos o valor aplicado (antes do IR); pode ser negativo, como nas ações. */
  rendimentoBrutoCentavos: number
}

export type OperacaoVista = Pick<Operacao, 'id' | 'tipo' | 'valorCentavos' | 'pedidoEm' | 'status' | 'liquidacaoPrevista'> & { nomeProduto: string | null }

export type ContaVista = {
  saldoEmContaCentavos: number
  totalAplicadoCentavos: number
  totalBrutoCentavos: number
  posicoes: PosicaoVista[]
  operacoes: OperacaoVista[]
}

export const MAX_OPERACOES = 6

// A tela só exibe: somas e nomes saem daqui. Sem CPF e sem campo de outro cliente (regra 10).
export function montarConta(conta: DadosDoCliente, taxas: Taxas): ContaVista {
  const nome = (codigo: string | null) => (codigo ? (taxas.produtos.find((p) => p.codigo === codigo)?.nome ?? codigo) : null)
  const posicoes = conta.posicoes.map<PosicaoVista>((p) => ({
    id: p.id, produto: p.produto, nomeProduto: nome(p.produto) ?? p.produto, dataAplicacao: p.dataAplicacao, taxaContratada: p.taxaContratada,
    vencimento: p.vencimento, valorAplicadoCentavos: p.valorAplicadoCentavos, saldoBrutoCentavos: p.saldoBrutoCentavos,
    rendimentoBrutoCentavos: p.saldoBrutoCentavos - p.valorAplicadoCentavos,
  }))
  const operacoes = [...conta.operacoes]
    .sort((a, b) => b.pedidoEm.localeCompare(a.pedidoEm))
    .slice(0, MAX_OPERACOES)
    .map<OperacaoVista>((o) => ({ id: o.id, tipo: o.tipo, valorCentavos: o.valorCentavos, pedidoEm: o.pedidoEm, status: o.status, liquidacaoPrevista: o.liquidacaoPrevista, nomeProduto: nome(o.produto) }))
  const soma = (f: (p: PosicaoVista) => number) => posicoes.reduce((s, p) => s + f(p), 0)
  return {
    saldoEmContaCentavos: conta.cliente.saldoEmContaCentavos,
    totalAplicadoCentavos: soma((p) => p.valorAplicadoCentavos),
    totalBrutoCentavos: soma((p) => p.saldoBrutoCentavos),
    posicoes, operacoes,
  }
}
