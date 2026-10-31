import type { PainelGerente, StatusCaso } from '~/types'

const INTERVALO_MS = 5000

// Estado do painel do gerente, atualizado por polling. A página e o filtro da lista de casos vão ao servidor,
// que devolve só uma página: com muitos clientes, a resposta continua pequena. Um 401 significa que a sessão do painel caiu.
export function useGerente() {
  const acesso = useAcesso()
  const painel = ref<PainelGerente | null>(null)
  const falhou = ref(false)
  const pagina = ref(1)
  const status = ref<StatusCaso | null>(null)
  let timer: ReturnType<typeof setInterval> | undefined

  async function atualizar() {
    try {
      const query = { pagina: pagina.value, ...(status.value ? { status: status.value } : {}) }
      painel.value = await $fetch<PainelGerente>('/api/gerente/painel', { query })
      // O servidor ajusta a página se ela deixou de existir.
      pagina.value = painel.value.casos.pagina
      falhou.value = false
    } catch (e) {
      if ((e as { statusCode?: number }).statusCode === 401) { parar(); await acesso.sair(); return }
      falhou.value = true
    }
  }

  // Trocar o filtro volta para a primeira página.
  watch(status, () => { pagina.value = 1; void atualizar() })
  watch(pagina, (nova, antiga) => { if (nova !== antiga) void atualizar() })

  function acompanhar() {
    parar()
    timer = setInterval(atualizar, INTERVALO_MS)
  }
  function parar() { clearInterval(timer) }

  return { painel, falhou, pagina, status, atualizar, acompanhar, parar }
}
