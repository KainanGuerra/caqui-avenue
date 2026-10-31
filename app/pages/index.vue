<script setup lang="ts">
import type { ClienteResumo } from '~/types'
import { iniciais } from '~/utils/moeda'

useHead({ title: 'Entrar · Kaki' })

const chat = useChat()
const acesso = useAcesso()
const { data: clientes } = await useFetch<ClienteResumo[]>('/api/clientes', { default: () => [] })
const { data: estado } = await useFetch<{ aberto: boolean }>('/api/suporte/estado', { default: () => ({ aberto: true }) })
const { data: estadoGerente } = await useFetch<{ aberto: boolean }>('/api/gerente/estado', { default: () => ({ aberto: true }) })

const aba = ref('cliente')
const abas = [
  { label: 'Sou cliente', value: 'cliente', icon: 'i-lucide-user-round' },
  { label: 'Sou da equipe', value: 'equipe', icon: 'i-lucide-headset' },
  { label: 'Sou gerente', value: 'gerente', icon: 'i-lucide-chart-column' },
]
const busca = ref('')
const ocupado = ref<string | null>(null)
const falhou = ref('')
const pin = ref('')

const personas = computed(() => clientes.value.filter((c) => c.persona))
const outros = computed(() => {
  const q = busca.value.trim().toLowerCase()
  return clientes.value.filter((c) => !c.persona && (!q || c.nome.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)))
})

async function entrarCliente(id: string) {
  ocupado.value = id
  falhou.value = ''
  try {
    await chat.iniciar(id)
    await navigateTo('/inicio')
  } catch {
    falhou.value = 'Não foi possível entrar agora. Tente de novo.'
  } finally {
    ocupado.value = null
  }
}

async function entrarEquipe() {
  ocupado.value = 'equipe'
  falhou.value = ''
  try {
    await $fetch('/api/suporte/login', { method: 'POST', body: { pin: pin.value } })
    acesso.entrarComoSuporte('Jonas')
    await navigateTo('/suporte')
  } catch {
    falhou.value = 'PIN incorreto.'
  } finally {
    ocupado.value = null
  }
}

async function entrarGerente() {
  ocupado.value = 'gerente'
  falhou.value = ''
  try {
    await $fetch('/api/gerente/login', { method: 'POST', body: { pin: pin.value } })
    acesso.entrarComoGerente('Helena')
    await navigateTo('/gerente')
  } catch {
    falhou.value = 'PIN incorreto.'
  } finally {
    ocupado.value = null
  }
}

// O PIN digitado numa aba não vale para a outra.
watch(aba, () => { pin.value = ''; falhou.value = '' })
</script>

