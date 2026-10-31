import type { Decisao } from './policy'
import type { Mensagem } from './session'
import type { Acao, Cliente, Fonte } from './types'

export type Risco = 'baixo' | 'medio' | 'alto' | 'critico'
export type StatusCaso = 'aberto' | 'assumido' | 'resolvido'

export type Caso = {
  id: string
  protocolo: string
  sessaoId: string
  clienteId: string
  clienteNome: string
  idade: number
  cpfMascarado: string
  acao: Acao
  motivos: string[]
  /** 0 golpe, 1 vulnerável ou idoso, 2 demais. */
  prioridade: 0 | 1 | 2
  risco: Risco
  status: StatusCaso
  atendente: string | null
  criadoEm: string
  atualizadoEm: string
  resumo: string[]
  fontes: Fonte[]
}

const ROTULO: Record<string, string> = {
  GOLPE_CREDENCIAL: 'pedido de senha, código ou token', GOLPE_CREDENCIAL_PASSADA: 'cliente já passou código ou senha',
  GOLPE_PIX_TESTE: 'Pix de teste ou conta segura', GOLPE_PIX_BLOQUEIO: 'Pix para evitar bloqueio', GOLPE_INSTALAR_APP: 'pedido para instalar aplicativo',
  GOLPE_ACESSO_REMOTO: 'acesso remoto ao aparelho', GOLPE_LINK: 'link para atualizar dados', GOLPE_SESSAO: 'sessão em modo segurança',
  GOLPE_RELATO: 'cliente relatou suspeita de golpe',
  VULNERAVEL_TERCEIRO: 'terceiro pressionando', VULNERAVEL_PRESSAO: 'pressão para resgatar', VULNERAVEL_CONFUSAO: 'sinal de confusão',
  VULNERAVEL_RESGATE_ATIPICO: 'resgate total atípico', VULNERAVEL_SESSAO: 'vulnerabilidade já detectada nesta conversa',
  DADO_ALHEIO_ID: 'pedido de dado de outro cliente', DADO_ALHEIO_NOME: 'pedido de dado de outra pessoa', DADO_ALHEIO_LISTA: 'pedido de lista de clientes',
  DADO_ALHEIO_TERCEIRO: 'pedido de dado de terceiro', RECLAMACAO: 'reclamação', CANCELAMENTO: 'pedido de encerramento',
  HUMANO_PEDIDO: 'pediu falar com uma pessoa', HUMANO_PALAVRA: 'pediu atendente', HUMANO_DE_VERDADE: 'pediu pessoa de verdade',
  FORA_HORARIO: 'fora do horário do atendimento humano', NAO_ENTENDEU_2X: 'duas mensagens sem entendimento', PASSOS_MAX: 'limite de cinco passos',
}
export const rotuloMotivo = (m: string): string => ROTULO[m] ?? (m.startsWith('RECOMENDACAO') ? 'pedido de recomendação' : m.toLowerCase().replace(/_/g, ' '))

export function riscoDe(decisao: Pick<Decisao, 'acao' | 'motivos'>): Risco {
  if (decisao.acao === 'seguranca_imediata') return 'critico'
  if (decisao.acao === 'encaminhar_especialista') return 'critico'
  if (decisao.motivos.some((m) => m.startsWith('VULNERAVEL'))) return 'alto'
  if (decisao.motivos.includes('RECLAMACAO') || decisao.motivos.includes('CANCELAMENTO')) return 'alto'
  return 'medio'
}

/** Idoso (60 anos ou mais) passa na frente no atendimento por pessoa (KB-028). */
export const prioridadeDoCaso = (decisao: Pick<Decisao, 'prioridade'>, cliente: Pick<Cliente, 'idade'>): 0 | 1 | 2 =>
  decisao.prioridade === 0 ? 0 : cliente.idade >= 60 ? 1 : decisao.prioridade

// Resumo montado só com dados estruturados (sinais, motivos, contagens): nenhum texto gerado por modelo entra aqui.
export function montarResumo(cliente: Cliente, decisao: Decisao, historico: Mensagem[], ultimaFala: string): string[] {
  const linhas = [
    `${cliente.nome}, ${cliente.idade} anos (${cliente.id}), pediu ${decisao.acao.replace(/_/g, ' ')}.`,
    `Motivos: ${[...new Set(decisao.motivos)].map(rotuloMotivo).join('; ')}.`,
    `Última mensagem do cliente: "${ultimaFala.slice(0, 220)}"`,
    `${historico.filter((m) => m.papel === 'cliente').length} mensagem(ns) do cliente nesta conversa.`,
  ]
  if (cliente.idade >= 60) linhas.push('Cliente com 60 anos ou mais: prioridade no atendimento por pessoa.')
  return linhas
}

export function ordenarFila(casos: Caso[]): Caso[] {
  const peso = (c: Caso) => (c.status === 'resolvido' ? 1 : 0)
  return [...casos].sort((a, b) => peso(a) - peso(b) || a.prioridade - b.prioridade || a.criadoEm.localeCompare(b.criadoEm))
}
