import { describe, expect, it } from 'vitest'
import { dados } from '../testing/fixtures'
import { buscar, melhorArtigo } from './kb-search'

const topo = (pergunta: string, informativa = true) => melhorArtigo(dados.kb, pergunta, informativa)?.artigo.id ?? null

describe('busca na base de conhecimento (regra 9)', () => {
  it.each([
    ['Qual o horário de corte para resgate de CDB?', 'KB-006'],
    ['O que é liquidez diária?', 'KB-004'],
    ['Esse CDB tem garantia?', 'KB-013'],
    ['Vocês têm previdência privada?', 'KB-030'],
    ['Como troco minha senha?', 'KB-021'],
    ['Onde vejo meu informe de rendimentos?', 'KB-017'],
    ['Posso transferir para a conta de outra pessoa?', 'KB-018'],
    ['O que é CDI?', 'KB-002'],
    ['O que é um CDB?', 'KB-003'],
    ['Como falar com uma pessoa?', 'KB-025'],
  ])('"%s" -> %s', (pergunta, id) => {
    expect(topo(pergunta)).toBe(id)
  })

  it('PT-31: o artigo antigo (corte de 15h) nunca aparece, nem entre os candidatos', () => {
    const { achados, descartados } = buscar(dados.kb, 'Qual o horário de corte para resgate de CDB?', 10)
    expect(achados.map((a) => a.artigo.id)).not.toContain('KB-007')
    expect(descartados.map((a) => a.id)).toEqual(['KB-007'])
  })

  it('assunto fora da base não passa do limiar', () => {
    expect(topo('qual a taxa do seu seguro de vida?')).toBe('KB-030') // seguro está na lista do que a Caqui não oferece
    expect(topo('qual o rendimento do CDB em 2030?', false)).toBeNull() // pergunta livre exige acerto forte
    expect(topo('qual o melhor time de futebol?')).toBeNull()
    expect(topo('xyz qwerty')).toBeNull()
  })

  it('pergunta sem palavra útil não acha nada', () => {
    expect(buscar(dados.kb, 'de a o').achados).toEqual([])
  })
})
