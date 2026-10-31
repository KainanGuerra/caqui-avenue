import { rotuloMotivo, type Caso, type StatusCaso } from './case-summary'
import type { Acao } from './types'

// Números do painel do gerente: a Kaki desde que o servidor subiu. Funções puras: recebem registros e devolvem contagens prontas, a tela só exibe.

export type Contagem = { chave: string; rotulo: string; total: number; pct: number }

/** Como saiu o texto de uma resposta: sem LLM, reescrito e aprovado, reprovado pelo validador ou com erro do provedor. */
export type Redacao = 'template' | 'llm' | 'reprovada' | 'erro'

/** Uma resposta da Kaki, registrada pelo pipeline. Sem texto da conversa: só o que a métrica precisa. */
export type RegistroResposta = {
  em: string
  sessaoId: string
  acao: Acao
  motivos: string[]
  redacao: Redacao
  comFonte: boolean
  naoEntendeu: boolean
  ms: number
}

/** Uma chamada ao modelo (redação ou entendimento), registrada pelo adaptador. */
export type RegistroLlm = { caracteresEntrada: number; caracteresSaida: number; ms: number; ok: boolean }

/** Preço do modelo em centavos por milhão de tokens. Zero quando não configurado. */
export type Precos = { entradaCentavosMtok: number; saidaCentavosMtok: number }

/** Motivos de escalonamento que mostram que a conversa travou, e não que o cliente precisava de uma pessoa. */
const MOTIVOS_DE_TRAVA = ['PASSOS_MAX', 'NAO_ENTENDEU_2X']
/** Português do Brasil: cerca de 4 caracteres por token. É estimativa, e a tela diz isso. */
export const CARACTERES_POR_TOKEN = 4

const ROTULO_ACAO: Record<string, string> = {
  seguranca_imediata: 'Segurança imediata', encaminhar_humano: 'Atendimento por pessoa',
  encaminhar_especialista: 'Especialista em investimentos', protocolo: 'Protocolo',
}
const rotular = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ')

/** Percentual inteiro; null quando não há base (a tela mostra "sem dados" em vez de 0%). */
export const pct = (parte: number, todo: number): number | null => (todo > 0 ? Math.round((100 * parte) / todo) : null)

const media = (valores: number[]): number | null => (valores.length ? Math.round(valores.reduce((s, v) => s + v, 0) / valores.length) : null)

/** Agrupa e ordena do maior para o menor; empate pela chave, para a ordem não mudar entre chamadas. */
export function contar(chaves: string[], rotulo: (chave: string) => string = rotular): Contagem[] {
  const m = new Map<string, number>()
  for (const c of chaves) m.set(c, (m.get(c) ?? 0) + 1)
  return [...m.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([chave, total]) => ({ chave, rotulo: rotulo(chave), total, pct: pct(total, chaves.length) ?? 0 }))
}

export type CasoEscalonado = {
  protocolo: string
  clienteNome: string
  acao: string
  motivos: string[]
  status: Caso['status']
  prioridade: Caso['prioridade']
  criadoEm: string
}

/** A lista de casos vem em páginas: com muitos clientes, nem a tela nem a resposta da API crescem sem limite. */
export const CASOS_POR_PAGINA = 10
export type FiltroCasos = { pagina: number; status: StatusCaso | null }
export type PaginaDeCasos = { itens: CasoEscalonado[]; total: number; pagina: number; paginas: number }

/** Mais novo primeiro (no mesmo minuto, o protocolo maior é o mais novo); página fora do intervalo vira a mais próxima (a lista pode encolher entre duas atualizações). */
export function paginarCasos(casos: Caso[], filtro: FiltroCasos, porPagina = CASOS_POR_PAGINA): PaginaDeCasos {
  const filtrados = casos.filter((c) => !filtro.status || c.status === filtro.status).sort((a, b) => b.criadoEm.localeCompare(a.criadoEm) || b.protocolo.localeCompare(a.protocolo))
  const paginas = Math.max(1, Math.ceil(filtrados.length / porPagina))
  const pagina = Math.min(Math.max(1, Math.trunc(filtro.pagina) || 1), paginas)
  const itens = filtrados.slice((pagina - 1) * porPagina, pagina * porPagina).map((c) => ({
    protocolo: c.protocolo, clienteNome: c.clienteNome, acao: ROTULO_ACAO[c.acao] ?? rotular(c.acao),
    motivos: [...new Set(c.motivos)].map(rotuloMotivo), status: c.status, prioridade: c.prioridade, criadoEm: c.criadoEm,
  }))
  return { itens, total: filtrados.length, pagina, paginas }
}

