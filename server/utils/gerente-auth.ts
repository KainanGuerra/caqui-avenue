import { container } from './container'
import { criarPortaoPin } from './pin-gate'

/** Painel do gerente: PIN próprio (GERENTE_PIN). O PIN do suporte não abre este painel, e o deste não abre a fila. */
export const portaoGerente = criarPortaoPin({ cookie: 'caqui_gerente', caminho: '/api/gerente', pin: () => container().env.GERENTE_PIN, mensagem: 'Entre com o PIN do gerente' })
