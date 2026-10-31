import { calcularIr } from './income-tax'
import type { CalendarioUtil } from './calendar'
import type { FaixaIr, Posicao, ProdutoTaxa } from './types'

// Poupança com a taxa mensal fixa do case, composta por dias corridos / 30 (reproduz PT-10 e PT-11 ao centavo).
export function rendimentoPoupanca(valorCentavos: number, dias: number, poupancaAm: number): number {
  return Math.round(valorCentavos * (Math.pow(1 + poupancaAm, dias / 30) - 1))
}

// Projeção do CDB pelo CDI: usada como conferência do saldo de posicoes.csv, não para responder ao cliente.
export function rendimentoCdi(valorCentavos: number, pctCdi: number, cdiAa: number, diasUteis: number): number {
  const diario = Math.pow(1 + cdiAa, 1 / 252) - 1
  return Math.round(valorCentavos * (Math.pow(1 + diario * pctCdi, diasUteis) - 1))
}

export type Comparacao = {
  dias: number
  brutoCentavos: number
  irCentavos: number
  liquidoCentavos: number
  poupancaCentavos: number
  conclusao: 'cdb_perde' | 'cdb_ganha' | 'empate'
}

// Sempre líquido contra líquido. A poupança é isenta; o CDB paga IR sobre o rendimento.
export function compararComPoupanca(p: Posicao, produto: ProdutoTaxa, dataCalculo: string, cal: CalendarioUtil, poupancaAm: number, faixas: FaixaIr[]): Comparacao {
  const dias = cal.diasCorridos(p.dataAplicacao, dataCalculo)
  const bruto = p.saldoBrutoCentavos - p.valorAplicadoCentavos
  const ir = calcularIr(bruto, dias, produto.tributavel, faixas)
  const poupanca = rendimentoPoupanca(p.valorAplicadoCentavos, dias, poupancaAm)
  const conclusao = ir.liquidoCentavos > poupanca ? 'cdb_ganha' : ir.liquidoCentavos < poupanca ? 'cdb_perde' : 'empate'
  return { dias, brutoCentavos: bruto, irCentavos: ir.irCentavos, liquidoCentavos: ir.liquidoCentavos, poupancaCentavos: poupanca, conclusao }
}
