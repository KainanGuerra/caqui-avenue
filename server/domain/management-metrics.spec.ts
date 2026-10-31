import { describe, expect, it } from 'vitest'
import type { Caso } from './case-summary'
import { contar, distribuirSentimentos, inferirSentimento, paginarCasos, resumirAoVivo, tokensEstimados, type RegistroLlm, type RegistroResposta } from './management-metrics'

const resposta = (sessaoId: string, extra: Partial<RegistroResposta> = {}): RegistroResposta => ({
  em: '2026-11-18T10:00:00-03:00', sessaoId, acao: 'responder', motivos: [], redacao: 'template', comFonte: true, naoEntendeu: false, ms: 10, ...extra,
})

const caso = (sessaoId: string, extra: Partial<Caso> = {}): Caso => ({
  id: sessaoId, protocolo: `P-${sessaoId}`, sessaoId, clienteId: 'C-0001', clienteNome: 'Marta Siqueira', idade: 63, cpfMascarado: '***', acao: 'encaminhar_humano',
  motivos: ['HUMANO_PEDIDO'], prioridade: 1, risco: 'medio', status: 'aberto', atendente: null, criadoEm: '2026-11-18T10:00:00-03:00', atualizadoEm: '2026-11-18T10:00:00-03:00',
  resumo: [], fontes: [], ...extra,
})

const SEM_PRECO = { entradaCentavosMtok: 0, saidaCentavosMtok: 0 }

describe('apoio', () => {
  it('contar ordena do maior para o menor e desempata pela chave', () => {
    expect(contar(['b', 'a', 'b', 'c', 'a']).map((c) => [c.chave, c.total, c.pct])).toEqual([['a', 2, 40], ['b', 2, 40], ['c', 1, 20]])
  })

  it('tokens estimados arredondam para cima, 4 caracteres por token', () => {
    expect(tokensEstimados(0)).toBe(0)
    expect(tokensEstimados(1)).toBe(1)
    expect(tokensEstimados(8)).toBe(2)
    expect(tokensEstimados(9)).toBe(3)
  })
})

