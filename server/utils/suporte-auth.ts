import type { H3Event } from 'h3'
import { container } from './container'
import { criarPortaoPin } from './pin-gate'

const portao = criarPortaoPin({ cookie: 'caqui_suporte', caminho: '/api/suporte', pin: () => container().env.ATENDENTE_PIN, mensagem: 'Entre com o PIN do painel' })

/** Sem ATENDENTE_PIN o painel fica aberto (só para uso local); com PIN exige login. */
export const painelAberto = (): boolean => portao.aberto()
export const entrarNoPainel = (event: H3Event, pin: string): boolean => portao.entrar(event, pin)
export const exigirSuporte = (event: H3Event): void => portao.exigir(event)
