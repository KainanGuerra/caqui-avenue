import { describe, expect, it } from 'vitest'
import { em } from '../testing/fixtures'
import { extrairSlots } from './slots'
import { detectarIntencoes } from './intents'

const agora = em('2026-11-18T10:00-03:00')

describe('slots de data, hora e produto', () => {
  it('PT-01: data explícita, hora e fundo', () => {
    expect(extrairSlots('Pedi o resgate do Caqui Renda Fixa na sexta, 30/10, às 17h. Quando o dinheiro cai?', agora)).toMatchObject({
      produtos: ['FUNDO-RF-01'], dataEvento: '2026-10-30', minutos: 17 * 60,
    })
  })

  it('PT-02: "hoje às 15h58"', () => {
    expect(extrairSlots('Resgatei o CDB de liquidez diária hoje às 15h58. Cai hoje?', em('2026-11-16T16:10-03:00'))).toMatchObject({
      generico: 'cdb', dataEvento: '2026-11-16', minutos: 15 * 60 + 58,
    })
  })

  it('PT-03: "ontem às 19h40" contra o momento da conversa', () => {
    expect(extrairSlots('Pedi resgate do CDB 110 ontem às 19h40', em('2026-11-18T09:00-03:00'))).toMatchObject({
      produtos: ['CDB-LD-110'], dataEvento: '2026-11-17', minutos: 19 * 60 + 40,
    })
  })

  it('PT-04: hora com minutos e multimercado', () => {
    expect(extrairSlots('o multimercado que pedi em 30/10 às 17h20', agora)).toMatchObject({ produtos: ['FUNDO-MM-01'], dataEvento: '2026-10-30', minutos: 17 * 60 + 20 })
  })

  it('PT-05: "no sábado de manhã" aponta o sábado mais recente', () => {
    expect(extrairSlots('Pedi resgate do CDB no sábado de manhã', em('2026-11-14T09:05-03:00'))).toMatchObject({ dataEvento: '2026-11-14', minutos: 540 })
  })

  it('separa a data da aplicação da data de cálculo', () => {
    expect(extrairSlots('o fundo de renda fixa (aplicado em 24/11/2025) com a data de cálculo em 20/11/2026', agora)).toMatchObject({
      produtos: ['FUNDO-RF-01'], dataAplicacao: '2025-11-24', dataEvento: '2026-11-20',
    })
    expect(extrairSlots('o CDB que apliquei em 21/05/2026', agora)).toMatchObject({ dataAplicacao: '2026-05-21', dataEvento: null })
  })

  it('"ontem, 17/11": a data explícita vale', () => {
    expect(extrairSlots('E se eu tivesse resgatado esse mesmo CDB ontem, 17/11?', agora)).toMatchObject({ dataEvento: '2026-11-17' })
  })

  it('não inventa hora nem data quando o texto não traz', () => {
    expect(extrairSlots('quando cai meu resgate?', agora)).toMatchObject({ dataEvento: null, minutos: null })
  })
})

describe('intenções', () => {
  it.each([
    ['Pedi o resgate do Caqui Renda Fixa na sexta. Quando o dinheiro cai?', 'prazo_resgate'],
    ['Pedi resgate do CDB 110 ontem às 19h40. Por que ainda não caiu?', 'prazo_resgate'],
    ['Pedi resgate do CDB no sábado de manhã. Quando cai?', 'prazo_resgate'],
    ['Se eu resgatar hoje o CDB, qual a alíquota de IR?', 'imposto'],
    ['O IR do meu Tesouro Selic incide sobre o valor total do resgate?', 'imposto'],
    ['Meu CDB rendeu menos que a poupança?', 'comparar_poupanca'],
    ['Qual a taxa da poupança hoje?', 'taxa_poupanca'],
    ['Me confirma meu CPF completo?', 'cpf'],
    ['Qual o horário de corte para resgate de CDB?', 'horario_corte'],
    ['O que é liquidez diária?', 'conceito'],
    ['Esse CDB tem garantia?', 'garantia'],
    ['Vocês têm previdência privada?', 'produto_inexistente'],
    ['Qual o prazo de resgate de criptomoedas?', 'produto_inexistente'],
  ] as const)('"%s" -> %s', (texto, esperada) => {
    expect(detectarIntencoes(texto)).toContain(esperada)
  })

  it('texto solto não gera intenção', () => {
    expect(detectarIntencoes('asdf')).toEqual([])
    expect(detectarIntencoes('não é isso')).toEqual([])
  })
})

import { ehPergunta } from './intents'

describe('ehPergunta', () => {
  it.each(['qual o rendimento do CDB em 2030?', 'qual o endereço da sede da Caqui?', 'vocês patrocinam algum time de futebol?'])('"%s" é pergunta', (t) => {
    expect(ehPergunta(t)).toBe(true)
  })
  it.each(['asdf', 'não é isso', 'não é isso de novo', 'oi'])('"%s" não é pergunta', (t) => {
    expect(ehPergunta(t)).toBe(false)
  })
})
