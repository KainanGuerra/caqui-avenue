import { randomBytes, timingSafeEqual } from 'node:crypto'
import { createError, getCookie, setCookie, type H3Event } from 'h3'
import { container } from './container'

const COOKIE = 'caqui_suporte'
const tokens = new Set<string>()

const igual = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b))

/** Sem ATENDENTE_PIN o painel fica aberto (só para uso local); com PIN exige login. */
export const painelAberto = (): boolean => container().env.ATENDENTE_PIN === ''

export function entrarNoPainel(event: H3Event, pin: string): boolean {
  const esperado = container().env.ATENDENTE_PIN
  if (esperado && !igual(pin, esperado)) return false
  const token = randomBytes(24).toString('hex')
  tokens.add(token)
  setCookie(event, COOKIE, token, { httpOnly: true, sameSite: 'lax', path: '/api/suporte', maxAge: 60 * 60 * 8 })
  return true
}

export function exigirSuporte(event: H3Event): void {
  if (painelAberto()) return
  const token = getCookie(event, COOKIE)
  if (!token || !tokens.has(token)) throw createError({ statusCode: 401, statusMessage: 'Entre com o PIN do painel' })
}
