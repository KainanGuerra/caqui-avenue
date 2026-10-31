import { normalizar } from './normalize'
import type { ArtigoKb } from './types'

export type Achado = { artigo: ArtigoKb; score: number; termos: number }
export type Busca = { achados: Achado[]; descartados: ArtigoKb[] }

const STOP = new Set(['a', 'o', 'as', 'os', 'um', 'uma', 'de', 'da', 'do', 'das', 'dos', 'e', 'em', 'no', 'na', 'nos', 'nas', 'que', 'qual', 'quais',
  'como', 'para', 'pra', 'por', 'com', 'se', 'eu', 'meu', 'minha', 'me', 'ou', 'ao', 'esse', 'essa', 'tem', 'ter', 'sao', 'foi', 'ser', 'mais',
  'mas', 'ja', 'hoje', 'voces', 'vcs', 'tenho', 'quero', 'pode', 'posso', 'qualquer', 'caqui', 'isso', 'esta', 'estao'])

// Raiz grosseira: as seis primeiras letras juntam resgate/resgatar, liquidez/liquidacao, previdencia/previdenc.
const raiz = (p: string) => p.slice(0, 6)
const tokens = (t: string) => normalizar(t).split(' ').filter((p) => p.length > 2 && !STOP.has(p)).map(raiz)

// Artigo marcado como antigo nunca responde: o case traz de propósito um artigo desatualizado (KB-007).
export const desatualizado = (a: ArtigoKb): boolean => /versao antiga/.test(normalizar(a.titulo)) || /nao foi atualizado/.test(normalizar(a.corpo))

// Com intenção informativa reconhecida (conceito, garantia, corte...) basta um acerto razoável; pergunta livre exige acerto forte.
export const LIMIAR_INFORMATIVO = 3
export const LIMIAR_LIVRE = 9

// Busca léxica estilo BM25 com título pesando mais. Desempate pela revisão mais recente.
export function buscar(kb: ArtigoKb[], pergunta: string, max = 3): Busca {
  const validos = kb.filter((a) => !desatualizado(a))
  const descartados = kb.filter(desatualizado)
  const q = [...new Set(tokens(pergunta))]
  if (!q.length) return { achados: [], descartados }

  const docs = validos.map((a) => {
    const titulo = tokens(a.titulo)
    const corpo = tokens(a.corpo)
    return { a, titulo: new Set(titulo), contagem: contar([...titulo, ...titulo, ...titulo, ...corpo]), tamanho: titulo.length * 3 + corpo.length }
  })
  const media = docs.reduce((s, d) => s + d.tamanho, 0) / (docs.length || 1)
  const df = new Map<string, number>()
  for (const t of q) df.set(t, docs.filter((d) => d.contagem.has(t)).length)

  const achados = docs.map((d) => {
    let score = 0
    let termos = 0
    for (const t of q) {
      const f = d.contagem.get(t) ?? 0
      if (!f) continue
      termos++
      const idf = Math.log(1 + (docs.length - df.get(t)! + 0.5) / (df.get(t)! + 0.5))
      score += idf * idf * ((f * 2.2) / (f + 1.2 * (0.25 + 0.75 * (d.tamanho / media))))
      if (d.titulo.has(t)) score += idf * idf * 0.5
    }
    return { artigo: d.a, score, termos }
  }).filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score || (y.artigo.revisadoEm > x.artigo.revisadoEm ? 1 : -1))
  return { achados: achados.slice(0, max), descartados }
}

function contar(ts: string[]): Map<string, number> {
  const m = new Map<string, number>()
  for (const t of ts) m.set(t, (m.get(t) ?? 0) + 1)
  return m
}

/** Melhor artigo só se passar do limiar; abaixo disso o agente diz que não sabe (regra 9). */
export function melhorArtigo(kb: ArtigoKb[], pergunta: string, intencaoInformativa = false): Achado | null {
  const [top] = buscar(kb, pergunta, 1).achados
  const limiar = intencaoInformativa ? LIMIAR_INFORMATIVO : LIMIAR_LIVRE
  // Pergunta livre com um único termo em comum ("de novo" casando com "aparelho novo") não basta.
  if (top && !intencaoInformativa && top.termos < 2) return null
  return top && top.score >= limiar ? top : null
}
