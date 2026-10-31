import type { PaginaPedido, ResultadoPedido, TipoPedido } from '~/types'

// Estado de um pedido feito na página: um resultado por tipo, para cada botão mostrar o próprio protocolo.
export function usePedido(pagina: PaginaPedido) {
  const chat = useChat()
  const resultados = ref<Partial<Record<TipoPedido, ResultadoPedido>>>({})
  const pedindo = ref<TipoPedido | null>(null)
  const falhou = ref<TipoPedido | null>(null)

  async function pedir(tipo: TipoPedido) {
    if (pedindo.value) return
    pedindo.value = tipo
    falhou.value = null
    const r = await chat.registrarPedido(tipo, pagina)
    if (r) resultados.value = { ...resultados.value, [tipo]: r }
    else falhou.value = tipo
    pedindo.value = null
  }

  return { resultados, pedindo, falhou, pedir }
}
