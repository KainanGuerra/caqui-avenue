import type { FaixaIr } from './types'

// Faixas vêm de taxas.json: [{ atedias: 180 }, { atedias: 360 }, { atedias: 720 }, { atedias: null }].
export function aliquotaIr(dias: number, faixas: FaixaIr[]): number {
  const faixa = faixas.find((f) => f.atedias === null || dias <= f.atedias)
  if (!faixa) throw new Error('Faixas de IR sem faixa final')
  return faixa.aliquota
}

export type ResultadoIr = { aliquota: number; irCentavos: number; liquidoCentavos: number; isento: boolean }

// O IR incide só sobre o rendimento, nunca sobre o valor total. Arredonda meio para cima, em centavos.
export function calcularIr(rendimentoCentavos: number, dias: number, tributavel: boolean, faixas: FaixaIr[]): ResultadoIr {
  if (!tributavel) return { aliquota: 0, irCentavos: 0, liquidoCentavos: rendimentoCentavos, isento: true }
  const aliquota = aliquotaIr(dias, faixas)
  const irCentavos = Math.round(rendimentoCentavos * aliquota + 1e-9)
  return { aliquota, irCentavos, liquidoCentavos: rendimentoCentavos - irCentavos, isento: false }
}

export const pctBr = (aliquota: number): string => `${(aliquota * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`
