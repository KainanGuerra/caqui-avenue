import type { Calendario } from './types'

export type CalendarioUtil = {
  ehDiaUtil(data: string): boolean
  proximoDiaUtil(data: string): string
  somarDiasUteis(data: string, n: number): string
  somarDiasCorridos(data: string, n: number): string
  diasCorridos(de: string, ate: string): number
  /** Dias úteis de `de` até `ate`, contando os dois extremos (convenção que reproduz o saldo do CDI em posicoes.csv). */
  diasUteisInclusivo(de: string, ate: string): number
  nomeFeriado(data: string): string | null
}

const DIA_MS = 86_400_000
const utc = (data: string) => Date.UTC(+data.slice(0, 4), +data.slice(5, 7) - 1, +data.slice(8, 10))
const fmt = (ms: number) => new Date(ms).toISOString().slice(0, 10)

// Feriados nacionais usados só fora do período coberto por calendario.json (que começa em 01/10/2026).
// Corpus Christi e Carnaval ficam de fora: não são feriados nacionais.
const FIXOS = new Set(['01-01', '04-21', '05-01', '09-07', '10-12', '11-02', '11-15', '11-20', '12-25'])
const SEXTA_SANTA = new Set(['2025-04-18', '2026-04-03'])

export function criarCalendario(cal: Calendario): CalendarioUtil {
  const ehDiaUtil = (data: string): boolean => {
    const registrado = cal.diaUtil.get(data)
    if (registrado !== undefined) return registrado
    const dow = new Date(utc(data)).getUTCDay()
    if (dow === 0 || dow === 6) return false
    return !(FIXOS.has(data.slice(5)) || SEXTA_SANTA.has(data))
  }
  const somarDiasCorridos = (data: string, n: number) => fmt(utc(data) + n * DIA_MS)
  const proximoDiaUtil = (data: string): string => {
    let d = somarDiasCorridos(data, 1)
    while (!ehDiaUtil(d)) d = somarDiasCorridos(d, 1)
    return d
  }
  return {
    ehDiaUtil,
    proximoDiaUtil,
    somarDiasUteis(data, n) {
      let d = data
      for (let i = 0; i < n; i++) d = proximoDiaUtil(d)
      return d
    },
    somarDiasCorridos,
    diasCorridos: (de, ate) => Math.round((utc(ate) - utc(de)) / DIA_MS),
    diasUteisInclusivo(de, ate) {
      let n = 0
      for (let d = de; d <= ate; d = somarDiasCorridos(d, 1)) if (ehDiaUtil(d)) n++
      return n
    },
    nomeFeriado: (data) => cal.feriados.get(data) ?? null,
  }
}
