import { humanoDisponivel } from '../domain/business-hours'
import type { CalendarioUtil } from '../domain/calendar'
import { detectarIntencoes, ehPergunta } from '../domain/intents'
import { melhorArtigo } from '../domain/kb-search'
import { isoDe, parseMomento, type Momento } from '../domain/momento'
import { mascararCpf, normalizar } from '../domain/normalize'
import { decidir } from '../domain/policy'
import { MAX_MAL_ENTENDIDOS, type Mensagem } from '../domain/session'
import { detectarSinais, tem, type Sinais } from '../domain/signals'
import { extrairSlots } from '../domain/slots'
import type { Acao, Fonte } from '../domain/types'
import type { Dados } from '../infrastructure/data/dados'
import type { Clock } from '../infrastructure/clock'
import type { Logger } from '../infrastructure/logger'
import type { SessionStore } from '../infrastructure/stores/session-store'
import type { Persona } from '../persona'
import { montarPlano, type Plano } from './answer-plan'
import type { CaseService } from './case-service'
import { validar } from './validator'

/** Porta da redação: devolve um texto reescrito a partir do plano, ou null para usar o template. */
export type Redator = { redigir(plano: Plano, persona: Persona, perguntaDoCliente: string): Promise<string | null> }
/** Porta do entendimento com LLM (nível 2): só pode ADICIONAR sinais de alerta. */
export type Entendimento = { sinaisExtras(textoDoCliente: string): Promise<Sinais | null> }

export type Saida = {
  sessaoId: string
  texto: string
  acao: Acao
  motivos: string[]
  fontes: Fonte[]
  protocolo: string | null
  casoId: string | null
  humanoDisponivel: boolean
  /** Um atendente já assumiu: a mensagem foi para ele, e o agente fica em silêncio. */
  comHumano: boolean
  origemTexto: 'template' | 'llm'
}

export type DepsPipeline = {
  dados: Dados
  cal: CalendarioUtil
  sessoes: SessionStore
  casos: CaseService
  redator: Redator
  entendimento: Entendimento | null
  persona: Persona
  clock: Clock
  logger: Logger
}

const ENCAMINHAMENTOS: Acao[] = ['encaminhar_humano', 'encaminhar_especialista', 'seguranca_imediata', 'protocolo']

export class Pipeline {
  private readonly nomes: { id: string; nome: string }[]

  constructor(private readonly d: DepsPipeline) {
    this.nomes = [...d.dados.clientes.values()].map((c) => ({ id: c.id, nome: normalizar(c.nome) }))
  }

  /** Horário atual segundo o relógio injetado (usado pelas rotas). */
  agora(): Momento {
    return this.d.clock.agora()
  }