export type ResumoAoVivo = {
  conversas: number
  mensagens: number
  resolucaoAutomaticaPct: number | null
  escalonadas: number
  escalonadasPct: number | null
  /** Escalonamentos porque a conversa travou (limite de passos ou dois "não entendi"). */
  travadas: number
  porAcao: Contagem[]
  casos: PaginaDeCasos
  qualidade: {
    redacoesLlm: number
    /** Texto da IA barrado pelo validador. Erro do provedor não entra: aí a IA nem escreveu. */
    reprovadasPct: number | null
    comFontePct: number | null
    naoEntendeuPct: number | null
  }
  latencia: { mediaMs: number | null }
  custo: {
    chamadasLlm: number
    tokensEntrada: number
    tokensSaida: number
    totalCentavos: number
    porMilConversasCentavos: number | null
    precoConfigurado: boolean
  }
}

export const tokensEstimados = (caracteres: number): number => Math.ceil(caracteres / CARACTERES_POR_TOKEN)

export function resumirAoVivo(respostas: RegistroResposta[], chamadas: RegistroLlm[], casos: Caso[], precos: Precos, filtro: FiltroCasos = { pagina: 1, status: null }): ResumoAoVivo {
  const sessoes = new Set(respostas.map((r) => r.sessaoId))
  const sessoesEscalonadas = new Set(casos.filter((c) => sessoes.has(c.sessaoId)).map((c) => c.sessaoId))
  const conversas = sessoes.size

  // Só conta o que a IA de fato escreveu: com erro do provedor não houve texto para barrar.
  const escritasPelaIa = respostas.filter((r) => r.redacao === 'llm' || r.redacao === 'reprovada')
  const diretas = respostas.filter((r) => r.acao === 'responder' && !r.naoEntendeu)

  // Cada chamada conta os próprios tokens: arredondar por chamada é o que o provedor cobra.
  const tokensEntrada = chamadas.reduce((s, c) => s + tokensEstimados(c.caracteresEntrada), 0)
  const tokensSaida = chamadas.reduce((s, c) => s + tokensEstimados(c.caracteresSaida), 0)
  const custoExato = (tokensEntrada * precos.entradaCentavosMtok + tokensSaida * precos.saidaCentavosMtok) / 1_000_000

  return {
    conversas,
    mensagens: respostas.length,
    resolucaoAutomaticaPct: pct(conversas - sessoesEscalonadas.size, conversas),
    escalonadas: sessoesEscalonadas.size,
    escalonadasPct: pct(sessoesEscalonadas.size, conversas),
    travadas: new Set(respostas.filter((r) => r.motivos.some((m) => MOTIVOS_DE_TRAVA.includes(m))).map((r) => r.sessaoId)).size,
    porAcao: contar(casos.map((c) => c.acao), (a) => ROTULO_ACAO[a] ?? rotular(a)),
    casos: paginarCasos(casos, filtro),
    qualidade: {
      redacoesLlm: escritasPelaIa.length,
      reprovadasPct: pct(escritasPelaIa.filter((r) => r.redacao === 'reprovada').length, escritasPelaIa.length),
      comFontePct: pct(diretas.filter((r) => r.comFonte).length, diretas.length),
      naoEntendeuPct: pct(respostas.filter((r) => r.naoEntendeu).length, respostas.length),
    },
    latencia: {
      mediaMs: media(respostas.map((r) => r.ms)),
    },
    custo: {
      chamadasLlm: chamadas.length,
      tokensEntrada,
      tokensSaida,
      totalCentavos: Math.round(custoExato),
      porMilConversasCentavos: conversas ? Math.round((custoExato * 1000) / conversas) : null,
      precoConfigurado: precos.entradaCentavosMtok > 0 || precos.saidaCentavosMtok > 0,
    },
  }
}
