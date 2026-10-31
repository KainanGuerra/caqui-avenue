import { defineEventHandler, getCookie } from 'h3'
import { painelAberto } from '../../utils/suporte-auth'

// A tela de suporte pergunta se precisa de PIN antes de mostrar a fila.
export default defineEventHandler((event) => ({ aberto: painelAberto(), autenticado: painelAberto() || !!getCookie(event, 'caqui_suporte') }))
