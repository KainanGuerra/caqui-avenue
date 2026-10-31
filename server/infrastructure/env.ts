import { resolve } from 'node:path'
import { z } from 'zod'

const bool = z
  .enum(['true', 'false', '1', '0'])
  .default('false')
  .transform((v) => v === 'true' || v === '1')

const schema = z.object({
  DADOS_DIR: z.string().default('./data'),
  LLM_PROVIDER: z.enum(['template', 'anthropic', 'openai']).default('template'),
  LLM_API_KEY: z.string().default(''),
  LLM_MODEL: z.string().default(''),
  LLM_BASE_URL: z.string().default(''),
  LLM_TIMEOUT_MS: z.coerce.number().int().positive().default(8000),
  UNDERSTANDING_LLM: bool,
  ATENDENTE_PIN: z.string().default(''),
  // dados: dia fixo dos dados (18/11/2026) com a hora real de São Paulo; real: data e hora reais; ou um ISO fixo.
  RELOGIO: z.string().default('dados').refine((v) => v === 'dados' || v === 'real' || /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/.test(v), 'use dados, real ou um ISO'),
})

export type Env = z.infer<typeof schema> & { dadosDir: string }

// Falha no boot, não na primeira mensagem: configuração errada aparece cedo.
export function loadEnv(source: Record<string, string | undefined> = process.env): Env {
  const parsed = schema.safeParse(source)
  if (!parsed.success) {
    throw new Error(`Configuração inválida: ${parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`)
  }
  const env = parsed.data
  if (env.LLM_PROVIDER !== 'template' && !env.LLM_API_KEY) {
    throw new Error('LLM_API_KEY é obrigatória quando LLM_PROVIDER não é template')
  }
  if (env.LLM_PROVIDER !== 'template' && !env.LLM_MODEL) throw new Error('LLM_MODEL é obrigatório quando LLM_PROVIDER não é template')
  return { ...env, dadosDir: resolve(env.DADOS_DIR) }
}
