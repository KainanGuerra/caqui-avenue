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

// Sentimento estimado: uma suposição por conversa a partir do que já está registrado (ação, motivos, entendimento).
// Nada é gravado por cliente nem lido do texto; o painel mostra só o total. A primeira regra que bate vence.
export type Sentimento = 'preocupado' | 'insatisfeito' | 'frustrado' | 'satisfeito' | 'neutro'
/** Polaridade do sentimento: a escala da barra divergente (negativo, neutro, positivo). */
export type Polaridade = 'negativo' | 'neutro' | 'positivo'
export type ContagemSentimento = Contagem & { chave: Sentimento; criterio: string; polaridade: Polaridade }
export type ContagemPolaridade = Contagem & { chave: Polaridade }
export type ResumoSentimento = { conversas: number; polaridades: ContagemPolaridade[]; categorias: ContagemSentimento[] }

// Ordem de exibição: positivo primeiro (a ordem de prioridade da inferência está em inferirSentimento).
const SENTIMENTOS: { chave: Sentimento; rotulo: string; criterio: string; polaridade: Polaridade }[] = [
  { chave: 'satisfeito', rotulo: 'Satisfeito', criterio: 'Respondido pela Kaki com fonte, sem escalonar', polaridade: 'positivo' },
  { chave: 'neutro', rotulo: 'Neutro', criterio: 'Pediu uma pessoa, especialista ou protocolo', polaridade: 'neutro' },
  { chave: 'preocupado', rotulo: 'Preocupado', criterio: 'Sinal de golpe ou de cliente vulnerável', polaridade: 'negativo' },
  { chave: 'insatisfeito', rotulo: 'Insatisfeito', criterio: 'Reclamação ou pedido de cancelamento', polaridade: 'negativo' },
  { chave: 'frustrado', rotulo: 'Frustrado', criterio: 'A Kaki não entendeu alguma mensagem ou a conversa travou', polaridade: 'negativo' },
]
const POLARIDADES: { chave: Polaridade; rotulo: string }[] = [
  { chave: 'positivo', rotulo: 'Positivo' }, { chave: 'neutro', rotulo: 'Neutro' }, { chave: 'negativo', rotulo: 'Negativo' },
]

/** Uma conversa (as respostas de uma sessão) vira um sentimento provável. */
export function inferirSentimento(respostas: RegistroResposta[]): Sentimento {
  const motivos = respostas.flatMap((r) => r.motivos)
  if (respostas.some((r) => r.acao === 'seguranca_imediata') || motivos.some((m) => m.startsWith('GOLPE') || m.startsWith('VULNERAVEL'))) return 'preocupado'
  if (motivos.includes('RECLAMACAO') || motivos.includes('CANCELAMENTO')) return 'insatisfeito'
  if (respostas.some((r) => r.naoEntendeu) || motivos.some((m) => MOTIVOS_DE_TRAVA.includes(m))) return 'frustrado'
  if (respostas.length && respostas.every((r) => r.acao === 'responder') && respostas.some((r) => r.comFonte)) return 'satisfeito'
  return 'neutro'
}

/** Distribuição por conversa, na ordem fixa, positivo primeiro (a tela não reordena nem some com a que está zerada):
 *  as três polaridades, para a barra, e as cinco categorias, para o detalhe. */
export function distribuirSentimentos(respostas: RegistroResposta[]): ResumoSentimento {
  const porSessao = new Map<string, RegistroResposta[]>()
  for (const r of respostas) porSessao.set(r.sessaoId, [...(porSessao.get(r.sessaoId) ?? []), r])
  const sentimentos = [...porSessao.values()].map(inferirSentimento)
  const conversas = sentimentos.length
  const categorias = SENTIMENTOS.map((s) => {
    const total = sentimentos.filter((x) => x === s.chave).length
    return { ...s, total, pct: pct(total, conversas) ?? 0 }
  })
  const polaridades = POLARIDADES.map((p) => {
    const total = categorias.filter((c) => c.polaridade === p.chave).reduce((s, c) => s + c.total, 0)
    return { ...p, total, pct: pct(total, conversas) ?? 0 }
  })
  return { conversas, polaridades, categorias }
}

export type ResumoAoVivo = {
  conversas: number
  mensagens: number
  resolucaoAutomaticaPct: number | null
  escalonadas: number
  escalonadasPct: number | null
  /** Sentimento estimado por conversa, só agregado. */
  sentimento: ResumoSentimento
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
    sentimento: distribuirSentimentos(respostas),
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
