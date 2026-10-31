import type { RegistroLlm, RegistroResposta } from '../../domain/management-metrics'

export type MetricsStore = {
  registrarResposta(r: RegistroResposta): void
  registrarLlm(r: RegistroLlm): void
  respostas(): RegistroResposta[]
  chamadasLlm(): RegistroLlm[]
}

// Em memória, como as sessões e os casos: zera quando o servidor reinicia. Guarda só números e ações, nunca o texto da conversa.
export function criarMetricsStore(): MetricsStore {
  const respostas: RegistroResposta[] = []
  const chamadas: RegistroLlm[] = []
  return {
    registrarResposta: (r) => void respostas.push(r),
    registrarLlm: (r) => void chamadas.push(r),
    respostas: () => [...respostas],
    chamadasLlm: () => [...chamadas],
  }
}
