import { describe, expect, it } from 'vitest'
import { dados } from '../testing/fixtures'
import { TEMAS_APRENDER, montarAprender } from './learning-view'

describe('Aprender (regra 9: só a base atual)', () => {
  it('todo artigo da curadoria existe nos dados e está atual', () => {
    const temas = montarAprender(dados.kb)
    expect(temas.flatMap((t) => t.artigos.map((a) => a.id))).toEqual(TEMAS_APRENDER.flatMap((t) => t.ids))
  })

  it('a KB-007 antiga nunca aparece, mesmo se entrar na curadoria', () => {
    const ids = montarAprender(dados.kb).flatMap((t) => t.artigos.map((a) => a.id))
    expect(ids).not.toContain('KB-007')
    const comAntiga = dados.kb.filter((a) => a.id === 'KB-007')
    expect(montarAprender(comAntiga)).toEqual([])
  })

  it('cada artigo vem com título, data de revisão e blocos para ler', () => {
    for (const a of montarAprender(dados.kb).flatMap((t) => t.artigos)) {
      expect(a.titulo, a.id).not.toBe('')
      expect(a.revisadoEm, a.id).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(a.blocos.length, a.id).toBeGreaterThan(0)
    }
  })

  it('tema sem nenhum artigo na base some', () => {
    expect(montarAprender([])).toEqual([])
  })
})
