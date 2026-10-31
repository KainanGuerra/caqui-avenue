import { describe, expect, it } from 'vitest'
import { dados, em } from '../testing/fixtures'
import type { Caso } from './case-summary'
import { casosDoCliente, montarAtendimento, perguntasFrequentes, PERGUNTA_ESPECIALISTA } from './support-view'

const caso = (p: Partial<Caso>): Caso => ({
  id: p.protocolo ?? 'x', protocolo: 'P-0001', sessaoId: 's', clienteId: 'C-0001', clienteNome: 'Marta', idade: 63, cpfMascarado: '***.***.000-**',
  acao: 'encaminhar_humano', motivos: ['HUMANO_PEDIDO'], prioridade: 1, risco: 'medio', status: 'aberto', atendente: null,
  criadoEm: '2026-11-18T10:00', atualizadoEm: '2026-11-18T10:00', resumo: [], fontes: [], ...p,
})
const atendimento = (iso: string, casos: Caso[] = []) => montarAtendimento({ momento: em(iso), kb: dados.kb, casos, clienteId: 'C-0001' })

describe('estado da página de Atendimento (regra 12)', () => {
  it('às 14h há pessoa agora e não há retorno a anunciar', () => {
    const v = atendimento('2026-11-18T14:00-03:00')
    expect(v.humanoDisponivel).toBe(true)
    expect(v.retorno).toBeNull()
    expect(v.horario).toBe('das 8h às 20h')
  })

  it('às 23h não há pessoa e o retorno é amanhã a partir das 8h', () => {
    const v = atendimento('2026-11-18T23:00-03:00')
    expect(v.humanoDisponivel).toBe(false)
    expect(v.retorno).toBe('amanhã a partir das 8h')
  })

  it.each([
    ['2026-11-18T07:59-03:00', false],
    ['2026-11-18T08:00-03:00', true],
    ['2026-11-18T19:59-03:00', true],
    ['2026-11-18T20:00-03:00', false],
  ])('%s -> pessoa agora: %s', (iso, esperado) => {
    expect(atendimento(iso).humanoDisponivel).toBe(esperado)
  })
})

describe('perguntas frequentes com fonte da base atual', () => {
  it('"Quando cai meu resgate?" resolve para a KB-006, nunca para a KB-007 antiga', () => {
    const faq = perguntasFrequentes(dados.kb)
    expect(faq.find((f) => f.pergunta === 'Quando cai meu resgate?')?.kbId).toBe('KB-006')
    expect(faq.map((f) => f.kbId)).not.toContain('KB-007')
  })

  it('as três têm fonte', () => {
    expect(perguntasFrequentes(dados.kb).map(({ pergunta, kbId }) => ({ pergunta, kbId }))).toEqual([
      { pergunta: 'Quando cai meu resgate?', kbId: 'KB-006' },
      { pergunta: 'Qual a diferença entre rentabilidade bruta e líquida?', kbId: 'KB-009' },
      { pergunta: 'O CDB tem garantia?', kbId: 'KB-013' },
    ])
  })

  it('a resposta abre na página: cada pergunta traz o artigo da própria fonte', () => {
    for (const f of perguntasFrequentes(dados.kb)) {
      expect(f.artigo?.id, f.pergunta).toBe(f.kbId)
      expect(f.artigo?.blocos.length, f.pergunta).toBeGreaterThan(0)
    }
    const resgate = perguntasFrequentes(dados.kb)[0]!.artigo!
    expect(resgate.titulo).toBe(dados.kb.find((a) => a.id === 'KB-006')!.titulo)
  })

  it('mesmo sem a KB-006 na base, a busca não cai na KB-007 antiga', () => {
    const semKb006 = dados.kb.filter((a) => a.id !== 'KB-006')
    expect(perguntasFrequentes(semKb006)[0]!.kbId).not.toBe('KB-007')
  })

  it('onde investir aponta para o artigo de recomendação que existe nos dados', () => {
    expect(atendimento('2026-11-18T14:00-03:00').especialista).toEqual({ pergunta: PERGUNTA_ESPECIALISTA, kbId: 'KB-029' })
    const semKb029 = montarAtendimento({ momento: em('2026-11-18T14:00-03:00'), kb: dados.kb.filter((a) => a.id !== 'KB-029'), casos: [], clienteId: 'C-0001' })
    expect(semKb029.especialista.kbId).not.toBe('KB-029')
  })
})

describe('minhas conversas', () => {
  it('sem casos, lista vazia', () => {
    expect(atendimento('2026-11-18T14:00-03:00').casos).toEqual([])
  })

  it('só os casos da própria pessoa, do mais novo para o mais antigo, com motivo legível e status', () => {
    const casos = [
      caso({ protocolo: 'P-0001', criadoEm: '2026-11-17T20:12', status: 'resolvido', motivos: ['HUMANO_PEDIDO'] }),
      caso({ protocolo: 'P-0002', clienteId: 'C-0002', criadoEm: '2026-11-18T09:00' }),
      caso({ protocolo: 'P-0003', criadoEm: '2026-11-18T09:30', status: 'assumido', motivos: ['FORA_HORARIO'] }),
    ]
    expect(casosDoCliente(casos, 'C-0001')).toEqual([
      { protocolo: 'P-0003', motivo: 'fora do horário do atendimento humano', criadoEm: '2026-11-18T09:30', status: 'em_andamento' },
      { protocolo: 'P-0001', motivo: 'pediu falar com uma pessoa', criadoEm: '2026-11-17T20:12', status: 'respondido' },
    ])
  })

  it('nenhum dado sensível do caso vai para a tela', () => {
    const v = atendimento('2026-11-18T14:00-03:00', [caso({ resumo: ['Marta, 63 anos'] })])
    // Só os casos: os artigos da base são públicos e citam "CPF" como orientação.
    expect(JSON.stringify(v.casos)).not.toMatch(/cpf|\*\*\*\.|resumo|63 anos/i)
    expect(Object.keys(v.casos[0]!).sort()).toEqual(['criadoEm', 'motivo', 'protocolo', 'status'])
  })
})
