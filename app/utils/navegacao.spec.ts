import { describe, expect, it } from 'vitest'
import { casaDoPapel, destinoPermitido, itemAtivo, menuDoPapel } from './navegacao'

describe('menu por papel', () => {
  it('cliente vê início e conversa; suporte vê só a fila', () => {
    expect(menuDoPapel('cliente').map((i) => i.chave)).toEqual(['inicio', 'conversa'])
    expect(menuDoPapel('suporte').map((i) => i.chave)).toEqual(['suporte'])
  })

  it('item ativo é a própria página ou uma abaixo dela, e não um prefixo parecido', () => {
    expect(itemAtivo({ para: '/suporte' }, '/suporte')).toBe(true)
    expect(itemAtivo({ para: '/suporte' }, '/suporte/casos/1')).toBe(true)
    expect(itemAtivo({ para: '/inicio' }, '/inicio-falso')).toBe(false)
  })
})

describe('quem abre o quê', () => {
  it('sem papel só a entrada abre', () => {
    expect(destinoPermitido(null, '/')).toBeNull()
    expect(destinoPermitido(null, '/inicio')).toBe('/')
    expect(destinoPermitido(null, '/suporte')).toBe('/')
  })

  it('quem já entrou vai direto para a própria casa ao abrir a entrada', () => {
    expect(destinoPermitido('cliente', '/')).toBe('/inicio')
    expect(destinoPermitido('suporte', '/')).toBe('/suporte')
  })

  it('cliente não abre a fila e o suporte não abre o chat do cliente', () => {
    expect(destinoPermitido('cliente', '/suporte')).toBe(casaDoPapel('cliente'))
    expect(destinoPermitido('suporte', '/conversa')).toBe('/suporte')
    expect(destinoPermitido('suporte', '/inicio')).toBe('/suporte')
  })

  it('cada papel abre as próprias telas', () => {
    expect(destinoPermitido('cliente', '/conversa')).toBeNull()
    expect(destinoPermitido('suporte', '/suporte')).toBeNull()
  })
})
