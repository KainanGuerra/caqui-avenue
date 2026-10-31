import { normalizar } from './normalize'
import type { Acao, Cliente, Posicao, ProdutoTaxa } from './types'

export type Perfil = 'idoso' | 'iniciante' | 'experiente' | 'padrao'

export type ContextoSugestao = {
  cliente: Pick<Cliente, 'idade' | 'origem' | 'clienteDesde'>
  posicoes: Pick<Posicao, 'produto'>[]
  produtos: Pick<ProdutoTaxa, 'codigo' | 'tributavel' | 'tipo'>[]
  /** Ação da última resposta do agente nesta conversa. */
  ultimaAcao: Acao | null
  ultimasIntencoes: string[]
  ultimoProduto: string | null
  /** Um atendente está na conversa: o chat é com ele e não há sugestões. */
  humanoAssumiu: boolean
  /** O que o cliente já digitou e ainda não enviou. */
  rascunho: string
  /** Data de hoje (AAAA-MM-DD), para separar clientes novos dos antigos. */
  hoje: string
}

export type Sugestoes = { perfil: Perfil; sugestoes: string[]; porDigitacao: boolean }

// Como se refere a cada produto numa pergunta que o motor entende (os apelidos são os de slots.ts).
const FRASE: Record<string, { art: 'o' | 'a' | 'as'; nome: string }> = {
  'CDB-LD-110': { art: 'o', nome: 'CDB 110' }, 'CDB-LD-100': { art: 'o', nome: 'CDB 100' }, 'CDB-LD-85': { art: 'o', nome: 'CDB 85' }, 'CDB-2A-120': { art: 'o', nome: 'CDB 120' },
  'LCI-90D-92': { art: 'a', nome: 'LCI' }, 'LCA-1A-95': { art: 'a', nome: 'LCA' }, 'FUNDO-RF-01': { art: 'o', nome: 'fundo de renda fixa' },
  'FUNDO-MM-01': { art: 'o', nome: 'multimercado' }, 'TESOURO-SELIC-2029': { art: 'o', nome: 'Tesouro Selic' }, ACOES: { art: 'as', nome: 'ações' },
}
const DE = { o: 'do', a: 'da', as: 'das' } as const

const DIAS_CLIENTE_NOVO = 180

export function perfilDe(c: ContextoSugestao): Perfil {
  if (c.cliente.idade >= 60) return 'idoso'
  const dias = (Date.parse(c.hoje) - Date.parse(c.cliente.clienteDesde)) / 86_400_000
  if (c.cliente.origem === 'parceria_varejista' || c.posicoes.length === 0 || dias < DIAS_CLIENTE_NOVO) return 'iniciante'
  return c.posicoes.length >= 2 ? 'experiente' : 'padrao'
}

type Peso = Record<Perfil, number>
type Candidata = { texto: string; palavras: string[]; peso: Peso; contexto?: (c: ContextoSugestao) => number }
const peso = (idoso: number, iniciante: number, experiente: number, padrao: number): Peso => ({ idoso, iniciante, experiente, padrao })
const cand = (texto: string, tags: string, p: Peso, contexto?: Candidata['contexto']): Candidata => ({
  texto, palavras: normalizar(`${texto} ${tags}`).split(' ').filter((w) => w.length >= 2), peso: p, contexto,
})

const interessa = (c: ContextoSugestao, ...ints: string[]) => (ints.some((i) => c.ultimasIntencoes.includes(i)) ? 6 : 0)

