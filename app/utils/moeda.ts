// Só apresentação (o Intl separa o R$ do número com espaço sem quebra, de propósito): o servidor manda centavos inteiros e nenhuma regra é calculada aqui.
const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const brlComSinal = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', signDisplay: 'exceptZero' })
const pct = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1, signDisplay: 'exceptZero' })

export const reais = (centavos: number): string => brl.format(centavos / 100)
export const reaisComSinal = (centavos: number): string => brlComSinal.format(centavos / 100)
/** Percentual que já vem pronto do servidor (1.7 → "+1,7%"). */
export const percentualComSinal = (valor: number): string => `${pct.format(valor)}%`

// "2026-11-18" → "18/11/2026", sem passar por Date (evita deslocar o dia pelo fuso).
export const dataCurta = (iso: string): string => {
  const [a, m, d] = iso.slice(0, 10).split('-')
  return `${d}/${m}/${a}`
}

// "2026-11-18" → "18/11".
export const diaMes = (iso: string): string => dataCurta(iso).slice(0, 5)

export const horaCurta = (iso: string): string => iso.slice(11, 16)

export const iniciais = (nome: string): string => nome.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join('')
