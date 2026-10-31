import { desatualizado } from './kb-search'
import type { ArtigoKb } from './types'

/** Pedaço de texto; `forte` é o que vem entre ** na base. */
export type Trecho = { texto: string; forte: boolean }
export type BlocoArtigo =
  | { tipo: 'paragrafo'; trechos: Trecho[] }
  | { tipo: 'lista'; ordenada: boolean; itens: Trecho[][] }
  | { tipo: 'tabela'; cabecalho: string[]; linhas: string[][] }

export type ArtigoLeitura = { id: string; titulo: string; revisadoEm: string; blocos: BlocoArtigo[] }

const ITEM_LISTA = /^(-|\d+\.)\s+/
const LINHA_TABELA = /^\|.*\|$/
const SEPARADOR_TABELA = /^\|[\s:|-]+\|$/

export function trechos(linha: string): Trecho[] {
  return linha.split(/(\*\*[^*]+\*\*)/).filter(Boolean).map((p) => (p.startsWith('**') && p.endsWith('**') ? { texto: p.slice(2, -2), forte: true } : { texto: p, forte: false }))
}

const celulas = (linha: string) => linha.slice(1, -1).split('|').map((c) => c.trim())

// Dentro de um grupo, linhas seguidas de texto viram um parágrafo e itens seguidos viram uma lista: a base às vezes põe
// "Atendimento:" logo acima dos itens, sem linha em branco.
function blocosDoGrupo(linhas: string[]): BlocoArtigo[] {
  if (linhas.length >= 2 && linhas.every((l) => LINHA_TABELA.test(l)) && SEPARADOR_TABELA.test(linhas[1]!)) {
    return [{ tipo: 'tabela', cabecalho: celulas(linhas[0]!), linhas: linhas.slice(2).map(celulas) }]
  }
  const blocos: BlocoArtigo[] = []
  let texto: string[] = []
  const fecharParagrafo = () => {
    if (texto.length) blocos.push({ tipo: 'paragrafo', trechos: trechos(texto.join(' ')) })
    texto = []
  }
  for (const linha of linhas) {
    if (!ITEM_LISTA.test(linha)) { texto.push(linha); continue }
    fecharParagrafo()
    const ordenada = /^\d+\./.test(linha)
    const item = trechos(linha.replace(ITEM_LISTA, ''))
    const ultimo = blocos.at(-1)
    if (ultimo?.tipo === 'lista' && ultimo.ordenada === ordenada) ultimo.itens.push(item)
    else blocos.push({ tipo: 'lista', ordenada, itens: [item] })
  }
  fecharParagrafo()
  return blocos
}

// A tela recebe estrutura, não markdown: assim ela não precisa de v-html e o texto da base não vira HTML no navegador.
// O título "# ..." repete o título do artigo e sai.
export function artigoParaLeitura(artigo: ArtigoKb): ArtigoLeitura {
  const blocos = artigo.corpo.split(/\n\s*\n/).flatMap((grupo) =>
    blocosDoGrupo(grupo.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('# '))))
  return { id: artigo.id, titulo: artigo.titulo, revisadoEm: artigo.revisadoEm, blocos }
}

/** Artigo atual pelo id; o antigo (KB-007) nunca sai, nem pedido pelo id. */
export function artigoAtual(kb: ArtigoKb[], id: string): ArtigoLeitura | null {
  const a = kb.find((x) => x.id === id)
  return a && !desatualizado(a) ? artigoParaLeitura(a) : null
}
