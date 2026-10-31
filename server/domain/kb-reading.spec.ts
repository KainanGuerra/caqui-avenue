import { describe, expect, it } from 'vitest'
import { dados } from '../testing/fixtures'
import { artigoAtual, artigoParaLeitura, trechos } from './kb-reading'

const artigo = (corpo: string) => artigoParaLeitura({ id: 'KB-X', titulo: 'T', revisadoEm: '2026-01-01', corpo })

describe('artigo da base para leitura na tela', () => {
  it('negrito vira trecho forte', () => {
    expect(trechos('Horário de **corte: 16h**.')).toEqual([
      { texto: 'Horário de ', forte: false }, { texto: 'corte: 16h', forte: true }, { texto: '.', forte: false },
    ])
  })

  it('tira o título "# ...", que repete o título do artigo', () => {
    expect(artigo('# T\n\nTexto.').blocos).toEqual([{ tipo: 'paragrafo', trechos: [{ texto: 'Texto.', forte: false }] }])
  })

  it('KB-006: parágrafo de corte, lista de prazos e nota do calendário', () => {
    const a = artigoAtual(dados.kb, 'KB-006')!
    expect(a.blocos.map((b) => b.tipo)).toEqual(['paragrafo', 'lista', 'paragrafo'])
    const lista = a.blocos[1] as { ordenada: boolean; itens: unknown[] }
    expect(lista.ordenada).toBe(false)
    expect(lista.itens).toHaveLength(5)
  })

  it('KB-020: passos numerados viram lista ordenada', () => {
    const a = artigoAtual(dados.kb, 'KB-020')!
    expect(a.blocos[0]).toMatchObject({ tipo: 'lista', ordenada: true })
    expect((a.blocos[0] as { itens: unknown[] }).itens).toHaveLength(3)
  })

  it('KB-010: a tabela de alíquotas vira cabeçalho e linhas', () => {
    const tabela = artigoAtual(dados.kb, 'KB-010')!.blocos.find((b) => b.tipo === 'tabela')
    expect(tabela).toEqual({
      tipo: 'tabela', cabecalho: ['Prazo', 'Alíquota'],
      linhas: [['Até 180 dias', '22,5%'], ['De 181 a 360 dias', '20%'], ['De 361 a 720 dias', '17,5%'], ['Acima de 720 dias', '15%']],
    })
  })

  it('linha de texto colada aos itens vira parágrafo e lista, não um parágrafo com " - " no meio', () => {
    expect(artigo('Atendimento:\n- Chat 24h\n- Telefone').blocos).toEqual([
      { tipo: 'paragrafo', trechos: [{ texto: 'Atendimento:', forte: false }] },
      { tipo: 'lista', ordenada: false, itens: [[{ texto: 'Chat 24h', forte: false }], [{ texto: 'Telefone', forte: false }]] },
    ])
    expect(artigoAtual(dados.kb, 'KB-001')!.blocos.map((b) => b.tipo)).toContain('lista')
  })

  it('nenhum marcador de markdown sobra no texto de nenhum artigo', () => {
    for (const a of dados.kb) {
      const blocos = artigoParaLeitura(a).blocos
      expect(JSON.stringify(blocos), a.id).not.toMatch(/\*\*|"# |"- /)
      const paragrafos = blocos.flatMap((b) => (b.tipo === 'paragrafo' ? [b.trechos.map((t) => t.texto).join('')] : []))
      for (const p of paragrafos) expect(p, a.id).not.toMatch(/(^|\s)(-|\d+\.)\s+\S/)
    }
  })

  it('a KB-007 antiga não sai nem pedida pelo id', () => {
    expect(artigoAtual(dados.kb, 'KB-007')).toBeNull()
    expect(artigoAtual(dados.kb, 'KB-999')).toBeNull()
  })
})
