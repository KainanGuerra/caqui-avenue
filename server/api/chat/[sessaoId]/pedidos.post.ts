import { createError, defineEventHandler, getRouterParam } from 'h3'
import { z } from 'zod'
import { PAGINAS_PEDIDO, TIPOS_PEDIDO } from '../../../domain/page-request'
import { corpo } from '../../../utils/http'
import { container } from '../../../utils/container'

const esquema = z.object({ tipo: z.enum(TIPOS_PEDIDO), pagina: z.enum(PAGINAS_PEDIDO) })

// Pedido de pessoa, especialista ou segurança feito numa página, sem passar pela conversa. Devolve o protocolo.
export default defineEventHandler(async (event) => {
  const { tipo, pagina } = await corpo(event, esquema)
  const r = container().pedidos.registrar(getRouterParam(event, 'sessaoId') ?? '', tipo, pagina)
  if (!r) throw createError({ statusCode: 404, statusMessage: 'Sessão não encontrada' })
  return r
})
