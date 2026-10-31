import { describe, expect, it } from 'vitest'
import { dados } from '../testing/fixtures'
import { perfilDe, sugerir, type ContextoSugestao } from './suggestions'

const HOJE = '2026-11-18'
const contexto = (clienteId: string, extra: Partial<ContextoSugestao> = {}): ContextoSugestao => {
  const conta = dados.dadosDoCliente(clienteId)!
  return {
    cliente: conta.cliente, posicoes: conta.posicoes, produtos: dados.taxas.produtos, ultimaAcao: null, ultimasIntencoes: [],
    ultimoProduto: null, humanoAssumiu: false, rascunho: '', hoje: HOJE, ...extra,
  }
}

describe('perfil do cliente', () => {
  it('Dona Marta (63) é idoso; Rafael tem vários produtos e é experiente; clientes da parceria são iniciantes', () => {
    expect(perfilDe(contexto('C-0001'))).toBe('idoso')
    expect(perfilDe(contexto('C-0002'))).toBe('experiente')
    const parceria = [...dados.clientes.values()].find((c) => c.origem === 'parceria_varejista' && c.idade < 60)!
    expect(perfilDe(contexto(parceria.id))).toBe('iniciante')
  })

  it('cliente sem nenhuma posição é iniciante', () => {
    expect(perfilDe({ ...contexto('C-0002'), posicoes: [] })).toBe('iniciante')
  })
})

describe('sugestões pelo tipo de cliente', () => {
  it('idoso recebe segurança primeiro, em linguagem simples', () => {
    const s = sugerir(contexto('C-0001')).sugestoes
    expect(s[0]).toBe('Como sei se uma ligação ou mensagem é golpe?')
    expect(s.join(' ')).not.toMatch(/alíquota/)
  })

  it('experiente recebe perguntas técnicas sobre os próprios produtos', () => {
    const s = sugerir(contexto('C-0002')).sugestoes.join(' | ')
    expect(s).toMatch(/alíquota de IR se eu resgatar o/)
    expect(s).toMatch(/Quando cai o resgate d/)
    expect(s).not.toMatch(/O que é um CDB/)
  })

  it('iniciante recebe conceitos básicos', () => {
    const s = sugerir({ ...contexto('C-0002'), posicoes: [] }).sugestoes
    expect(s.slice(0, 3)).toEqual(expect.arrayContaining(['O que é liquidez diária?', 'O que é um CDB?']))
  })

  it('só sugere o IR de um produto que o cliente tem e que paga imposto', () => {
    const s = sugerir(contexto('C-0001'), 20).sugestoes.join(' | ')
    expect(s).toContain('CDB 110')
    expect(s).toContain('LCI')
    expect(s).not.toMatch(/alíquota de IR se eu resgatar o LCI/) // LCI é isenta
  })

  it('sem CDB na conta, não sugere comparar com a poupança', () => {
    const c = contexto('C-0002', { posicoes: [{ produto: 'ACOES' }] })
    expect(sugerir(c, 20).sugestoes.join(' | ')).not.toContain('rendeu menos que a poupança')
  })

  it('concorda o artigo com o produto (do CDB, da LCI, das ações)', () => {
    const s = sugerir(contexto('C-0001'), 20).sugestoes.join(' | ')
    expect(s).toContain('resgate do CDB 110')
    expect(s).toContain('resgate da LCI')
    const acoes = sugerir(contexto('C-0002'), 30).sugestoes.join(' | ')
    expect(acoes).toContain('resgate das ações')
    expect(acoes).not.toMatch(/alíquota de IR se eu resgatar as ações/)
  })

  it('nunca passa de cinco e não repete', () => {
    const s = sugerir(contexto('C-0002')).sugestoes
    expect(s.length).toBeLessThanOrEqual(5)
    expect(new Set(s).size).toBe(s.length)
  })
})

describe('sugestões pelo que a pessoa digita', () => {
  it.each([
    ['golp', 'Como sei se uma ligação ou mensagem é golpe?'],
    ['imposto', 'Qual a alíquota de IR se eu resgatar o'],
    ['poup', 'Qual a taxa da poupança hoje?'],
    ['encerr', 'Quero encerrar minha conta'],
    ['reclam', 'Quero fazer uma reclamação'],
    ['sms', 'O gerente me ligou pedindo o código do SMS'],
    ['resgate', 'Quando cai o resgate d'],
  ])('digitar "%s" traz uma sugestão que combina', (digitado, esperado) => {
    const r = sugerir(contexto('C-0002', { rascunho: digitado }), 8)
    expect(r.porDigitacao).toBe(true)
    expect(r.sugestoes.some((x) => x.includes(esperado))).toBe(true)
  })

  it('aceita acento e caixa diferentes', () => {
    expect(sugerir(contexto('C-0002', { rascunho: 'ALÍQUOTA' })).sugestoes[0]).toContain('alíquota')
  })

  it('o que começa igual ao digitado vem primeiro', () => {
    expect(sugerir(contexto('C-0002', { rascunho: 'quero enc' })).sugestoes[0]).toBe('Quero encerrar minha conta')
  })

  it('digitação sem correspondência volta às sugestões do perfil', () => {
    const r = sugerir(contexto('C-0001', { rascunho: 'zzzz' }))
    expect(r.porDigitacao).toBe(false)
    expect(r.sugestoes).toEqual(sugerir(contexto('C-0001')).sugestoes)
  })

  it('uma letra só não filtra nada', () => {
    expect(sugerir(contexto('C-0002', { rascunho: 'q' })).porDigitacao).toBe(false)
  })
})

describe('sugestões pela conversa', () => {
  it('depois de um golpe, ensina a bloquear o acesso', () => {
    expect(sugerir(contexto('C-0002', { ultimaAcao: 'seguranca_imediata' })).sugestoes[0]).toBe('Como bloqueio meu acesso?')
  })

  it('depois de falar de prazo de um produto, sugere o IR desse mesmo produto primeiro', () => {
    const c = contexto('C-0002', { ultimasIntencoes: ['prazo_resgate'], ultimoProduto: 'CDB-LD-100' })
    expect(sugerir(c).sugestoes[0]).toContain('alíquota de IR se eu resgatar o CDB 100')
  })

  it('depois de encaminhar a um especialista, oferece conceitos e o prazo do protocolo', () => {
    const s = sugerir(contexto('C-0003', { ultimaAcao: 'encaminhar_especialista' })).sugestoes
    expect(s).toContain('Qual o prazo de resposta do meu protocolo?')
    expect(s.some((x) => x.startsWith('O que é um CDB') || x.startsWith('Qual a diferença'))).toBe(true)
  })

  it('nenhuma sugestão pede uma pessoa, em nenhum perfil, contexto ou digitação (D17)', () => {
    const acoes = [null, 'responder', 'encaminhar_humano', 'protocolo', 'seguranca_imediata', 'encaminhar_especialista'] as const
    for (const id of ['C-0001', 'C-0002', 'C-0003']) {
      for (const ultimaAcao of acoes) {
        for (const rascunho of ['', 'quero falar', 'pessoa', 'atendente', 'humano']) {
          const s = sugerir(contexto(id, { ultimaAcao, rascunho }), 30).sugestoes.join(' | ')
          expect(s, `${id} ${ultimaAcao} "${rascunho}"`).not.toMatch(/uma pessoa|falar com|atendente|humano/i)
        }
      }
    }
  })

  it('com atendente na conversa não há sugestões', () => {
    expect(sugerir(contexto('C-0002', { humanoAssumiu: true })).sugestoes).toEqual([])
  })
})
