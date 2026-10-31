import type { Redator } from '../../application/pipeline'

// Modo sem LLM: o texto determinístico do plano é a resposta.
export const redatorTemplate: Redator = { redigir: async () => null }
