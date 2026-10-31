import { describe, expect, it } from 'vitest'
import { loadEnv } from './env'

import { criarRelogio, DIA_DOS_DADOS } from './clock'

describe('relógio', () => {
  it('no modo dados a data é a dos dados do case e a hora é a real', () => {
    expect(criarRelogio('dados').agora().data).toBe(DIA_DOS_DADOS)
  })
  it('aceita ISO fixo e rejeita valor inválido', () => {
    expect(criarRelogio('2026-11-18T23:00-03:00').agora()).toEqual({ data: '2026-11-18', minutos: 23 * 60 })
    expect(() => loadEnv({ RELOGIO: 'amanha' })).toThrow('Configuração inválida')
  })
})

describe('loadEnv', () => {
  it('usa template, sem LLM e sem PIN por padrão', () => {
    const env = loadEnv({})
    expect(env.LLM_PROVIDER).toBe('template')
    expect(env.UNDERSTANDING_LLM).toBe(false)
    expect(env.ATENDENTE_PIN).toBe('')
    expect(env.dadosDir.endsWith('/data')).toBe(true)
  })

  it('exige chave quando o provedor não é template', () => {
    expect(() => loadEnv({ LLM_PROVIDER: 'anthropic' })).toThrow('LLM_API_KEY')
    expect(() => loadEnv({ LLM_PROVIDER: 'anthropic', LLM_API_KEY: 'k' })).toThrow('LLM_MODEL')
  })

  it('rejeita provedor desconhecido', () => {
    expect(() => loadEnv({ LLM_PROVIDER: 'foo' })).toThrow('Configuração inválida')
  })

  it('liga o entendimento com LLM só quando pedido', () => {
    expect(loadEnv({ UNDERSTANDING_LLM: 'true' }).UNDERSTANDING_LLM).toBe(true)
  })
})
