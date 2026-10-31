import { descreverRetorno, humanoDisponivel } from '../domain/business-hours'
import { artigoAtual, type ArtigoLeitura } from '../domain/kb-reading'
import { isoDe } from '../domain/momento'
import { FONTES_DO_PEDIDO, decisaoDoPedido, falaDoPedido, respostaDoPedido, type PaginaPedido, type TipoPedido } from '../domain/page-request'
import type { Acao, Fonte } from '../domain/types'
import type { Clock } from '../infrastructure/clock'
import type { Dados } from '../infrastructure/data/dados'
import type { SessionStore } from '../infrastructure/stores/session-store'
import type { CaseService } from './case-service'

export type ResultadoPedido = {
  acao: Acao
  protocolo: string
  humanoDisponivel: boolean
  /** "amanhã a partir das 8h" fora do horário; null quando há pessoa agora. */
  retorno: string | null
  texto: string
  /** Orientação da base para mostrar na página já com o pedido (segurança: passos da KB-020). */
  orientacao: ArtigoLeitura[]
}

/** "O que fazer se você suspeita de golpe": os passos que valem enquanto a segurança não responde. */
const ORIENTACAO_GOLPE = 'KB-020'

export type DepsPedidos = { dados: Dados; sessoes: SessionStore; casos: CaseService; clock: Clock }

// O pedido entra no caso e no histórico da sessão como se tivesse sido feito na conversa: quem atende vê tudo junto e o
// cliente que abrir a conversa depois encontra o pedido e o protocolo.
export class PedidoService {
  constructor(private readonly d: DepsPedidos) {}

  registrar(sessaoId: string, tipo: TipoPedido, pagina: PaginaPedido): ResultadoPedido | null {
    const sessao = this.d.sessoes.obter(sessaoId)
    const conta = sessao ? this.d.dados.dadosDoCliente(sessao.clienteId) : null
    if (!sessao || !conta) return null
    const momento = this.d.clock.agora()
    const agoraIso = isoDe(momento)
    const casoAtual = sessao.casoId ? this.d.casos.obter(sessao.casoId) : null
    if (casoAtual?.status === 'resolvido') { sessao.casoId = null; sessao.modoSeguranca = false }

    const decisao = decisaoDoPedido(tipo, momento)
    const fala = falaDoPedido(tipo, pagina)
    sessao.historico.push({ papel: 'cliente', texto: fala, em: agoraIso })
    const fontes: Fonte[] = FONTES_DO_PEDIDO[tipo]
      .map((id) => this.d.dados.kb.find((a) => a.id === id))
      .filter((a) => a !== undefined)
      .map<Fonte>((a) => ({ tipo: 'kb', id: a.id, rotulo: a.titulo }))
    const caso = this.d.casos.abrirOuAtualizar(sessao, conta.cliente, decisao, fala, fontes, agoraIso)
    if (tipo === 'seguranca') sessao.modoSeguranca = true

    const texto = respostaDoPedido(tipo, decisao, caso.protocolo, momento)
    sessao.historico.push({ papel: 'agente', texto, em: agoraIso, acao: decisao.acao, fontes, protocolo: caso.protocolo })
    const disponivel = humanoDisponivel(momento)
    return {
      acao: decisao.acao, protocolo: caso.protocolo, humanoDisponivel: disponivel, retorno: disponivel ? null : descreverRetorno(momento), texto,
      orientacao: tipo === 'seguranca' ? [artigoAtual(this.d.dados.kb, ORIENTACAO_GOLPE)].filter((a) => a !== null) : [],
    }
  }
}
