import { describe, expect, it } from 'vitest'
import { cal } from '../testing/fixtures'

describe('calendário da Caqui', () => {
  it('trata fim de semana e feriado nacional como dia não útil', () => {
    expect(cal.ehDiaUtil('2026-10-31')).toBe(false) // sábado
    expect(cal.ehDiaUtil('2026-11-02')).toBe(false) // Finados
    expect(cal.ehDiaUtil('2026-11-20')).toBe(false) // Consciência Negra
    expect(cal.ehDiaUtil('2026-11-18')).toBe(true)
  })

  it('acha o próximo dia útil por cima de feriado e fim de semana', () => {
    expect(cal.proximoDiaUtil('2026-10-30')).toBe('2026-11-03')
    expect(cal.proximoDiaUtil('2026-11-19')).toBe('2026-11-23')
  })

  it('soma dias úteis', () => {
    expect(cal.somarDiasUteis('2026-11-03', 2)).toBe('2026-11-05')
  })

  it('usa fim de semana e feriados fixos antes do período coberto pelo arquivo', () => {
    expect(cal.ehDiaUtil('2026-09-07')).toBe(false) // Independência
    expect(cal.ehDiaUtil('2026-06-04')).toBe(true) // Corpus Christi não é feriado nacional
    expect(cal.ehDiaUtil('2026-08-01')).toBe(false) // sábado
  })

  it('conta dias corridos entre duas datas', () => {
    expect(cal.diasCorridos('2026-05-21', '2026-11-18')).toBe(181)
    expect(cal.diasCorridos('2026-05-21', '2026-11-17')).toBe(180)
  })
})
