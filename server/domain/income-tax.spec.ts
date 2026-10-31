import { describe, expect, it } from 'vitest'
import { dados, cal } from '../testing/fixtures'
import { aliquotaIr, calcularIr } from './income-tax'

const faixas = dados.taxas.irRegressivo

describe('IR regressivo (regra 2)', () => {
  it.each([
    [1, 0.225], [180, 0.225], [181, 0.2], [360, 0.2], [361, 0.175], [720, 0.175], [721, 0.15], [2000, 0.15],
  ])('%i dias corridos: alíquota %d', (dias, aliquota) => {
    expect(aliquotaIr(dias, faixas)).toBe(aliquota)
  })

  it('PT-06: 181 dias, 20% sobre R$ 810,03 dá IR de R$ 162,01', () => {
    const dias = cal.diasCorridos('2026-05-21', '2026-11-18')
    expect(dias).toBe(181)
    expect(calcularIr(81_003, dias, true, faixas)).toMatchObject({ aliquota: 0.2, irCentavos: 16_201, liquidoCentavos: 64_802 })
  })

  it('PT-07: um dia antes cai na faixa de 22,5%', () => {
    expect(aliquotaIr(cal.diasCorridos('2026-05-21', '2026-11-17'), faixas)).toBe(0.225)
  })

  it('PT-08: 361 dias dá 17,5%', () => {
    expect(aliquotaIr(cal.diasCorridos('2025-11-24', '2026-11-20'), faixas)).toBe(0.175)
  })

  it('PT-09: 721 dias dá 15%, e o IR incide só sobre o rendimento', () => {
    const dias = cal.diasCorridos('2024-11-27', '2026-11-18')
    expect(dias).toBe(721)
    const r = calcularIr(118_350, dias, true, faixas) // rendimento do Tesouro de C-0002 (6.183,50 - 5.000,00)
    expect(r.aliquota).toBe(0.15)
    expect(r.irCentavos).toBe(17_753) // 15% de R$ 1.183,50, nunca de R$ 6.183,50
  })

  it('produto isento não paga IR', () => {
    expect(calcularIr(50_000, 100, false, faixas)).toEqual({ aliquota: 0, irCentavos: 0, liquidoCentavos: 50_000, isento: true })
  })
})
