import { describe, expect, it } from 'vitest'
import { criarSessionStore } from './session-store'

describe('SessionStore em memória', () => {
  it('cria sessões independentes e as devolve por id', () => {
    const store = criarSessionStore()
    const a = store.criar('C-0001', '2026-11-18T10:00')
    const b = store.criar('C-0002', '2026-11-18T10:00')
    a.modoSeguranca = true
    expect(store.obter(a.id)?.modoSeguranca).toBe(true)
    expect(store.obter(b.id)?.modoSeguranca).toBe(false)
    expect(store.obter('inexistente')).toBeNull()
  })
})