<template>
  <!-- A altura é a tela menos o topo (3,5rem), o rodapé (2,75rem) e o respiro da página (2rem): a entrada não precisa rolar. -->
  <div class="mx-auto flex min-h-[calc(100dvh-8.25rem)] max-w-xl flex-col justify-center gap-5 py-2">
    <div class="flex justify-center text-highlighted"><AppLogo empilhada :tamanho="72" /></div>
    <div class="text-center">
      <h1 class="text-2xl font-semibold">Quem está entrando?</h1>
      <p class="mt-1 text-sm text-muted">Entrada simulada para a demonstração: escolha uma pessoa fictícia. Não há senha de cliente.</p>
    </div>

    <UTabs v-model="aba" :items="abas" :content="false" color="primary" class="w-full" />
    <UAlert v-if="falhou" color="error" variant="subtle" icon="i-lucide-triangle-alert" :title="falhou" role="alert" />

    <section v-if="aba === 'cliente'" class="space-y-3" aria-label="Clientes">
      <h2 class="text-sm font-medium text-muted">Personas do case</h2>
      <div class="grid gap-2 sm:grid-cols-3">
        <button v-for="c in personas" :key="c.id" type="button" class="group flex min-h-11 flex-col items-start gap-2 rounded-xl border border-default bg-default p-3 text-left transition hover:border-primary hover:shadow-sm focus-visible:outline-2 focus-visible:outline-primary" :disabled="ocupado !== null" :data-testid="`entrar-${c.id}`" @click="entrarCliente(c.id)">
          <UAvatar :text="iniciais(c.nome)" size="md" class="bg-primary/10 text-primary" />
          <span>
            <span class="block font-medium">{{ c.nome }}</span>
            <span class="block text-xs text-muted">{{ c.persona }} · {{ c.idade }} anos</span>
          </span>
          <UIcon v-if="ocupado === c.id" name="i-lucide-loader-circle" class="size-4 animate-spin text-primary" />
        </button>
      </div>

      <details class="rounded-xl border border-default bg-default p-3">
        <summary class="cursor-pointer text-sm font-medium text-muted">Outros clientes ({{ clientes.length - personas.length }})</summary>
        <UInput v-model="busca" icon="i-lucide-search" placeholder="Buscar por nome ou código" class="mt-3 w-full" aria-label="Buscar cliente" />
        <ul class="mt-2 max-h-56 divide-y divide-default overflow-y-auto">
          <li v-for="c in outros" :key="c.id">
            <button type="button" class="flex min-h-11 w-full items-center gap-3 px-1 py-2 text-left hover:bg-elevated" :disabled="ocupado !== null" @click="entrarCliente(c.id)">
              <UAvatar :text="iniciais(c.nome)" size="xs" />
              <span class="min-w-0 flex-1 truncate text-sm">{{ c.nome }}</span>
              <span class="text-xs text-muted">{{ c.idade }} anos · {{ c.id }}</span>
            </button>
          </li>
          <li v-if="!outros.length" class="py-3 text-center text-sm text-muted">Ninguém com esse nome.</li>
        </ul>
      </details>
    </section>

    <section v-else-if="aba === 'gerente'" class="space-y-3" aria-label="Gerência">
      <div class="flex items-center gap-3 rounded-xl border border-default bg-default p-3">
        <UAvatar text="H" size="md" class="bg-primary/10 text-primary" />
        <div class="min-w-0 flex-1">
          <p class="font-medium">Helena</p>
          <p class="text-xs text-muted">Gerente · acompanha volume, resolução, escalonamentos, qualidade, custo e latência</p>
        </div>
      </div>
      <form class="space-y-3" @submit.prevent="entrarGerente">
        <UFormField v-if="!estadoGerente?.aberto" label="PIN do gerente" help="Definido em GERENTE_PIN.">
          <UInput v-model="pin" type="password" inputmode="numeric" autocomplete="off" class="w-full" />
        </UFormField>
        <p v-else class="text-sm text-muted">Painel sem PIN (uso local). Defina GERENTE_PIN para proteger.</p>
        <UButton type="submit" block size="lg" icon="i-lucide-log-in" :loading="ocupado === 'gerente'" :disabled="!estadoGerente?.aberto && !pin" label="Entrar como Helena" data-testid="entrar-gerente" />
      </form>
    </section>

    <section v-else class="space-y-3" aria-label="Equipe de suporte">
      <div class="flex items-center gap-3 rounded-xl border border-default bg-default p-3">
        <UAvatar text="J" size="md" class="bg-primary/10 text-primary" />
        <div class="min-w-0 flex-1">
          <p class="font-medium">Jonas</p>
          <p class="text-xs text-muted">Atendente · vê a fila de casos e responde ao cliente</p>
        </div>
      </div>
      <form class="space-y-3" @submit.prevent="entrarEquipe">
        <UFormField v-if="!estado?.aberto" label="PIN do painel" help="O PIN do dia, definido em ATENDENTE_PIN.">
          <UInput v-model="pin" type="password" inputmode="numeric" autocomplete="off" class="w-full" />
        </UFormField>
        <p v-else class="text-sm text-muted">Painel sem PIN (uso local). Defina ATENDENTE_PIN para proteger.</p>
        <UButton type="submit" block size="lg" icon="i-lucide-log-in" :loading="ocupado === 'equipe'" :disabled="!estado?.aberto && !pin" label="Entrar como Jonas" data-testid="entrar-equipe" />
      </form>
    </section>
  </div>
</template>