  async processar(sessaoId: string, texto: string, momentoIso?: string): Promise<Saida> {
    const t0 = Date.now()
    const { dados, cal, sessoes, casos, persona } = this.d
    const trace = this.d.logger.novoTrace()
    const sessao = sessoes.obter(sessaoId)
    if (!sessao) throw new Error('Sessão inexistente')
    const conta = dados.dadosDoCliente(sessao.clienteId)
    if (!conta) throw new Error('Cliente da sessão inexistente')
    const momento = momentoIso ? parseMomento(momentoIso) : this.d.clock.agora()
    const agoraIso = isoDe(momento)

    // 1 Entrada: o texto guardado e exibido já vai com o CPF mascarado.
    const textoSeguro = mascararCpf(texto).trim()
    sessao.historico.push({ papel: 'cliente', texto: textoSeguro, em: agoraIso })

    // Com um atendente na conversa, a mensagem vai para ele e o agente não responde.
    const casoAtual = sessao.casoId ? casos.obter(sessao.casoId) : null
    if (casoAtual?.status === 'assumido') {
      this.d.logger.info('mensagem.para_humano', { trace, sessao: sessao.id, casoId: casoAtual.id })
      return { sessaoId: sessao.id, texto: '', acao: 'encaminhar_humano', motivos: ['COM_HUMANO'], fontes: [], protocolo: casoAtual.protocolo, casoId: casoAtual.id, humanoDisponivel: humanoDisponivel(momento), comHumano: true, origemTexto: 'template' }
    }
    if (casoAtual?.status === 'resolvido') { sessao.casoId = null; sessao.modoSeguranca = false }

    // 2 Entendimento: léxico determinístico (autoritativo) + opcional LLM que só adiciona alertas.
    const ctx = { clienteId: conta.cliente.id, nome: normalizar(conta.cliente.nome), idade: conta.cliente.idade, outros: this.nomes.filter((n) => n.id !== conta.cliente.id) }
    const sinais: Sinais = detectarSinais(textoSeguro, ctx)
    if (this.d.entendimento) {
      const extras = await this.d.entendimento.sinaisExtras(textoSeguro).catch(() => null)
      if (extras) for (const [k, v] of Object.entries(extras) as [keyof Sinais, string[]][]) sinais[k] = [...new Set([...(sinais[k] ?? []), ...v])]
    }
    const slots = extrairSlots(textoSeguro, momento)
    const intencoes = detectarIntencoes(textoSeguro)
    const informativa = intencoes.some((i) => ['conceito', 'garantia', 'horario_corte', 'informe', 'produto_inexistente', 'cpf'].includes(i))
    const achadoKb = melhorArtigo(dados.kb, textoSeguro, informativa)
    // Pergunta bem formada fora da base é "entendida": o agente responde que não sabe, em vez de pedir para reformular.
    const entendeu = intencoes.length > 0 || achadoKb !== null || ehPergunta(textoSeguro)

    // 3 Política (função pura)
    const decisao = decidir({ sinais, entendeu, sessao, momento })

    // Encaminhamento abre ou atualiza o caso antes do texto, para a resposta já trazer o protocolo.
    let caso = null
    const planoFontesBase: Fonte[] = []
    if (ENCAMINHAMENTOS.includes(decisao.acao)) caso = casos.abrirOuAtualizar(sessao, conta.cliente, decisao, textoSeguro, planoFontesBase, agoraIso)

    // 4 Plano de resposta (fatos verificados e fontes)
    const plano = montarPlano({
      decisao, sinais, intencoes, slots, kb: dados.kb, achadoKb, conta, taxas: dados.taxas, cal, momento, sessao,
      saudacao: persona.saudacao, caso, esperaMin: caso ? casos.esperaEstimadaMin(caso) : 0, textoCliente: textoSeguro,
    })

    // 5 Redação + 6 validação: o modelo só reescreve; qualquer falha volta ao template.
    let final = plano.texto
    let origem: 'template' | 'llm' = 'template'
    let motivoFallback: string | null = null
    try {
      const reescrito = await this.d.redator.redigir(plano, persona, textoSeguro)
      if (reescrito) {
        const v = validar(reescrito, plano, persona, conta.cliente.id)
        if (v.ok) { final = reescrito; origem = 'llm' } else motivoFallback = v.problemas.join('; ')
      }
    } catch (e) { motivoFallback = e instanceof Error ? e.message : 'erro' }
    const vFinal = validar(final, plano, persona, conta.cliente.id)
    if (!vFinal.ok && origem === 'template') this.d.logger.info('template.reprovado', { trace, problemas: vFinal.problemas })

    // Estado da sessão
    if (decisao.acao === 'seguranca_imediata') sessao.modoSeguranca = true
    if (tem(sinais, 'vulneravel')) sessao.vulneravel = true
    if (decisao.oferecerRetencao) sessao.retencaoOferecida = true
    sessao.malEntendidos = decisao.naoEntendeu ? Math.min(sessao.malEntendidos + 1, MAX_MAL_ENTENDIDOS) : entendeu ? 0 : sessao.malEntendidos
    sessao.passosSemResolver = decisao.acao === 'responder' && plano.resolvido ? 0 : sessao.passosSemResolver + 1
    sessao.ultimasIntencoes = intencoes
    if (plano.ultimoProduto) sessao.ultimoProduto = plano.ultimoProduto
    if (plano.ultimaOperacaoId) sessao.ultimaOperacaoId = plano.ultimaOperacaoId

    const fontes = plano.fontes
    if (caso && fontes.length) casos.abrirOuAtualizar(sessao, conta.cliente, decisao, textoSeguro, fontes, agoraIso)

    const resposta: Mensagem = { papel: 'agente', texto: final, em: agoraIso, acao: decisao.acao, fontes, protocolo: caso?.protocolo }
    // Só quando a Kaki respondeu sem resolver; encaminhamentos já chamam a pessoa e não precisam do botão.
    if (decisao.acao === 'responder' && plano.oferecerHumano) resposta.oferecerHumano = true
    sessao.historico.push(resposta)

    this.d.logger.info('mensagem.processada', {
      trace, sessao: sessao.id, cliente: conta.cliente.id, acao: decisao.acao, motivos: decisao.motivos,
      sinais: Object.keys(sinais), intencoes, kb: achadoKb?.artigo.id ?? null, origemTexto: origem, fallback: motivoFallback,
      caracteres: textoSeguro.length, ms: Date.now() - t0,
    })

    return {
      sessaoId: sessao.id, texto: final, acao: decisao.acao, motivos: decisao.motivos, fontes, protocolo: caso?.protocolo ?? null,
      casoId: caso?.id ?? null, humanoDisponivel: humanoDisponivel(momento), comHumano: false, origemTexto: origem,
    }
  }
}
