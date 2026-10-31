import { randomBytes, timingSafeEqual } from 'node:crypto'
import { createError, getCookie, setCookie, type H3Event } from 'h3'

export type PortaoPin = {
  /** Sem PIN configurado o painel fica aberto (só para uso local). */
  aberto(): boolean
  entrar(event: H3Event, pin: string): boolean
  exigir(event: H3Event): void
  autenticado(event: H3Event): boolean
}

const igual = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b))

// Um portão por painel (suporte, gerente): cada um com o próprio PIN, cookie e caminho, para um não abrir o outro.
export function criarPortaoPin(opcoes: { cookie: string; caminho: string; pin: () => string; mensagem: string }): PortaoPin {
  const tokens = new Set<string>()
  const aberto = () => opcoes.pin() === ''
  const autenticado = (event: H3Event) => {
    if (aberto()) return true
    const token = getCookie(event, opcoes.cookie)
    return !!token && tokens.has(token)
  }
  return {
    aberto,
    autenticado,
    entrar(event, pin) {
      const esperado = opcoes.pin()
      if (esperado && !igual(pin, esperado)) return false
      const token = randomBytes(24).toString('hex')
      tokens.add(token)
      setCookie(event, opcoes.cookie, token, { httpOnly: true, sameSite: 'lax', path: opcoes.caminho, maxAge: 60 * 60 * 8 })
      return true
    },
    exigir(event) {
      if (!autenticado(event)) throw createError({ statusCode: 401, statusMessage: opcoes.mensagem })
    },
  }
}
