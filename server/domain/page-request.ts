import { descreverRetorno, humanoDisponivel } from './business-hours'
import type { Momento } from './momento'
import type { Decisao } from './policy'

// Pedidos que as páginas registram sem abrir a conversa. A ação segue a mesma ordem da política (D7): segurança vale a
// qualquer hora; pessoa vira protocolo fora do horário; especialista é a resposta da regra 4.
export const TIPOS_PEDIDO = ['pessoa', 'especialista', 'seguranca'] as const
export type TipoPedido = (typeof TIPOS_PEDIDO)[number]
/** Só nomes conhecidos entram no histórico: o texto do pedido nunca vem livre do navegador. */
export const PAGINAS_PEDIDO = ['Atendimento', 'Investir'] as const
export type PaginaPedido = (typeof PAGINAS_PEDIDO)[number]

/** Artigos que embasam cada pedido; vão ao caso como fontes. */
export const FONTES_DO_PEDIDO: Record<TipoPedido, string[]> = {
  pessoa: ['KB-025', 'KB-026'],
  especialista: ['KB-029'],
  seguranca: ['KB-020', 'KB-019'],
}

const base = (humanoAgora: boolean) => ({ oferecerHumano: false, naoEntendeu: false, oferecerRetencao: false, humanoAgora })

export function decisaoDoPedido(tipo: TipoPedido, momento: Momento): Decisao {
  const agora = humanoDisponivel(momento)
  if (tipo === 'seguranca') return { ...base(agora), acao: 'seguranca_imediata', motivos: ['GOLPE_RELATO'], prioridade: 0 }
  if (tipo === 'especialista') return { ...base(agora), acao: 'encaminhar_especialista', motivos: ['RECOMENDACAO_PEDIDO'], prioridade: 2 }
  return agora
    ? { ...base(agora), acao: 'encaminhar_humano', motivos: ['HUMANO_PEDIDO'], prioridade: 2 }
    : { ...base(agora), acao: 'protocolo', motivos: ['HUMANO_PEDIDO', 'FORA_HORARIO'], prioridade: 2 }
}

/** Fala registrada no histórico em nome do cliente: quem atende vê de onde veio o pedido, e o cliente não repete. */
export const falaDoPedido = (tipo: TipoPedido, pagina: PaginaPedido): string => ({
  pessoa: `Pedi pela página ${pagina}: falar com uma pessoa.`,
  especialista: `Pedi pela página ${pagina}: falar com um especialista em investimentos.`,
  seguranca: `Pedi pela página ${pagina}: falar com a segurança, suspeita de golpe.`,
})[tipo]

export function respostaDoPedido(tipo: TipoPedido, decisao: Decisao, protocolo: string, momento: Momento): string {
  if (tipo === 'seguranca') {
    return `Chamei a equipe de segurança, que atende a qualquer hora, sem fila. Protocolo ${protocolo}. Não passe senha nem código e não faça nenhuma transferência.`
  }
  if (tipo === 'especialista') {
    return `Encaminhei você a um especialista em investimentos, que atende com agendamento. Protocolo ${protocolo}.`
  }
  return decisao.acao === 'encaminhar_humano'
    ? `Uma pessoa da Caqui vai te responder na conversa. Protocolo ${protocolo}.`
    : `Registramos sua demanda no protocolo ${protocolo} e retornamos ${descreverRetorno(momento)}.`
}
