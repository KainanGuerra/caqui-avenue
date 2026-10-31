import { describe, expect, it } from 'vitest'
import { cal, dados, produto } from '../testing/fixtures'
import { compararComPoupanca, rendimentoCdi, rendimentoPoupanca } from './savings-compare'

const { poupancaAm, cdiAa, irRegressivo } = dados.taxas
const posicao = (cliente: string, codigo: string) => dados.dadosDoCliente(cliente)!.posicoes.find((p) => p.produto === codigo)!

describe('comparação com a poupança (regra 3)', () => {
  it('PT-10: CDB 85% do CDI de C-0011 rende menos que a poupança no líquido', () => {
    const c = compararComPoupanca(posicao('C-0011', 'CDB-LD-85'), produto('CDB-LD-85'), '2026-11-18', cal, poupancaAm, irRegressivo)
    expect(c).toMatchObject({ dias: 107, brutoCentavos: 26_753, liquidoCentavos: 20_734, poupancaCentavos: 21_565, conclusao: 'cdb_perde' })
  })

  it('PT-11: CDB 100% do CDI de C-0012 rende mais que a poupança no líquido', () => {
    const c = compararComPoupanca(posicao('C-0012', 'CDB-LD-100'), produto('CDB-LD-100'), '2026-11-18', cal, poupancaAm, irRegressivo)
    expect(c).toMatchObject({ dias: 170, brutoCentavos: 50_951, liquidoCentavos: 39_487, poupancaCentavos: 34_480, conclusao: 'cdb_ganha' })
  })

  it('comparar o bruto enganaria: em C-0011 o bruto passa da poupança e o líquido não', () => {
    const c = compararComPoupanca(posicao('C-0011', 'CDB-LD-85'), produto('CDB-LD-85'), '2026-11-18', cal, poupancaAm, irRegressivo)
    expect(c.brutoCentavos).toBeGreaterThan(c.poupancaCentavos)
    expect(c.liquidoCentavos).toBeLessThan(c.poupancaCentavos)
  })

  it('rendimento da poupança compõe 0,6% ao mês por dias corridos / 30', () => {
    expect(rendimentoPoupanca(1_000_000, 30, poupancaAm)).toBe(6_000)
  })
})

describe('conferência do saldo bruto pelo CDI', () => {
  it.each([
    ['C-0011', 'CDB-LD-85', 0.85],
    ['C-0012', 'CDB-LD-100', 1.0],
    ['C-0002', 'CDB-LD-100', 1.0],
  ])('recalcular %s %s bate com saldo_bruto de posicoes.csv', (cliente, codigo, pct) => {
    const p = posicao(cliente, codigo)
    const du = cal.diasUteisInclusivo(p.dataAplicacao, p.dataReferencia)
    const esperado = p.saldoBrutoCentavos - p.valorAplicadoCentavos
    expect(Math.abs(rendimentoCdi(p.valorAplicadoCentavos, pct, cdiAa, du) - esperado)).toBeLessThanOrEqual(1)
  })
})
