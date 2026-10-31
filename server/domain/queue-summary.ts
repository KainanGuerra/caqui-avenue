import type { Caso } from './case-summary'

export type ResumoFila = { emAberto: number; golpe: number; prioridade: number; assumidos: number; resolvidos: number }

// Contagens da fila para os cartões do painel; a tela só exibe. "Golpe" e "prioridade" contam só casos ainda não resolvidos.
export function resumirFila(casos: Caso[]): ResumoFila {
  const vivos = casos.filter((c) => c.status !== 'resolvido')
  return {
    emAberto: casos.filter((c) => c.status === 'aberto').length,
    golpe: vivos.filter((c) => c.prioridade === 0).length,
    prioridade: vivos.filter((c) => c.prioridade === 1).length,
    assumidos: casos.filter((c) => c.status === 'assumido').length,
    resolvidos: casos.filter((c) => c.status === 'resolvido').length,
  }
}
