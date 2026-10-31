import { describe, expect, it } from 'vitest'
import { cal, em, produto } from '../testing/fixtures'
import { calcularLiquidacao } from './settlement'

const liquida = (codigo: string, iso: string, extra = {}) => {
  const m = em(iso)
  return calcularLiquidacao(cal, { produto: produto(codigo), data: m.data, minutos: m.minutos, ...extra })
}

describe('liquidação (regra 1)', () => {
  it('PT-01: fundo de renda fixa pedido na sexta às 17h com feriado na segunda', () => {
    expect(liquida('FUNDO-RF-01', '2026-10-30T17:00-03:00')).toEqual({
      tipo: 'liquida', diaBase: '2026-11-03', cotizacao: '2026-11-04', pagamento: '2026-11-05',
    })
  })

  it('PT-02: CDB às 15h58 de dia útil liquida no mesmo dia', () => {
    expect(liquida('CDB-LD-100', '2026-11-16T15:58-03:00')).toMatchObject({ diaBase: '2026-11-16', pagamento: '2026-11-16' })
  })

  it('PT-03: pedido depois das 16h na véspera liquida no dia útil seguinte', () => {
    expect(liquida('CDB-LD-110', '2026-11-17T19:40-03:00')).toMatchObject({ diaBase: '2026-11-18', pagamento: '2026-11-18' })
  })

  it('PT-04: multimercado cotiza em 30 dias corridos e paga 2 dias úteis depois', () => {
    expect(liquida('FUNDO-MM-01', '2026-10-30T17:20-03:00')).toEqual({
      tipo: 'liquida', diaBase: '2026-11-03', cotizacao: '2026-12-03', pagamento: '2026-12-07',
    })
  })

  it('PT-05: pedido no sábado conta a partir do próximo dia útil', () => {
    expect(liquida('CDB-LD-100', '2026-11-14T09:05-03:00')).toMatchObject({ diaBase: '2026-11-16', pagamento: '2026-11-16' })
  })

  it.each([
    ['CDB-LD-100', '2026-11-19T17:00-03:00', '2026-11-23', '2026-11-23'],
    ['CDB-LD-100', '2026-11-20T10:00-03:00', '2026-11-23', '2026-11-23'],
    ['FUNDO-RF-01', '2026-11-13T15:00-03:00', '2026-11-13', '2026-11-17'],
    ['FUNDO-RF-01', '2026-11-19T17:00-03:00', '2026-11-23', '2026-11-25'],
  ])('%s pedido em %s: dia-base %s e pagamento %s', (codigo, iso, base, pag) => {
    expect(liquida(codigo, iso)).toMatchObject({ diaBase: base, pagamento: pag })
  })

  it('16h00 em ponto ainda é "até 16h"; 16h01 já passou do corte', () => {
    expect(liquida('CDB-LD-100', '2026-11-16T16:00-03:00')).toMatchObject({ diaBase: '2026-11-16' })
    expect(liquida('CDB-LD-100', '2026-11-16T16:01-03:00')).toMatchObject({ diaBase: '2026-11-17' })
  })

  it('Tesouro Selic liquida em D+1 útil e ações em D+2 úteis', () => {
    expect(liquida('TESOURO-SELIC-2029', '2026-11-16T10:00-03:00')).toMatchObject({ pagamento: '2026-11-17' })
    expect(liquida('ACOES', '2026-11-16T10:00-03:00')).toMatchObject({ pagamento: '2026-11-18' })
  })

  it('produto sem liquidez diária não tem data de resgate', () => {
    expect(liquida('LCA-1A-95', '2026-11-16T10:00-03:00', { vencimento: '2027-05-01' })).toEqual({ tipo: 'sem_liquidez_diaria', vencimento: '2027-05-01' })
  })

  it('LCI dentro da carência só libera depois dos 90 dias', () => {
    expect(liquida('LCI-90D-92', '2026-11-16T10:00-03:00', { dataAplicacao: '2026-10-01' })).toEqual({ tipo: 'em_carencia', disponivelEm: '2026-12-30' })
    expect(liquida('LCI-90D-92', '2026-11-16T10:00-03:00', { dataAplicacao: '2026-07-01' })).toMatchObject({ tipo: 'liquida', pagamento: '2026-11-16' })
  })
})
