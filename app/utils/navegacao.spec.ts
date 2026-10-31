import { describe, expect, it } from 'vitest'
import { casaDoPapel, destinoPermitido, ITENS_MENU, itemAtivo, menuDoPapel } from './navegacao'

describe('menu por papel', () => {
  it('cliente vê as cinco abas do rodapé, na ordem do Figma; suporte vê só a fila; gerente vê só o painel', () => {
    expect(menuDoPapel('cliente').map((i) => i.rotulo)).toEqual(['Início', 'Carteira', 'Investir', 'Aprender', 'Atendimento'])
    expect(menuDoPapel('suporte').map((i) => i.chave)).toEqual(['suporte'])
    expect(menuDoPapel('gerente').map((i) => i.chave)).toEqual(['gerente'])
  })

  it('a conversa não tem aba própria: é a última alternativa, dentro do Atendimento', () => {
    expect(menuDoPapel('cliente').map((i) => i.para)).not.toContain('/conversa')
    const atendimento = ITENS_MENU.find((i) => i.chave === 'atendimento')!
    expect(itemAtivo(atendimento, '/conversa')).toBe(true)
    expect(menuDoPapel('cliente').filter((i) => itemAtivo(i, '/conversa'))).toEqual([atendimento])
  })

  it('item ativo é a própria página ou uma abaixo dela, e não um prefixo parecido', () => {
    expect(itemAtivo({ para: '/suporte' }, '/suporte')).toBe(true)
    expect(itemAtivo({ para: '/suporte' }, '/suporte/casos/1')).toBe(true)
    expect(itemAtivo({ para: '/inicio' }, '/inicio-falso')).toBe(false)
    expect(itemAtivo({ para: '/atendimento', tambem: ['/conversa'] }, '/conversas')).toBe(false)
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
    expect(destinoPermitido('gerente', '/')).toBe('/gerente')
  })

  it('gerente não abre a fila nem o chat; cliente e suporte não abrem o painel', () => {
    expect(destinoPermitido('gerente', '/suporte')).toBe('/gerente')
    expect(destinoPermitido('gerente', '/conversa')).toBe('/gerente')
    expect(destinoPermitido('cliente', '/gerente')).toBe('/inicio')
    expect(destinoPermitido('suporte', '/gerente')).toBe('/suporte')
    expect(destinoPermitido(null, '/gerente')).toBe('/')
    expect(destinoPermitido('gerente', '/gerente')).toBeNull()
  })

  it('cliente não abre a fila e o suporte não abre nenhuma tela do cliente, nem a conversa fora do menu', () => {
    expect(destinoPermitido('cliente', '/suporte')).toBe(casaDoPapel('cliente'))
    for (const tela of ['/inicio', '/carteira', '/investir', '/aprender', '/atendimento', '/conversa']) {
      expect(destinoPermitido('suporte', tela), tela).toBe('/suporte')
      expect(destinoPermitido(null, tela), tela).toBe('/')
    }
  })

  it('cada papel abre as próprias telas', () => {
    for (const tela of ['/inicio', '/carteira', '/investir', '/aprender', '/atendimento', '/conversa']) {
      expect(destinoPermitido('cliente', tela), tela).toBeNull()
    }
    expect(destinoPermitido('suporte', '/suporte')).toBeNull()
  })
})
