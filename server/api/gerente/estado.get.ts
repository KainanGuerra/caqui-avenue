import { defineEventHandler } from 'h3'
import { portaoGerente } from '../../utils/gerente-auth'

// A entrada pergunta se o painel do gerente precisa de PIN.
export default defineEventHandler((event) => ({ aberto: portaoGerente.aberto(), autenticado: portaoGerente.autenticado(event) }))
