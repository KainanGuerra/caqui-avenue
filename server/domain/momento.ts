// Um instante já convertido para o relógio de São Paulo: data local e minutos desde a meia-noite.
export type Momento = { data: string; minutos: number }

const FUSO = 'America/Sao_Paulo'

// "2026-11-18T14:00-03:00" -> usa a data e a hora como escritas (o case fala sempre em horário de Brasília).
export function parseMomento(iso: string): Momento {
  const m = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}):(\d{2})/.exec(iso)
  if (!m) throw new Error(`Momento inválido: ${iso}`)
  return { data: m[1]!, minutos: Number(m[2]) * 60 + Number(m[3]) }
}

export function momentoDe(instante: Date): Momento {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: FUSO, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(instante)
  const p = Object.fromEntries(partes.map((x) => [x.type, x.value]))
  return { data: `${p.year}-${p.month}-${p.day}`, minutos: Number(p.hour) * 60 + Number(p.minute) }
}

export const hhmm = (minutos: number): string =>
  `${String(Math.floor(minutos / 60)).padStart(2, '0')}h${String(minutos % 60).padStart(2, '0')}`

export const dataBr = (data: string): string => `${data.slice(8, 10)}/${data.slice(5, 7)}/${data.slice(0, 4)}`

/** Formato curto usado nos históricos: AAAA-MM-DDTHH:MM (horário de São Paulo). */
export const isoDe = (m: Momento): string => `${m.data}T${String(Math.floor(m.minutos / 60)).padStart(2, '0')}:${String(m.minutos % 60).padStart(2, '0')}`
