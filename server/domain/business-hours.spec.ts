import { describe, expect, it } from 'vitest'
import { em } from '../testing/fixtures'
import { descreverRetorno, humanoDisponivel } from './business-hours'

describe('horário do atendimento humano (regra 12)', () => {
  it.each([
    ['2026-11-18T07:59-03:00', false],
    ['2026-11-18T08:00-03:00', true],
    ['2026-11-18T14:00-03:00', true],
    ['2026-11-18T19:59-03:00', true],
    ['2026-11-18T20:00-03:00', false],
    ['2026-11-18T23:00-03:00', false],
    ['2026-11-14T10:00-03:00', true], // sábado
    ['2026-11-15T10:00-03:00', true], // domingo e feriado
  ])('%s -> humano disponível: %s', (iso, esperado) => {
    expect(humanoDisponivel(em(iso))).toBe(esperado)
  })

  it('fora do horário o retorno é a partir das 8h', () => {
    expect(descreverRetorno(em('2026-11-18T23:00-03:00'))).toBe('amanhã a partir das 8h')
    expect(descreverRetorno(em('2026-11-18T03:00-03:00'))).toBe('hoje a partir das 8h')
  })
})
