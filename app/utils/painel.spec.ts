import { describe, expect, it } from 'vitest'
import { duracao, inteiro, porcento } from './painel'

describe('formatos do painel do gerente', () => {
  it('percentual sem base aparece como traço, e não como 0%', () => {
    expect(porcento(null)).toBe('—')
    expect(porcento(0)).toBe('0%')
    expect(porcento(75)).toBe('75%')
  })

  it('duração em ms até 1 s e em segundos acima disso', () => {
    expect(duracao(null)).toBe('—')
    expect(duracao(12)).toBe('12 ms')
    expect(duracao(1500)).toBe('1,5 s')
  })

  it('inteiro com separador de milhar', () => {
    expect(inteiro(1_000_000)).toBe('1.000.000')
  })
})
