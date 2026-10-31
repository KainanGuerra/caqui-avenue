import { describe, expect, it } from 'vitest'
import { dados } from '../testing/fixtures'
import { MAX_OPERACOES, montarConta } from './account-view'

const contaDe = (id: string) => montarConta(dados.dadosDoCliente(id)!, dados.taxas)

describe('conta vista pelo cliente', () => {
  it('Dona Marta: saldo em conta, totais e rendimento saem das posições dela', () => {
    const v = contaDe('C-0001')
    expect(v.saldoEmContaCentavos).toBe(125000)
    expect(v.posicoes.map((p) => p.id)).toEqual(['P-0001', 'P-0002'])
    expect(v.totalAplicadoCentavos).toBe(6000000)
    expect(v.totalBrutoCentavos).toBe(4079124 + 2022991)
    const cdb = v.posicoes[0]!
    expect(cdb.rendimentoBrutoCentavos).toBe(4079124 - 4000000)
    expect(cdb.nomeProduto).toContain('Liquidez Diária 110')
  })

  it('só traz posições do próprio cliente', () => {
    const v = contaDe('C-0002')
    expect(v.posicoes.every((p) => dados.dadosDoCliente('C-0002')!.posicoes.some((x) => x.id === p.id))).toBe(true)
    expect(v.posicoes.map((p) => p.id)).not.toContain('P-0001')
  })

  it('posição com perda (ações) tem rendimento negativo', () => {
    const acoes = contaDe('C-0002').posicoes.find((p) => p.produto === 'ACOES')!
    expect(acoes.rendimentoBrutoCentavos).toBe(715109 - 800000)
  })

  it('operações vêm da mais recente para a mais antiga e limitadas', () => {
    const ops = contaDe('C-0007').operacoes
    expect(ops.length).toBeLessThanOrEqual(MAX_OPERACOES)
    const datas = ops.map((o) => o.pedidoEm)
    expect(datas).toEqual([...datas].sort().reverse())
  })

  it('nenhum campo de CPF vai para a tela', () => {
    expect(JSON.stringify(contaDe('C-0001'))).not.toMatch(/cpf|\*\*\*\./i)
  })
})
