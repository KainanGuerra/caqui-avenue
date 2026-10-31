import { humanoDisponivel } from './business-hours'
import type { Momento } from './momento'
import { MAX_MAL_ENTENDIDOS, MAX_PASSOS, type Sessao } from './session'
import { tem, type Sinais } from './signals'
import type { Acao } from './types'

export type Prioridade = 0 | 1 | 2
export type Decisao = {
  acao: Acao
  motivos: string[]
  /** 0 golpe, 1 vulnerável, 2 demais: ordena a fila do suporte. */
  prioridade: Prioridade
  /** O texto da resposta deve oferecer humano. */
  oferecerHumano: boolean
  /** A mensagem não foi entendida (incrementa o contador da sessão). */
  naoEntendeu: boolean
  /** Oferecer retenção nesta resposta (só uma vez por sessão). */
  oferecerRetencao: boolean
  /** O humano atende agora (dentro do horário). */
  humanoAgora: boolean
}

export type EntradaPolitica = {
  sinais: Sinais
  /** Houve alguma intenção reconhecida ou artigo confiável na base. */
  entendeu: boolean
  sessao: Sessao
  momento: Momento
}

const base = (humanoAgora: boolean): Omit<Decisao, 'acao' | 'motivos' | 'prioridade'> => ({
  oferecerHumano: false, naoEntendeu: false, oferecerRetencao: false, humanoAgora,
})

// Função pura. Ordem fixa: golpe > vulnerável > dado alheio > recomendação > humano, cancelar, reclamar > não entendeu > responder.
// Injeção de papel não decide a ação sozinha: ela é neutralizada como texto e a ação sai dos demais sinais.
export function decidir({ sinais, entendeu, sessao, momento }: EntradaPolitica): Decisao {
  const agora = humanoDisponivel(momento)
  const b = base(agora)

  if (tem(sinais, 'golpe') || sessao.modoSeguranca) {
    const motivos = tem(sinais, 'golpe') ? sinais.golpe! : ['GOLPE_SESSAO']
    return { ...b, acao: 'seguranca_imediata', motivos, prioridade: 0 }
  }

  if (tem(sinais, 'vulneravel') || sessao.vulneravel) {
    const motivos = tem(sinais, 'vulneravel') ? sinais.vulneravel! : ['VULNERAVEL_SESSAO']
    return agora
      ? { ...b, acao: 'encaminhar_humano', motivos, prioridade: 1 }
      : { ...b, acao: 'protocolo', motivos: [...motivos, 'FORA_HORARIO'], prioridade: 1 }
  }

  if (tem(sinais, 'dado_alheio')) return { ...b, acao: 'recusar', motivos: sinais.dado_alheio!, prioridade: 2 }

  if (tem(sinais, 'recomendacao')) return { ...b, acao: 'encaminhar_especialista', motivos: sinais.recomendacao!, prioridade: 2 }

  if (tem(sinais, 'reclamacao')) return { ...b, acao: 'protocolo', motivos: sinais.reclamacao!, prioridade: 2 }

  if (tem(sinais, 'cancelamento')) {
    return { ...b, acao: 'responder', motivos: sinais.cancelamento!, prioridade: 2, oferecerRetencao: !sessao.retencaoOferecida }
  }

  if (tem(sinais, 'humano')) {
    return agora
      ? { ...b, acao: 'encaminhar_humano', motivos: sinais.humano!, prioridade: 2 }
      : { ...b, acao: 'protocolo', motivos: [...sinais.humano!, 'FORA_HORARIO'], prioridade: 2 }
  }

  if (sessao.passosSemResolver >= MAX_PASSOS) {
    const motivos = ['PASSOS_MAX']
    return agora
      ? { ...b, acao: 'encaminhar_humano', motivos, prioridade: 2 }
      : { ...b, acao: 'protocolo', motivos: [...motivos, 'FORA_HORARIO'], prioridade: 2 }
  }

  if (!entendeu) {
    if (sessao.malEntendidos >= MAX_MAL_ENTENDIDOS) {
      const motivos = ['NAO_ENTENDEU_2X']
      return agora
        ? { ...b, acao: 'encaminhar_humano', motivos, prioridade: 2, naoEntendeu: true }
        : { ...b, acao: 'protocolo', motivos: [...motivos, 'FORA_HORARIO'], prioridade: 2, naoEntendeu: true }
    }
    // Ao dar a segunda resposta sem entender, o agente já oferece humano.
    return { ...b, acao: 'responder', motivos: ['NAO_ENTENDEU'], prioridade: 2, naoEntendeu: true, oferecerHumano: sessao.malEntendidos + 1 >= MAX_MAL_ENTENDIDOS }
  }

  return { ...b, acao: 'responder', motivos: ['RESPONDER'], prioridade: 2 }
}
