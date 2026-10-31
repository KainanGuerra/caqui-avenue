import { createError, defineEventHandler } from 'h3'
import { z } from 'zod'
import { corpo } from '../../utils/http'
import { portaoGerente } from '../../utils/gerente-auth'

export default defineEventHandler(async (event) => {
  const { pin } = await corpo(event, z.object({ pin: z.string().max(64).default('') }))
  if (!portaoGerente.entrar(event, pin)) throw createError({ statusCode: 401, statusMessage: 'PIN incorreto' })
  return { ok: true, aberto: portaoGerente.aberto() }
})
