import { ErroLlm, type Fetcher, type LlmPort } from './port'

type Opcoes = { chave: string; modelo: string; baseUrl?: string; timeoutMs: number; fetcher?: Fetcher }

export function llmAnthropic(o: Opcoes): LlmPort {
  const f = o.fetcher ?? fetch
  const url = `${(o.baseUrl || 'https://api.anthropic.com').replace(/\/$/, '')}/v1/messages`
  return {
    async completar(p) {
      const r = await f(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-api-key': o.chave, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: o.modelo, max_tokens: p.maxTokens ?? 600, temperature: p.temperatura ?? 0.2, system: p.system, messages: [{ role: 'user', content: p.usuario }] }),
        signal: AbortSignal.timeout(o.timeoutMs),
      })
      if (!r.ok) throw new ErroLlm(`anthropic ${r.status}`)
      const j = (await r.json()) as { content?: { type: string; text?: string }[] }
      const texto = j.content?.filter((b) => b.type === 'text').map((b) => b.text ?? '').join('').trim()
      if (!texto) throw new ErroLlm('anthropic sem texto')
      return texto
    },
  }
}
