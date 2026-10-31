import { ErroLlm, type Fetcher, type LlmPort } from './port'

type Opcoes = { chave: string; modelo: string; baseUrl?: string; timeoutMs: number; fetcher?: Fetcher }

// Serve qualquer servidor com a API de chat completions da OpenAI (nuvem ou local).
export function llmOpenAiCompativel(o: Opcoes): LlmPort {
  const f = o.fetcher ?? fetch
  const url = `${(o.baseUrl || 'https://api.openai.com/v1').replace(/\/$/, '')}/chat/completions`
  return {
    async completar(p) {
      const r = await f(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${o.chave}` },
        body: JSON.stringify({ model: o.modelo, max_tokens: p.maxTokens ?? 600, temperature: p.temperatura ?? 0.2, messages: [{ role: 'system', content: p.system }, { role: 'user', content: p.usuario }] }),
        signal: AbortSignal.timeout(o.timeoutMs),
      })
      if (!r.ok) throw new ErroLlm(`openai-compativel ${r.status}`)
      const j = (await r.json()) as { choices?: { message?: { content?: string } }[] }
      const texto = j.choices?.[0]?.message?.content?.trim()
      if (!texto) throw new ErroLlm('openai-compativel sem texto')
      return texto
    },
  }
}
