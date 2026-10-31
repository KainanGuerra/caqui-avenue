import { describe, expect, it } from 'vitest'
import { cromoEscuro, esquemaDaPagina, modoInicial, proximoModo } from './theme'

describe('tema', () => {
  it('o botão gira claro, misto, escuro e volta ao claro', () => {
    expect(proximoModo('light')).toBe('mixed')
    expect(proximoModo('mixed')).toBe('dark')
    expect(proximoModo('dark')).toBe('light')
  })

  it('só o modo escuro escurece a página; o misto escurece o topo e o menu', () => {
    expect(esquemaDaPagina('mixed')).toBe('light')
    expect(esquemaDaPagina('dark')).toBe('dark')
    expect(cromoEscuro('light')).toBe(false)
    expect(cromoEscuro('mixed')).toBe(true)
    expect(cromoEscuro('dark')).toBe(true)
  })

  it('usa a escolha salva e, sem ela ou com valor inválido, a preferência do aparelho', () => {
    expect(modoInicial('mixed', true)).toBe('mixed')
    expect(modoInicial(null, true)).toBe('dark')
    expect(modoInicial('azul', false)).toBe('light')
  })
})
