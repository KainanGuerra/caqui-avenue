import type { Caso, Mensagem, ResumoFila } from '~/types'

export type Detalhe = { caso: Caso; mensagens: Mensagem[]; esperaEstimadaMin: number }

// Estado do painel do suporte: fila, KPIs e o caso aberto, atualizados por polling.
// A entrada (PIN) é feita na tela de login; um 401 aqui significa que a sessão do painel caiu.
export function useSuporte() {
  const acesso = useAcesso()
  const casos = ref<Caso[]>([])
  const resumo = ref<ResumoFila | null>(null)
  const selecionado = ref<string | null>(null)
  const detalhe = ref<Detalhe | null>(null)
  const erro = ref('')
  let timer: ReturnType<typeof setInterval> | undefined

  async function atualizar() {
    try {
      const [fila, kpis] = await Promise.all([$fetch<Caso[]>('/api/suporte/casos'), $fetch<ResumoFila>('/api/suporte/resumo')])
      casos.value = fila
      resumo.value = kpis
      if (selecionado.value) detalhe.value = await $fetch<Detalhe>(`/api/suporte/casos/${selecionado.value}`)
    } catch (e) {
      if ((e as { statusCode?: number }).statusCode === 401) { clearInterval(timer); await acesso.sair() }
    }
  }

  async function abrir(id: string) {
    selecionado.value = id
    detalhe.value = await $fetch<Detalhe>(`/api/suporte/casos/${id}`)
  }

  async function acao(rota: 'assumir' | 'responder' | 'resolver', corpo: Record<string, string> = {}) {
    if (!selecionado.value) return
    erro.value = ''
    try {
      await $fetch(`/api/suporte/casos/${selecionado.value}/${rota}`, { method: 'POST', body: corpo })
    } catch {
      erro.value = 'Não deu para concluir: o caso pode já ter sido resolvido.'
    }
    await atualizar()
  }

  onMounted(async () => {
    await atualizar()
    timer = setInterval(atualizar, 2500)
  })
  onBeforeUnmount(() => clearInterval(timer))
  return { casos, resumo, selecionado, detalhe, erro, abrir, acao }
}
