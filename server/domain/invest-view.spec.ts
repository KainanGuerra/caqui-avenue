import { describe, expect, it } from 'vitest'
import { dados } from '../testing/fixtures'
import { liquidezDe, montarInvestir, rentabilidadeDe } from './invest-view'

const produto = (codigo: string) => dados.taxas.produtos.find((p) => p.codigo === codigo)!
const vista = montarInvestir(dados.taxas.produtos, dados.kb)

describe('Investir (regra 4: explica, não recomenda)', () => {
  it('produtos na ordem dos dados, sem ranking por rentabilidade', () => {
    expect(vista.produtos.map((p) => p.codigo)).toEqual(dados.taxas.produtos.map((p) => p.codigo))
  })

  it('nenhum texto chama produto de melhor nem indica onde aplicar', () => {
    expect(JSON.stringify(vista.produtos)).not.toMatch(/melhor|recomend|indicad|ideal/i)
  })

  it('rentabilidade: % do CDI, fundo como referência e renda variável sem número', () => {
    expect(rentabilidadeDe(produto('CDB-LD-110'))).toBe('110% do CDI')
    expect(rentabilidadeDe(produto('LCI-90D-92'))).toBe('92% do CDI')
    expect(rentabilidadeDe(produto('FUNDO-RF-01'))).toBe('Referência de 98% do CDI; a cota pode variar')
    expect(rentabilidadeDe(produto('ACOES'))).toBe('Varia com o mercado')
  })

  it('liquidez sai dos mesmos campos do cálculo de prazo', () => {
    expect(liquidezDe(produto('CDB-LD-100'))).toBe('Liquidez diária')
    expect(liquidezDe(produto('LCI-90D-92'))).toBe('Liquidez diária depois de 90 dias de carência')
    expect(liquidezDe(produto('CDB-2A-120'))).toBe('Resgate só no vencimento')
    expect(liquidezDe(produto('FUNDO-RF-01'))).toBe('Cotização em D+1 e pagamento em D+2, em dias úteis')
    expect(liquidezDe(produto('FUNDO-MM-01'))).toBe('Cotização 30 dias corridos após o pedido e pagamento 2 dias úteis depois')
    expect(liquidezDe(produto('TESOURO-SELIC-2029'))).toBe('Liquidação em D+1 útil')
  })

  it('LCI e LCA isentas; o resto com imposto sobre o rendimento', () => {
    const imposto = (c: string) => vista.produtos.find((p) => p.codigo === c)!.imposto
    expect(imposto('LCA-1A-95')).toMatch(/^Isento/)
    expect(imposto('CDB-LD-100')).toMatch(/^Imposto de renda/)
  })

  it('cada produto aponta o artigo que explica o tipo, e os artigos vêm para ler na página', () => {
    expect(vista.produtos.find((p) => p.codigo === 'CDB-LD-100')!.kbId).toBe('KB-003')
    expect(vista.produtos.find((p) => p.codigo === 'LCA-1A-95')!.kbId).toBe('KB-011')
    expect(vista.artigos.map((a) => a.id)).toEqual(['KB-003', 'KB-011', 'KB-014', 'KB-015', 'KB-016'])
  })

  it('o especialista vem com a fonte da busca na base (KB-029)', () => {
    expect(vista.especialista.kbId).toBe('KB-029')
  })

  it('sem o artigo na base, o produto fica sem fonte em vez de inventar uma', () => {
    const semKb = montarInvestir(dados.taxas.produtos, [])
    expect(semKb.produtos.every((p) => p.kbId === null)).toBe(true)
    expect(semKb.artigos).toEqual([])
  })
})
