// Porta do modelo de linguagem: qualquer provedor que complete um texto. Troca de provedor = troca de adaptador.
export type PedidoLlm = { system: string; usuario: string; maxTokens?: number; temperatura?: number }
export type LlmPort = { completar(p: PedidoLlm): Promise<string> }

export type Fetcher = typeof fetch

export class ErroLlm extends Error {}

/** Depois de várias falhas seguidas o disjuntor abre e as chamadas falham rápido, em vez de travar cada resposta. */
export function comDisjuntor(porta: LlmPort, opcoes: { falhas?: number; pausaMs?: number; agora?: () => number } = {}): LlmPort {
  const limite = opcoes.falhas ?? 3
  const pausa = opcoes.pausaMs ?? 30_000
  const agora = opcoes.agora ?? Date.now
  let seguidas = 0
  let abertoAte = 0
  return {
    async completar(p) {
      if (agora() < abertoAte) throw new ErroLlm('disjuntor aberto')
      try {
        const r = await porta.completar(p)
        seguidas = 0
        return r
      } catch (e) {
        if (++seguidas >= limite) { abertoAte = agora() + pausa; seguidas = 0 }
        throw e
      }
    },
  }
}

/** Mede cada chamada (tamanho do pedido e da resposta, tempo, sucesso) para o painel do gerente, sem guardar o texto. */
export function comMedicao(porta: LlmPort, registrar: (r: { caracteresEntrada: number; caracteresSaida: number; ms: number; ok: boolean }) => void, agora: () => number = Date.now): LlmPort {
  return {
    async completar(p) {
      const t0 = agora()
      const caracteresEntrada = p.system.length + p.usuario.length
      try {
        const r = await porta.completar(p)
        registrar({ caracteresEntrada, caracteresSaida: r.length, ms: agora() - t0, ok: true })
        return r
      } catch (e) {
        registrar({ caracteresEntrada, caracteresSaida: 0, ms: agora() - t0, ok: false })
        throw e
      }
    },
  }
}
