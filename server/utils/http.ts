import { createError, readBody, type H3Event } from 'h3'
import type { ZodType } from 'zod'

/** Lê o corpo JSON e valida com Zod; erro de validação vira 400 com a lista de campos. */
export async function corpo<T>(event: H3Event, esquema: ZodType<T>): Promise<T> {
  const bruto = await readBody(event).catch(() => undefined)
  const r = esquema.safeParse(bruto)
  if (!r.success) throw createError({ statusCode: 400, statusMessage: 'Requisição inválida', data: r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`) })
  return r.data
}
