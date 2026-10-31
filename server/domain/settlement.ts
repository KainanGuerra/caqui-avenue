import type { CalendarioUtil } from './calendar'
import type { ProdutoTaxa } from './types'

export const CORTE_MINUTOS = 16 * 60

export type Liquidacao =
  | { tipo: 'liquida'; diaBase: string; cotizacao: string | null; pagamento: string }
  | { tipo: 'sem_liquidez_diaria'; vencimento: string | null }
  | { tipo: 'em_carencia'; disponivelEm: string }

// Dia-base: no mesmo dia se for dia útil e até 16h (16h00 em ponto ainda conta, premissa D4); senão, próximo dia útil.
export function diaBase(cal: CalendarioUtil, data: string, minutos: number): string {
  return cal.ehDiaUtil(data) && minutos <= CORTE_MINUTOS ? data : cal.proximoDiaUtil(data)
}

type Entrada = {
  produto: ProdutoTaxa
  /** Data do pedido e minutos desde a meia-noite. */
  data: string
  minutos: number
  dataAplicacao?: string
  vencimento?: string | null
}

export function calcularLiquidacao(cal: CalendarioUtil, e: Entrada): Liquidacao {
  const { produto } = e
  const base = diaBase(cal, e.data, e.minutos)

  if (produto.tipo === 'FUNDO') {
    if (produto.cotizacaoDu !== null && produto.pagamentoDu !== null) {
      return { tipo: 'liquida', diaBase: base, cotizacao: cal.somarDiasUteis(base, produto.cotizacaoDu), pagamento: cal.somarDiasUteis(base, produto.pagamentoDu) }
    }
    if (produto.cotizacaoCorridos !== null && produto.pagamentoDuAposCotizacao !== null) {
      let cot = cal.somarDiasCorridos(base, produto.cotizacaoCorridos)
      if (!cal.ehDiaUtil(cot)) cot = cal.proximoDiaUtil(cot)
      return { tipo: 'liquida', diaBase: base, cotizacao: cot, pagamento: cal.somarDiasUteis(cot, produto.pagamentoDuAposCotizacao) }
    }
  }
  if (produto.tipo === 'TESOURO') return { tipo: 'liquida', diaBase: base, cotizacao: null, pagamento: cal.somarDiasUteis(base, 1) }
  if (produto.tipo === 'ACOES') return { tipo: 'liquida', diaBase: base, cotizacao: null, pagamento: cal.somarDiasUteis(base, 2) }

  if (produto.liquidez === 'no_vencimento') return { tipo: 'sem_liquidez_diaria', vencimento: e.vencimento ?? null }
  if (produto.carenciaDias > 0 && e.dataAplicacao) {
    const fim = cal.somarDiasCorridos(e.dataAplicacao, produto.carenciaDias)
    if (e.data < fim) return { tipo: 'em_carencia', disponivelEm: fim }
  }
  return { tipo: 'liquida', diaBase: base, cotizacao: null, pagamento: base }
}
