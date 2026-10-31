import { describe, expect, it } from 'vitest'
import { resolve } from 'node:path'
import { carregarDados } from './dados'
import { parseCsv } from './csv'

const dados = carregarDados(resolve('caqui-invest/dados'))

describe('parseCsv', () => {
  it('lê campos entre aspas com vírgula e aspas escapadas', () => {
    expect(parseCsv('a,b\n"x, y","diz ""oi"""\n')).toEqual([{ a: 'x, y', b: 'diz "oi"' }])
  })
})

describe('carregarDados', () => {
  it('carrega os volumes do pacote de dados', () => {
    expect(dados.clientes.size).toBe(50)
    expect(dados.kb).toHaveLength(30)
    expect(dados.conversasHistoricas()).toHaveLength(300)
  })

  it('converte dinheiro para centavos inteiros', () => {
    const c0002 = dados.dadosDoCliente('C-0002')!
    const cdb = c0002.posicoes.find((p) => p.produto === 'CDB-LD-100')!
    expect(cdb.valorAplicadoCentavos).toBe(1_500_000)
    expect(cdb.saldoBrutoCentavos).toBe(1_581_003)
  })

  it('só entrega posições e operações do cliente pedido', () => {
    const d = dados.dadosDoCliente('C-0002')!
    expect(d.posicoes.every((p) => p.clienteId === 'C-0002')).toBe(true)
    expect(d.operacoes.every((o) => o.clienteId === 'C-0002')).toBe(true)
    expect(dados.dadosDoCliente('C-9999')).toBeNull()
  })

  it('guarda a revisão de cada artigo para desempate', () => {
    const kb6 = dados.kb.find((a) => a.id === 'KB-006')!
    const kb7 = dados.kb.find((a) => a.id === 'KB-007')!
    expect(kb6.revisadoEm > kb7.revisadoEm).toBe(true)
  })

  it('reconhece feriado nacional do calendário da Caqui', () => {
    expect(dados.calendario.feriados.get('2026-11-02')).toBe('Finados')
    expect(dados.calendario.diaUtil.get('2026-11-02')).toBe(false)
  })

  it('lê as faixas de IR e os produtos', () => {
    expect(dados.taxas.irRegressivo.map((f) => f.aliquota)).toEqual([0.225, 0.2, 0.175, 0.15])
    expect(dados.taxas.produtos.find((p) => p.codigo === 'FUNDO-MM-01')?.cotizacaoCorridos).toBe(30)
  })
})
