import { randomUUID } from 'node:crypto'
import { montarResumo, ordenarFila, prioridadeDoCaso, riscoDe, type Caso } from '../domain/case-summary'
import type { Decisao } from '../domain/policy'
import type { Mensagem, Sessao } from '../domain/session'
import type { Cliente, Fonte } from '../domain/types'
import type { CaseStore } from '../infrastructure/stores/case-store'

// Minutos de espera estimados por caso à frente: valor simulado (o case não traz o número real).
export const MINUTOS_POR_CASO = 3
// O case cita fila de 35 minutos no pico: a estimativa simulada nunca passa disso.
export const ESPERA_MAXIMA_MIN = 35

export class CaseService {
  constructor(private readonly store: CaseStore) {}

  /** Abre o caso da sessão ou atualiza o aberto: nunca duplica, e a gravidade só sobe. */
  abrirOuAtualizar(sessao: Sessao, cliente: Cliente, decisao: Decisao, ultimaFala: string, fontes: Fonte[], agora: string): Caso {
    const prioridade = prioridadeDoCaso(decisao, cliente)
    const existente = this.store.porSessao(sessao.id)
    if (existente) {
      const sobe = prioridade < existente.prioridade
      const atualizado: Caso = {
        ...existente,
        acao: sobe ? decisao.acao : existente.acao,
        prioridade: sobe ? prioridade : existente.prioridade,
        risco: sobe ? riscoDe(decisao) : existente.risco,
        motivos: [...new Set([...existente.motivos, ...decisao.motivos])],
        resumo: montarResumo(cliente, decisao, sessao.historico, ultimaFala),
        fontes: [...new Map([...existente.fontes, ...fontes].map((f) => [f.id, f])).values()],
        atualizadoEm: agora,
      }
      this.store.salvar(atualizado)
      return atualizado
    }
    const caso: Caso = {
      id: randomUUID(), protocolo: this.store.proximoProtocolo(), sessaoId: sessao.id, clienteId: cliente.id, clienteNome: cliente.nome,
      idade: cliente.idade, cpfMascarado: cliente.cpfMascarado, acao: decisao.acao, motivos: decisao.motivos, prioridade,
      risco: riscoDe(decisao), status: 'aberto', atendente: null, criadoEm: agora, atualizadoEm: agora,
      resumo: montarResumo(cliente, decisao, sessao.historico, ultimaFala), fontes,
    }
    this.store.salvar(caso)
    sessao.casoId = caso.id
    return caso
  }

  /** Casos abertos à frente de um caso com a mesma prioridade ou maior: base da espera estimada. */
  esperaEstimadaMin(caso: Caso): number {
    const frente = this.store.todos().filter((c) => c.status !== 'resolvido' && c.id !== caso.id && (c.prioridade < caso.prioridade || (c.prioridade === caso.prioridade && c.criadoEm <= caso.criadoEm))).length
    return Math.min(ESPERA_MAXIMA_MIN, Math.max(2, frente * MINUTOS_POR_CASO))
  }

  fila(): Caso[] {
    return ordenarFila(this.store.todos())
  }

  obter(id: string): Caso | null {
    return this.store.obter(id)
  }

  assumir(id: string, atendente: string, agora: string): Caso | null {
    const c = this.store.obter(id)
    if (!c || c.status === 'resolvido') return null
    const atualizado: Caso = { ...c, status: 'assumido', atendente, atualizadoEm: agora }
    this.store.salvar(atualizado)
    return atualizado
  }

  /** A fala do atendente entra no histórico da sessão: o cliente a recebe no próprio chat. */
  responder(id: string, sessao: Sessao, texto: string, atendente: string, agora: string): Caso | null {
    const c = this.store.obter(id)
    if (!c || c.status === 'resolvido') return null
    const m: Mensagem = { papel: 'humano', texto, em: agora }
    sessao.historico.push(m)
    const atualizado: Caso = { ...c, status: 'assumido', atendente: c.atendente ?? atendente, atualizadoEm: agora }
    this.store.salvar(atualizado)
    return atualizado
  }

  resolver(id: string, agora: string): Caso | null {
    const c = this.store.obter(id)
    if (!c) return null
    const atualizado: Caso = { ...c, status: 'resolvido', atualizadoEm: agora }
    this.store.salvar(atualizado)
    return atualizado
  }
}