describe('painel: a Kaki ao vivo', () => {
  it('resolução automática é a parte das conversas que não virou caso', () => {
    const r = resumirAoVivo([resposta('s1'), resposta('s1'), resposta('s2'), resposta('s3'), resposta('s4', { acao: 'encaminhar_humano' })], [], [caso('s4')], SEM_PRECO)
    expect(r.conversas).toBe(4)
    expect(r.mensagens).toBe(5)
    expect(r.escalonadas).toBe(1)
    expect(r.resolucaoAutomaticaPct).toBe(75)
    expect(r.escalonadasPct).toBe(25)
    expect(r.porAcao).toEqual([{ chave: 'encaminhar_humano', rotulo: 'Atendimento por pessoa', total: 1, pct: 100 }])
  })

  it('lista os casos do mais novo ao mais antigo, com o motivo em português', () => {
    const r = resumirAoVivo([resposta('s1'), resposta('s2')], [], [
      caso('s1', { criadoEm: '2026-11-18T09:00:00-03:00' }),
      caso('s2', { criadoEm: '2026-11-18T11:00:00-03:00', acao: 'seguranca_imediata', motivos: ['GOLPE_CREDENCIAL', 'GOLPE_CREDENCIAL'] }),
    ], SEM_PRECO)
    expect(r.casos.itens.map((c) => c.protocolo)).toEqual(['P-s2', 'P-s1'])
    expect(r.casos.itens[0]).toMatchObject({ acao: 'Segurança imediata', motivos: ['pedido de senha, código ou token'] })
  })

  it('conta como travada a conversa escalonada por limite de passos ou por não entender duas vezes', () => {
    const r = resumirAoVivo([
      resposta('s1', { motivos: ['PASSOS_MAX'] }), resposta('s2', { motivos: ['NAO_ENTENDEU_2X', 'FORA_HORARIO'] }), resposta('s3', { motivos: ['HUMANO_PEDIDO'] }),
    ], [], [], SEM_PRECO)
    expect(r.travadas).toBe(2)
  })

  it('qualidade: barradas só entre os textos que a IA escreveu (erro do provedor fica fora); fonte só entre respostas diretas', () => {
    const r = resumirAoVivo([
      resposta('s1', { redacao: 'llm' }), resposta('s1', { redacao: 'reprovada' }), resposta('s1', { redacao: 'erro', comFonte: false }), resposta('s1', { redacao: 'llm' }),
      resposta('s2', { naoEntendeu: true, comFonte: false }), resposta('s2', { acao: 'protocolo', comFonte: false }),
    ], [], [], SEM_PRECO)
    expect(r.qualidade.redacoesLlm).toBe(3)
    expect(r.qualidade.reprovadasPct).toBe(33)
    expect(r.qualidade.comFontePct).toBe(75)
    expect(r.qualidade.naoEntendeuPct).toBe(17)
  })

  it('sem LLM a reprovação fica vazia, e não 0%', () => {
    expect(resumirAoVivo([resposta('s1')], [], [], SEM_PRECO).qualidade.reprovadasPct).toBeNull()
  })

  it('tempo médio de resposta, arredondado em ms', () => {
    const ms = [10, 20, 30, 40, 50, 60, 70, 80, 90, 1000]
    const r = resumirAoVivo(ms.map((m, i) => resposta(`s${i}`, { ms: m })), [], [], SEM_PRECO)
    expect(r.latencia).toEqual({ mediaMs: 145 })
  })

  it('custo: tokens estimados por chamada vezes o preço, em centavos inteiros', () => {
    // 4.000.000 caracteres de entrada = 1 milhão de tokens; 400.000 de saída = 100 mil tokens.
    const chamadas: RegistroLlm[] = [{ caracteresEntrada: 4_000_000, caracteresSaida: 400_000, ms: 1, ok: true }]
    const r = resumirAoVivo([resposta('s1'), resposta('s2')], chamadas, [], { entradaCentavosMtok: 1500, saidaCentavosMtok: 7500 })
    expect(r.custo).toEqual({ chamadasLlm: 1, tokensEntrada: 1_000_000, tokensSaida: 100_000, totalCentavos: 1500 + 750, porMilConversasCentavos: 1_125_000, precoConfigurado: true })
  })

  it('no modo template não há chamada nem custo', () => {
    const r = resumirAoVivo([resposta('s1')], [], [], SEM_PRECO)
    expect(r.custo).toMatchObject({ chamadasLlm: 0, totalCentavos: 0, porMilConversasCentavos: 0, precoConfigurado: false })
  })

  it('sem conversa nenhuma, nada vira 0%', () => {
    const r = resumirAoVivo([], [], [], SEM_PRECO)
    expect(r.resolucaoAutomaticaPct).toBeNull()
    expect(r.latencia.mediaMs).toBeNull()
    expect(r.custo.porMilConversasCentavos).toBeNull()
  })
})

describe('lista de casos paginada', () => {
  // 25 casos, um por minuto: o maior número é o mais novo.
  const muitos = Array.from({ length: 25 }, (_, i) => caso(`s${String(i).padStart(2, '0')}`, {
    criadoEm: `2026-11-18T10:${String(i).padStart(2, '0')}:00-03:00`, status: i % 5 === 0 ? 'resolvido' : 'aberto',
  }))

  it('manda só 10 por vez, do mais novo ao mais antigo, com o total e o número de páginas', () => {
    const p1 = paginarCasos(muitos, { pagina: 1, status: null })
    expect(p1).toMatchObject({ total: 25, pagina: 1, paginas: 3 })
    expect(p1.itens).toHaveLength(10)
    expect(p1.itens[0]!.protocolo).toBe('P-s24')
    const p3 = paginarCasos(muitos, { pagina: 3, status: null })
    expect(p3.itens.map((c) => c.protocolo)).toEqual(['P-s04', 'P-s03', 'P-s02', 'P-s01', 'P-s00'])
  })

  it('no mesmo minuto, o protocolo maior (o mais novo) vem primeiro', () => {
    const mesmoMinuto = ['P-0003', 'P-0010', 'P-0007'].map((protocolo, i) => caso(`m${i}`, { protocolo }))
    expect(paginarCasos(mesmoMinuto, { pagina: 1, status: null }).itens.map((c) => c.protocolo)).toEqual(['P-0010', 'P-0007', 'P-0003'])
  })

  it('filtra por status antes de paginar', () => {
    const r = paginarCasos(muitos, { pagina: 1, status: 'resolvido' })
    expect(r).toMatchObject({ total: 5, paginas: 1 })
    expect(r.itens.every((c) => c.status === 'resolvido')).toBe(true)
  })

  it('página fora do intervalo vira a mais próxima; lista vazia tem uma página vazia', () => {
    expect(paginarCasos(muitos, { pagina: 99, status: null }).pagina).toBe(3)
    expect(paginarCasos(muitos, { pagina: 0, status: null }).pagina).toBe(1)
    expect(paginarCasos([], { pagina: 2, status: null })).toEqual({ itens: [], total: 0, pagina: 1, paginas: 1 })
  })
})

