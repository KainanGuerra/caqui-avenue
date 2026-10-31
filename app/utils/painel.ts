// Só apresentação dos números do painel do gerente: o servidor já manda tudo calculado.

/** null quer dizer "sem base para calcular", e não zero. */
export const porcento = (v: number | null): string => (v === null ? '—' : `${v}%`)

/** Até 1 s em milissegundos; acima disso, em segundos com uma casa. */
export const duracao = (ms: number | null): string => (ms === null ? '—' : ms < 1000 ? `${ms} ms` : `${(ms / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} s`)

export const inteiro = (v: number): string => v.toLocaleString('pt-BR')
