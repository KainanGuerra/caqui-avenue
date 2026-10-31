import { normalizar } from './normalize'
import type { Momento } from './momento'

export type Slots = {
  /** Códigos de produto reconhecidos no texto (taxas.json). */
  produtos: string[]
  /** "CDB" ou "fundo" sem dizer qual: resolvido pelas posições do cliente. */
  generico: 'cdb' | 'fundo' | null
  /** Dia do pedido ou da data de cálculo (explícito vence relativo). */
  dataEvento: string | null
  dataAplicacao: string | null
  /** Minutos desde a meia-noite, quando o cliente disse a hora. */
  minutos: number | null
  /** A hora foi dita pelo cliente ("17h"), e não deduzida ("de manhã"). */
  horaDita: boolean
}

const ALIASES: [RegExp, string][] = [
  [/\bcdb[\s-]*110\b/, 'CDB-LD-110'],
  [/\bcdb[\s-]*100\b/, 'CDB-LD-100'],
  [/\bcdb[\s-]*85\b/, 'CDB-LD-85'],
  [/\bcdb[\s-]*(2 anos|120)\b/, 'CDB-2A-120'],
  [/\bmultimercado\b/, 'FUNDO-MM-01'],
  [/\b(fundo (de )?renda fixa|caqui renda fixa|renda fixa fif)\b/, 'FUNDO-RF-01'],
  [/\btesouro\b/, 'TESOURO-SELIC-2029'],
  [/\blci\b/, 'LCI-90D-92'],
  [/\blca\b/, 'LCA-1A-95'],
  [/\b(acoes|acao)\b/, 'ACOES'],
]

const DIAS_SEMANA = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado']
const DIA_MS = 86_400_000
const utc = (d: string) => Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10))
const fmt = (ms: number) => new Date(ms).toISOString().slice(0, 10)

function dataValida(a: number, m: number, d: number): string | null {
  const iso = `${a}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  return m >= 1 && m <= 12 && d >= 1 && d <= 31 && fmt(utc(iso)) === iso ? iso : null
}

export function extrairSlots(texto: string, agora: Momento): Slots {
  const t = normalizar(texto)
  const produtos = ALIASES.filter(([r]) => r.test(t)).map(([, c]) => c)
  const generico = produtos.length ? null : /\bcdb\b|\bliquidez diaria\b/.test(t) ? 'cdb' : /\bfundo\b/.test(t) ? 'fundo' : null

  let dataEvento: string | null = null
  let dataAplicacao: string | null = null
  for (const m of t.matchAll(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/g)) {
    const ano = m[3] ? (m[3].length === 2 ? 2000 + +m[3] : +m[3]) : +agora.data.slice(0, 4)
    const iso = dataValida(ano, +m[2]!, +m[1]!)
    if (!iso) continue
    const antes = t.slice(Math.max(0, m.index! - 28), m.index!)
    if (/apli[cq]/.test(antes)) dataAplicacao = iso
    else dataEvento = iso
  }
  if (!dataEvento) {
    if (/\banteontem\b/.test(t)) dataEvento = fmt(utc(agora.data) - 2 * DIA_MS)
    else if (/\bontem\b/.test(t)) dataEvento = fmt(utc(agora.data) - DIA_MS)
    else if (/\bhoje\b/.test(t)) dataEvento = agora.data
    else {
      const dia = DIAS_SEMANA.findIndex((d) => new RegExp(`\\b${d}\\b`).test(t))
      if (dia >= 0) {
        const hoje = new Date(utc(agora.data)).getUTCDay()
        dataEvento = fmt(utc(agora.data) - ((hoje - dia + 7) % 7) * DIA_MS)
      }
    }
  }

  let minutos: number | null = null
  let horaDita = false
  const h = /\b(\d{1,2})\s?h\s?(\d{2})?\b|\b(\d{1,2}):(\d{2})\b/.exec(t)
  if (h) {
    const hora = +(h[1] ?? h[3]!)
    const min = +(h[2] ?? h[4] ?? 0)
    if (hora <= 23 && min <= 59) { minutos = hora * 60 + min; horaDita = true }
  } else if (/\bmanha\b/.test(t)) minutos = 9 * 60

  return { produtos, generico, dataEvento, dataAplicacao, minutos, horaDita }
}
