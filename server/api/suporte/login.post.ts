import { createError, defineEventHandler } from 'h3'
import { z } from 'zod'
import { corpo } from '../../utils/http'
import { entrarNoPainel, painelAberto } from '../../utils/suporte-auth'

export default defineEventHandler(async (event) => {
  const { pin } = await corpo(event, z.object({ pin: z.string().max(64).default('') }))
  if (!entrarNoPainel(event, pin)) throw createError({ statusCode: 401, statusMessage: 'PIN incorreto' })
  return { ok: true, aberto: painelAberto() }
})
