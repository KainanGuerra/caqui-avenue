import { defineEventHandler, getQuery } from 'h3'
import { z } from 'zod'
import { container } from '../../utils/container'
import { portaoGerente } from '../../utils/gerente-auth'

// Página e status da lista de casos; valor inválido volta ao padrão em vez de quebrar o painel.
const filtro = z.object({
  pagina: z.coerce.number().int().min(1).catch(1),
  status: z.enum(['aberto', 'assumido', 'resolvido']).nullable().catch(null),
})

// Painel do gerente: volume, resolução automática, escalonadas, qualidade, custo e latência. Tudo calculado no servidor.
export default defineEventHandler((event) => {
  portaoGerente.exigir(event)
  const q = getQuery(event)
  return container().gestao.painel(filtro.parse({ pagina: q.pagina ?? 1, status: q.status ?? null }))
})
