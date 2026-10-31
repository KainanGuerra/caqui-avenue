import { describe, expect, it } from 'vitest'
import { cal, dados } from '../testing/fixtures'
import { MAX_OPERACOES, alocarPorClasse, avisosDeFeriado, montarConta, prazoDeResgate } from './account-view'
import type { Momento } from './momento'

const HOJE = '2026-11-18'
// "Agora" dos dados: 18/11/2026 às 10h, antes do corte das 16h.
const AGORA: Momento = { data: HOJE, minutos: 10 * 60 }
const contaDe = (id: string, agora = AGORA) => montarConta(dados.dadosDoCliente(id)!, dados.taxas, cal, agora)
const produto = (codigo: string) => dados.taxas.produtos.find((p) => p.codigo === codigo)!
const emAndamentoDe = (id: string, operacaoId: string) => contaDe(id).emAndamento.find((o) => o.operacaoId === operacaoId)!
const resumo = (etapas: { titulo: string; data: string; estado: string }[]) => etapas.map((e) => `${e.titulo}|${e.data}|${e.estado}`)

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

  it('patrimônio é saldo bruto mais saldo em conta; resultado é bruto menos aplicado', () => {
    const v = contaDe('C-0001')
    expect(v.patrimonioCentavos).toBe(4079124 + 2022991 + 125000)
    expect(v.resultadoCentavos).toBe(4079124 + 2022991 - 6000000)
    expect(v.resultadoPercentual).toBe(1.7)
    expect(v.atualizadoEm).toBe('2026-11-18')
    expect(v.hoje).toBe(HOJE)
  })

  it('resultado negativo fica negativo (Rafael tem ações com perda)', () => {
    const v = contaDe('C-0002')
    expect(v.resultadoCentavos).toBe(v.totalBrutoCentavos - v.totalAplicadoCentavos)
    expect(v.posicoes.find((p) => p.produto === 'ACOES')!.rendimentoBrutoCentavos).toBeLessThan(0)
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

  it('operação não leva a coluna liquidacao_prevista para a tela (regra 1)', () => {
    expect(contaDe('C-0001').operacoes.every((o) => !('liquidacaoPrevista' in o))).toBe(true)
  })
})

describe('prazo de resgate de cada posição (regra 1: pedido agora, corte das 16h, dias úteis)', () => {
  it('Dona Marta, CDB de liquidez diária às 10h: cai hoje, com fonte KB-006', () => {
    expect(contaDe('C-0001').posicoes[0]!.resgate).toEqual({
      tipo: 'liquida', pagamento: '2026-11-18', detalhe: 'Liquidez diária: liquida no dia-base.', fontes: ['KB-006'],
    })
  })

  it('o mesmo CDB às 17h conta a partir do próximo dia útil', () => {
    const r = contaDe('C-0001', { data: HOJE, minutos: 17 * 60 }).posicoes[0]!.resgate
    expect(r).toMatchObject({ tipo: 'liquida', pagamento: '2026-11-19' })
    expect(r).toMatchObject({ detalhe: expect.stringContaining('conta a partir de quinta, 19/11, porque passou das 16h00') })
  })

  it('16h00 em ponto ainda conta no mesmo dia (premissa D4)', () => {
    expect(contaDe('C-0001', { data: HOJE, minutos: 16 * 60 }).posicoes[0]!.resgate).toMatchObject({ pagamento: '2026-11-18' })
  })

  it('LCI aplicada em 05/10 está em carência de 90 dias até 03/01/2027', () => {
    expect(contaDe('C-0001').posicoes[1]!.resgate).toEqual({ tipo: 'em_carencia', disponivelEm: '2027-01-03', fontes: ['KB-006'] })
  })

  it('CDB sem liquidez diária só sai no vencimento da posição', () => {
    const p = contaDe('C-0019').posicoes.find((x) => x.produto === 'CDB-2A-120')!
    expect(p.resgate).toEqual({ tipo: 'no_vencimento', vencimento: '2028-01-20', fontes: ['KB-006'] })
  })

  it('fundo de renda fixa: pagamento em D+2 úteis pula o feriado de 20/11', () => {
    const r = prazoDeResgate({ dataAplicacao: '2026-01-02', vencimento: null }, produto('FUNDO-RF-01'), cal, AGORA)
    expect(r).toMatchObject({ tipo: 'liquida', pagamento: '2026-11-23' })
  })

  it('pedido no fim de semana conta a partir do próximo dia útil, sem falar em corte', () => {
    const r = prazoDeResgate({ dataAplicacao: '2026-01-02', vencimento: null }, produto('CDB-LD-100'), cal, { data: '2026-11-21', minutos: 10 * 60 })
    expect(r).toMatchObject({ tipo: 'liquida', pagamento: '2026-11-23' })
    expect(r).toMatchObject({ detalhe: expect.not.stringContaining('16h') })
  })
})