describe('sentimento estimado', () => {
  it('golpe ou vulnerável: preocupado, mesmo com reclamação na mesma conversa', () => {
    expect(inferirSentimento([resposta('s', { acao: 'seguranca_imediata', motivos: ['GOLPE_CREDENCIAL'] })])).toBe('preocupado')
    expect(inferirSentimento([resposta('s', { motivos: ['VULNERAVEL_PRESSAO'] }), resposta('s', { motivos: ['RECLAMACAO'] })])).toBe('preocupado')
  })

  it('reclamação ou cancelamento: insatisfeito, mesmo que a Kaki não tenha entendido', () => {
    expect(inferirSentimento([resposta('s', { acao: 'protocolo', motivos: ['RECLAMACAO'] })])).toBe('insatisfeito')
    expect(inferirSentimento([resposta('s', { naoEntendeu: true }), resposta('s', { motivos: ['CANCELAMENTO'] })])).toBe('insatisfeito')
  })

  it('um "não entendi" ou conversa travada: frustrado', () => {
    expect(inferirSentimento([resposta('s'), resposta('s', { naoEntendeu: true, comFonte: false })])).toBe('frustrado')
    expect(inferirSentimento([resposta('s', { acao: 'encaminhar_humano', motivos: ['PASSOS_MAX'] })])).toBe('frustrado')
  })

  it('respondida pela Kaki com fonte e sem escalonar: satisfeito; sem fonte nenhuma não conta', () => {
    expect(inferirSentimento([resposta('s'), resposta('s', { comFonte: false })])).toBe('satisfeito')
    expect(inferirSentimento([resposta('s', { comFonte: false })])).toBe('neutro')
  })

  it('pediu uma pessoa ou especialista, sem outro sinal: neutro', () => {
    expect(inferirSentimento([resposta('s', { acao: 'encaminhar_humano', motivos: ['HUMANO_PEDIDO'] })])).toBe('neutro')
    expect(inferirSentimento([resposta('s', { acao: 'encaminhar_especialista', motivos: ['RECOMENDACAO_PRODUTO'] })])).toBe('neutro')
  })

  it('distribui por conversa, e não por mensagem, sempre nas cinco categorias e na mesma ordem, positivo primeiro', () => {
    const d = distribuirSentimentos([
      resposta('a'), resposta('a'), resposta('a'),
      resposta('b', { acao: 'seguranca_imediata', motivos: ['GOLPE_RELATO'] }),
    ])
    expect(d.conversas).toBe(2)
    expect(d.categorias.map((x) => [x.chave, x.total, x.pct])).toEqual([['satisfeito', 1, 50], ['neutro', 0, 0], ['preocupado', 1, 50], ['insatisfeito', 0, 0], ['frustrado', 0, 0]])
    expect(d.categorias[2]!.criterio).toBe('Sinal de golpe ou de cliente vulnerável')
  })

  it('agrupa em positivo, neutro e negativo, nessa ordem, para a barra', () => {
    const d = distribuirSentimentos([
      resposta('a'),
      resposta('b', { acao: 'seguranca_imediata', motivos: ['GOLPE_RELATO'] }),
      resposta('c', { acao: 'protocolo', motivos: ['RECLAMACAO'] }),
      resposta('d', { acao: 'encaminhar_humano', motivos: ['HUMANO_PEDIDO'] }),
    ])
    expect(d.polaridades.map((p) => [p.chave, p.total, p.pct])).toEqual([['positivo', 1, 25], ['neutro', 1, 25], ['negativo', 2, 50]])
  })

  it('sem conversa, tudo zerado e as categorias continuam lá', () => {
    const d = distribuirSentimentos([])
    expect(d.conversas).toBe(0)
    expect([...d.categorias, ...d.polaridades].every((x) => x.total === 0 && x.pct === 0)).toBe(true)
    expect(d.polaridades).toHaveLength(3)
  })
})
