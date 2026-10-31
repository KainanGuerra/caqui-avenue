import { describe, expect, it } from 'vitest'
import { kaki } from '../persona'
import { validar } from './validator'

const plano = { obrigatorios: ['05/11/2026', 'KB-006'] }
const v = (texto: string) => validar(texto, plano, kaki, 'C-0002')

describe('validador da saída', () => {
  it('aprova texto com todos os fatos obrigatórios', () => {
    expect(v('O dinheiro cai em 05/11/2026 (KB-006).')).toEqual({ ok: true, problemas: [] })
  })

  it('reprova texto sem o fato obrigatório', () => {
    expect(v('Cai na semana que vem (KB-006).').problemas).toEqual(['falta o fato obrigatório: 05/11/2026'])
  })

  it('reprova recomendação', () => {
    expect(v('Eu recomendo o CDB 110. 05/11/2026 KB-006').ok).toBe(false)
  })

  it('reprova CPF sem máscara, mas aceita o mascarado', () => {
    expect(v('Seu CPF é 123.456.789-09 05/11/2026 KB-006').problemas).toContain('CPF sem máscara')
    expect(v('Seu CPF é ***.***.894-** 05/11/2026 KB-006').ok).toBe(true)
  })

  it('reprova id de outro cliente, aceita o do próprio', () => {
    expect(v('O saldo de C-0042 é alto. 05/11/2026 KB-006').problemas).toEqual(['id de outro cliente: C-0042'])
    expect(v('Cliente C-0002. 05/11/2026 KB-006').ok).toBe(true)
  })

  it('reprova texto vazio e quem diz ser pessoa', () => {
    expect(validar('  ', { obrigatorios: [] }, kaki, 'C-0002').ok).toBe(false)
    expect(validar('Eu sou uma pessoa de verdade.', { obrigatorios: [] }, kaki, 'C-0002').ok).toBe(false)
  })
})