function candidatas(c: ContextoSugestao): Candidata[] {
  // Pedir uma pessoa não é sugestão: ela aparece na resposta quando a Kaki não resolve (D17); digitar o pedido continua valendo.
  const lista: Candidata[] = [
    cand('Como sei se uma ligação ou mensagem é golpe?', 'seguranca fraude senha codigo gerente', peso(8, 6, 2, 3), (x) => (x.ultimaAcao === 'seguranca_imediata' ? 8 : 0)),
    cand('Como bloqueio meu acesso?', 'seguranca golpe bloquear aparelho', peso(0, 0, 0, 0), (x) => (x.ultimaAcao === 'seguranca_imediata' ? 10 : 0)),
    cand('O gerente me ligou pedindo o código do SMS', 'golpe senha token seguranca', peso(0, 0, 0, 0)),
    cand('O que é liquidez diária?', 'conceito resgate prazo', peso(4, 9, 1, 2), (x) => interessa(x, 'conceito', 'garantia')),
    cand('O que é um CDB?', 'conceito renda fixa', peso(5, 9, 0, 1), (x) => (x.ultimaAcao === 'encaminhar_especialista' ? 8 : 0)),
    cand('O que é CDI?', 'conceito rendimento taxa', peso(1, 6, 1, 1)),
    cand('Esse CDB tem garantia?', 'fgc seguro protegido dinheiro', peso(7, 7, 1, 2), (x) => interessa(x, 'conceito')),
    cand('Qual a diferença entre CDB e LCI?', 'conceito produtos lca', peso(1, 4, 2, 3), (x) => (x.ultimaAcao === 'encaminhar_especialista' ? 8 : interessa(x, 'conceito', 'garantia'))),
    cand('Vocês têm previdência privada?', 'produtos oferecem cripto seguro consorcio', peso(1, 3, 0, 1)),
    cand('Qual o horário de corte para resgate de CDB?', 'prazo resgate liquidacao hora', peso(3, 4, 5, 5), (x) => interessa(x, 'prazo_resgate')),
    cand('Como acompanho um resgate?', 'prazo dinheiro cai acompanhar status', peso(7, 5, 2, 3)),
    cand('Posso transferir para a conta de outra pessoa?', 'pix titularidade transferencia', peso(6, 1, 0, 1)),
    cand('Qual a taxa da poupança hoje?', 'rendimento comparar', peso(0, 1, 4, 3), (x) => interessa(x, 'comparar_poupanca')),
    cand('Onde vejo meu informe de rendimentos?', 'imposto declaracao documentos', peso(1, 1, 4, 3), (x) => interessa(x, 'imposto')),
    cand('Qual é o meu CPF?', 'documento cadastro dados', peso(0, 0, 0, 0)),
    cand('Como faço a troca de senha?', 'trocar aparelho celular acesso', peso(1, 1, 1, 1)),
    cand('Tenho R$ 50 mil parados, onde eu coloco?', 'investir recomendacao dinheiro heranca', peso(0, 2, 0, 0)),
    cand('Quero fazer uma reclamação', 'reclamar queixa problema', peso(0, 0, 0, 0)),
    cand('Quero encerrar minha conta', 'cancelar fechar', peso(0, 0, 0, 0)),
    cand('Qual o prazo de resposta do meu protocolo?', 'acompanhar atendimento retorno', peso(0, 0, 0, 0), (x) => (x.ultimaAcao === 'encaminhar_humano' || x.ultimaAcao === 'protocolo' || x.ultimaAcao === 'encaminhar_especialista' ? 9 : 0)),
  ]

  // Perguntas sobre o que o próprio cliente tem na conta.
  const meus = [...new Set(c.posicoes.map((p) => p.produto))]
  for (const cod of meus) {
    const f = FRASE[cod]
    if (!f) continue
    const prod = c.produtos.find((p) => p.codigo === cod)
    const atual = c.ultimoProduto === cod
    lista.push(cand(`Quando cai o resgate ${DE[f.art]} ${f.nome} se eu pedir hoje às 15h?`, `prazo liquidacao ${cod}`, peso(3, 4, 7, 6), (x) => (atual ? 3 : 0) + interessa(x, 'imposto')))
    if (prod?.tributavel && prod.tipo !== 'ACOES') {
      lista.push(cand(`Qual a alíquota de IR se eu resgatar ${f.art} ${f.nome} hoje?`, `imposto aliquota ${cod}`, peso(1, 2, 7, 6), (x) => (atual ? 5 : 0) + interessa(x, 'prazo_resgate')))
    }
  }
  if (meus.some((m) => m.startsWith('CDB'))) {
    lista.push(cand('Meu CDB rendeu menos que a poupança?', 'comparar rendimento lucro', peso(2, 3, 8, 7), (x) => interessa(x, 'imposto', 'prazo_resgate')))
  }
  return lista
}

const raiz = (p: string) => p.slice(0, 6)

// O quanto a candidata combina com o que o cliente está digitando: cada palavra digitada vale um ponto se abre alguma
// palavra da sugestão (ou tem a mesma raiz); começar exatamente como o texto digitado vale mais.
function combinacao(cand: Candidata, rascunho: string): number {
  const digitado = normalizar(rascunho)
  if (digitado.length < 2) return 0
  let pontos = 0
  for (const t of digitado.split(' ').filter((w) => w.length >= 2)) {
    if (cand.palavras.some((w) => w.startsWith(t) || (t.length >= 5 && raiz(w) === raiz(t)))) pontos++
  }
  if (normalizar(cand.texto).startsWith(digitado)) pontos += 3
  return pontos
}

export function sugerir(c: ContextoSugestao, max = 5): Sugestoes {
  const perfil = perfilDe(c)
  if (c.humanoAssumiu) return { perfil, sugestoes: [], porDigitacao: false }
  const todas = candidatas(c).map((x) => ({ x, base: x.peso[perfil] + (x.contexto?.(c) ?? 0), match: combinacao(x, c.rascunho) }))
  const digitando = normalizar(c.rascunho).length >= 2
  const casadas = todas.filter((t) => t.match > 0)
  const usar = digitando && casadas.length ? casadas : todas.filter((t) => t.base > 0)
  const porDigitacao = digitando && casadas.length > 0
  const ordenadas = usar.sort((a, b) => (porDigitacao ? b.match * 10 + b.base - (a.match * 10 + a.base) : b.base - a.base) || a.x.texto.localeCompare(b.x.texto))
  return { perfil, sugestoes: [...new Set(ordenadas.map((t) => t.x.texto))].slice(0, max), porDigitacao }
}
