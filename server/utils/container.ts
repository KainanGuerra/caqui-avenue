import { carregarDados, type Dados } from '../infrastructure/data/dados'
import { criarCalendario } from '../domain/calendar'
import { CaseService } from '../application/case-service'
import { Pipeline, type Entendimento, type Redator } from '../application/pipeline'
import { criarRelogio, type Clock } from '../infrastructure/clock'
import { loadEnv, type Env } from '../infrastructure/env'
import { criarLogger, type Logger } from '../infrastructure/logger'
import { criarCaseStore } from '../infrastructure/stores/case-store'
import { criarSessionStore, type SessionStore } from '../infrastructure/stores/session-store'
import { redatorTemplate } from '../infrastructure/llm/template'
import { llmAnthropic } from '../infrastructure/llm/anthropic'
import { llmOpenAiCompativel } from '../infrastructure/llm/openai-compatible'
import { comDisjuntor, type LlmPort } from '../infrastructure/llm/port'
import { redatorLlm } from '../infrastructure/llm/redator-llm'
import { entendimentoLlm } from '../infrastructure/llm/entendimento-llm'
import { kaki, type Persona } from '../persona'

export type Container = {
  env: Env
  dados: Dados
  sessoes: SessionStore
  casos: CaseService
  pipeline: Pipeline
  logger: Logger
}

export type Overrides = Partial<{ env: Env; redator: Redator; entendimento: Entendimento | null; clock: Clock; logger: Logger; persona: Persona; dados: Dados }>

function criarPorta(env: Env): LlmPort | null {
  const base = { chave: env.LLM_API_KEY, modelo: env.LLM_MODEL, baseUrl: env.LLM_BASE_URL, timeoutMs: env.LLM_TIMEOUT_MS }
  if (env.LLM_PROVIDER === 'anthropic') return comDisjuntor(llmAnthropic(base))
  if (env.LLM_PROVIDER === 'openai') return comDisjuntor(llmOpenAiCompativel(base))
  return null
}

// Composition root: tudo é montado aqui, à mão, sem descoberta automática.
export function montarContainer(o: Overrides = {}): Container {
  const env = o.env ?? loadEnv()
  const dados = o.dados ?? carregarDados(env.dadosDir)
  const logger = o.logger ?? criarLogger()
  const porta = criarPorta(env)
  const sessoes = criarSessionStore()
  const casos = new CaseService(criarCaseStore())
  const pipeline = new Pipeline({
    dados, cal: criarCalendario(dados.calendario), sessoes, casos,
    redator: o.redator ?? (porta ? redatorLlm(porta) : redatorTemplate),
    entendimento: o.entendimento !== undefined ? o.entendimento : porta && env.UNDERSTANDING_LLM ? entendimentoLlm(porta) : null,
    persona: o.persona ?? kaki, clock: o.clock ?? criarRelogio(env.RELOGIO), logger,
  })
  return { env, dados, sessoes, casos, pipeline, logger }
}

let unico: Container | null = null
/** Instância do processo (uso nas rotas da API). */
export const container = (): Container => (unico ??= montarContainer())
