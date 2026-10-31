import { descreverHorario, descreverRetorno, humanoDisponivel } from './business-hours'
import { rotuloMotivo, type Caso } from './case-summary'
import { artigoAtual, type ArtigoLeitura } from './kb-reading'
import { melhorArtigo } from './kb-search'
import type { Momento } from './momento'
import type { ArtigoKb } from './types'

export type PerguntaComFonte = { pergunta: string; kbId: string | null }
/** A resposta abre na própria página: o artigo da base vem junto, e a conversa fica como última alternativa. */
export type PerguntaFrequente = PerguntaComFonte & { artigo: ArtigoLeitura | null }
export type StatusCasoVista = 'respondido' | 'em_andamento'
export type CasoVista = { protocolo: string; motivo: string; criadoEm: string; status: StatusCasoVista }

export type AtendimentoVista = {
  humanoDisponivel: boolean
  /** "das 8h às 20h". */
  horario: string
  /** "amanhã a partir das 8h" fora do horário; null quando há pessoa agora. */
  retorno: string | null
  faq: PerguntaFrequente[]
  especialista: PerguntaComFonte
  casos: CasoVista[]
}

// A pergunta é como o cliente fala; o assunto é o que se busca na base. "Quando cai meu resgate?" não tem palavra em comum
// com a KB-006 ("cai" não aparece lá), então a fonte é achada pelo assunto. A busca descarta artigo antigo (KB-007).
export const PERGUNTAS_FREQUENTES: { pergunta: string; assunto: string }[] = [
  { pergunta: 'Quando cai meu resgate?', assunto: 'prazos de resgate e de aplicação' },
  { pergunta: 'Qual a diferença entre rentabilidade bruta e líquida?', assunto: 'rentabilidade bruta e líquida' },
  { pergunta: 'O CDB tem garantia?', assunto: 'garantia do FGC no CDB' },
]

/** O pipeline trata a pergunta como pedido de recomendação e encaminha ao especialista (regra 4). */
export const PERGUNTA_ESPECIALISTA = 'Quer saber onde investir?'

export function perguntasFrequentes(kb: ArtigoKb[]): PerguntaFrequente[] {
  return PERGUNTAS_FREQUENTES.map(({ pergunta, assunto }) => {
    const kbId = melhorArtigo(kb, assunto)?.artigo.id ?? null
    return { pergunta, kbId, artigo: kbId ? artigoAtual(kb, kbId) : null }
  })
}

/** Casos da própria pessoa, do mais novo para o mais antigo. Resolvido é "respondido"; aberto ou assumido segue "em andamento". */
export function casosDoCliente(casos: Caso[], clienteId: string): CasoVista[] {
  return casos
    .filter((c) => c.clienteId === clienteId)
    .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))
    .map((c) => ({
      protocolo: c.protocolo,
      motivo: rotuloMotivo(c.motivos[0] ?? c.acao),
      criadoEm: c.criadoEm,
      status: c.status === 'resolvido' ? 'respondido' : 'em_andamento',
    }))
}

// O estado da página sai do relógio do servidor: o navegador não decide se há pessoa agora.
export function montarAtendimento(e: { momento: Momento; kb: ArtigoKb[]; casos: Caso[]; clienteId: string }): AtendimentoVista {
  const disponivel = humanoDisponivel(e.momento)
  return {
    humanoDisponivel: disponivel,
    horario: descreverHorario(),
    retorno: disponivel ? null : descreverRetorno(e.momento),
    faq: perguntasFrequentes(e.kb),
    especialista: { pergunta: PERGUNTA_ESPECIALISTA, kbId: melhorArtigo(e.kb, PERGUNTA_ESPECIALISTA)?.artigo.id ?? null },
    casos: casosDoCliente(e.casos, e.clienteId),
  }
}