describe('em andamento (regra 1: prazo pelo calendário e pelo corte das 16h)', () => {
  it('Dona Marta, OP-10005: pedido 17/11 19h40 depois do corte, liquida 18/11', () => {
    const op = emAndamentoDe('C-0001', 'OP-10005')
    expect(op).toMatchObject({ tipo: 'resgate', valorCentavos: 4000000, liquidacaoPrevista: '2026-11-18', fontes: ['KB-006', 'OP-10005'] })
    expect(op.nomeProduto).toContain('Liquidez Diária 110')
    expect(resumo(op.etapas)).toEqual([
      'Pedido recebido|2026-11-17|feito',
      'Liquidação|2026-11-18|atual',
      'No saldo disponível|2026-11-18|proximo',
    ])
    expect(op.etapas[0]).toMatchObject({ hora: '19h40', detalhe: expect.stringContaining('Depois das 16h00') })
  })

  it('só entra operação em processamento', () => {
    const marta = dados.dadosDoCliente('C-0001')!
    const ids = contaDe('C-0001').emAndamento.map((o) => o.operacaoId)
    expect(ids).toEqual(marta.operacoes.filter((o) => o.status === 'em_processamento').map((o) => o.id))
  })

  it('cliente sem operação em processamento não tem card', () => {
    expect(contaDe('C-0002').emAndamento).toEqual([])
  })

  it('fundo tem cotização; a data vem do cálculo, não da coluna liquidacao_prevista (vazia em OP-10001)', () => {
    const op = emAndamentoDe('C-0007', 'OP-10001')
    expect(dados.dadosDoCliente('C-0007')!.operacoes.find((o) => o.id === 'OP-10001')!.liquidacaoPrevista).toBeNull()
    expect(op.liquidacaoPrevista).toBe('2026-11-18')
    expect(resumo(op.etapas)).toEqual([
      'Pedido recebido|2026-11-13|feito',
      'Cotização|2026-11-17|feito',
      'Liquidação|2026-11-18|atual',
      'No saldo disponível|2026-11-18|proximo',
    ])
  })

  it('atrasada (OP-10014, prazo já passou): a última etapa segue atual, nada aparece como concluído', () => {
    const op = emAndamentoDe('C-0041', 'OP-10014')
    expect(op.etapas.at(-1)).toMatchObject({ titulo: 'No saldo disponível', estado: 'atual' })
    expect(op.etapas.slice(0, -1).every((e) => e.estado === 'feito')).toBe(true)
  })

  it('aplicação em CDB de liquidez diária liquida no dia-base', () => {
    const op = emAndamentoDe('C-0013', 'OP-10359')
    expect(op.liquidacaoPrevista).toBe('2026-11-18')
    expect(op.etapas.map((e) => e.titulo)).toEqual(['Pedido recebido', 'Liquidação', 'Aplicado no produto'])
  })

  it('aplicação em fundo: só o dia-base, sem inventar data de liquidação', () => {
    const op = emAndamentoDe('C-0026', 'OP-10027')
    expect(op.liquidacaoPrevista).toBeNull()
    expect(op.etapas.map((e) => e.titulo)).toEqual(['Pedido recebido', 'Dia-base do pedido'])
  })
})

describe('alocação por classe', () => {
  it('Dona Marta: 100% renda fixa', () => {
    expect(contaDe('C-0001').alocacao).toEqual([{ classe: 'renda_fixa', rotulo: 'Renda fixa', centavos: 4079124 + 2022991, percentual: 100 }])
  })

  it('Rafael: ações em renda variável, percentuais inteiros que somam 100', () => {
    const fatias = contaDe('C-0002').alocacao
    expect(fatias).toEqual([
      { classe: 'renda_fixa', rotulo: 'Renda fixa', centavos: 1581003 + 1324471 + 618350, percentual: 83 },
      { classe: 'renda_variavel', rotulo: 'Renda variável', centavos: 715109, percentual: 17 },
    ])
    expect(fatias.reduce((s, f) => s + f.centavos, 0)).toBe(contaDe('C-0002').totalBrutoCentavos)
  })

  it('multimercado conta como renda variável (a cota pode cair, KB-014)', () => {
    expect(alocarPorClasse([{ produto: 'FUNDO-MM-01', saldoBrutoCentavos: 100 }]).map((f) => f.classe)).toEqual(['renda_variavel'])
  })

  it('arredonda pelo maior resto para fechar 100', () => {
    const fatias = alocarPorClasse([{ produto: 'CDB-LD-100', saldoBrutoCentavos: 1 }, { produto: 'ACOES', saldoBrutoCentavos: 2 }])
    expect(fatias.map((f) => f.percentual)).toEqual([33, 67])
  })

  it('sem posição, sem fatias', () => {
    expect(alocarPorClasse([])).toEqual([])
  })
})

describe('avisos de feriado nos próximos 5 dias úteis', () => {
  it('em 18/11 avisa do feriado de 20/11 e diz quando conta o pedido de quinta depois das 16h', () => {
    expect(avisosDeFeriado(cal, HOJE)).toEqual([{
      data: '2026-11-20',
      titulo: '20/11 é feriado (Dia da Consciência Negra)',
      detalhe: 'Pedidos de quinta, 19/11, depois das 16h00 contam a partir de segunda, 23/11.',
      fontes: ['KB-006', 'calendário da Caqui'],
    }])
  })

  it('feriado no domingo (15/11) não muda prazo e não vira aviso', () => {
    expect(avisosDeFeriado(cal, '2026-11-13').map((a) => a.data)).toEqual(['2026-11-20'])
  })

  it('fora da janela não há aviso', () => {
    expect(avisosDeFeriado(cal, '2026-11-24')).toEqual([])
  })

  it('o aviso chega na conta vista', () => {
    expect(contaDe('C-0001').avisos.map((a) => a.data)).toEqual(['2026-11-20'])
  })
})
