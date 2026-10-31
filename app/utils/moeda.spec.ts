import { describe, expect, it } from 'vitest'
import { dataCurta, horaCurta, iniciais, reais } from './moeda'

describe('apresentação', () => {
  it('formata centavos em reais com milhar e vírgula', () => {
    expect(reais(125000)).toBe('R$\u00a01.250,00')
    expect(reais(4079124)).toBe('R$\u00a040.791,24')
    expect(reais(5)).toBe('R$\u00a00,05')
  })

  it('mostra valor negativo com sinal', () => {
    expect(reais(-84891)).toBe('-R$\u00a0848,91')
  })

  it('a data não muda de dia por causa do fuso', () => {
    expect(dataCurta('2026-11-18')).toBe('18/11/2026')
    expect(dataCurta('2026-11-18T23:30:00-03:00')).toBe('18/11/2026')
  })

  it('hora curta e iniciais', () => {
    expect(horaCurta('2026-11-18T09:05:00-03:00')).toBe('09:05')
    expect(iniciais('Marta Siqueira')).toBe('MS')
    expect(iniciais('Jonas')).toBe('J')
  })
})
