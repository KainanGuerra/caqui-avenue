<script setup lang="ts">
import type { EntradaMenu } from '~/components/AppMenu.vue'
import { iniciais } from '~/utils/moeda'
import { menuDoPapel } from '~/utils/navegacao'

const MENU = 'kaki.menu-aberto'
// Largura em que o menu deixa de ser gaveta e vira coluna ao lado da página (o "md" do Tailwind).
const DESKTOP = '(min-width: 768px)'

const acesso = useAcesso()
const chat = useChat()
const { modo, cromoEscuro, girar } = useAppTheme()
const rota = useRoute()
const versao = `v${useRuntimeConfig().public.appVersion}`

const entrou = computed(() => acesso.papel.value !== null)
const larga = import.meta.client ? window.matchMedia(DESKTOP) : null
const desktop = ref(larga?.matches ?? true)
const gaveta = ref(false)
const colunaAberta = ref(lembrada())
const letraGrande = ref(false)

function lembrada(): boolean {
  try { return localStorage.getItem(MENU) !== 'fechado' } catch { return true }
}

onMounted(() => {
  larga?.addEventListener('change', (e) => { desktop.value = e.matches; gaveta.value = false })
  // Quem recarregou a página com a sessão ainda viva volta a receber as mensagens.
  if (acesso.papel.value === 'cliente') { void chat.atualizar(); chat.acompanhar() }
})

function alternarMenu() {
  if (!desktop.value) { gaveta.value = !gaveta.value; return }
  colunaAberta.value = !colunaAberta.value
  try { localStorage.setItem(MENU, colunaAberta.value ? 'aberto' : 'fechado') } catch { /* vale só nesta visita */ }
}
const menuVisivel = computed(() => (desktop.value ? colunaAberta.value : gaveta.value))
watch(() => rota.path, () => { gaveta.value = false })
watch(letraGrande, (v) => document.documentElement.classList.toggle('letra-grande', v))

const itens = computed<EntradaMenu[]>(() => (acesso.papel.value ? menuDoPapel(acesso.papel.value).map((i) => ({ ...i, selo: i.chave === 'conversa' && chat.caso.value && chat.caso.value.status !== 'resolvido' ? '1' : undefined })) : []))
const icone = computed(() => ({ light: 'i-lucide-sun', mixed: 'i-lucide-contrast', dark: 'i-lucide-moon' })[modo.value])
const rotuloTema = computed(() => ({ light: 'Tema claro', mixed: 'Tema misto (topo e menu escuros)', dark: 'Tema escuro' })[modo.value])
</script>

<template>
  <!-- --menu-w é a largura da coluna do menu, para barras fixas das páginas começarem onde a página começa.
       Topo e rodapé são fixos em todas as telas. A tela de entrada nunca rola: é exatamente o espaço entre eles. -->
  <div class="flex flex-col bg-slate-50 dark:bg-slate-950" :class="entrou ? 'min-h-dvh' : 'h-dvh overflow-hidden'" :style="{ '--menu-w': entrou && desktop && colunaAberta ? '15rem' : '0px' }">
    <header class="fixed inset-x-0 top-0 z-30 h-14 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90" :class="{ dark: cromoEscuro }">
      <div class="flex h-full items-center justify-between gap-3 px-4">
        <div class="flex items-center gap-2">
          <UButton v-if="entrou" color="neutral" variant="ghost" icon="i-lucide-menu" :aria-label="menuVisivel ? 'Fechar o menu' : 'Abrir o menu'" :aria-expanded="menuVisivel" @click="alternarMenu" />
          <NuxtLink to="/" class="text-slate-900 dark:text-white" aria-label="Caqui Invest, página inicial"><AppLogo /></NuxtLink>
          <UBadge v-if="!entrou" color="neutral" variant="subtle" size="sm">{{ versao }}</UBadge>
        </div>
        <div class="flex items-center gap-1 text-sm">
          <UTooltip :text="letraGrande ? 'Letra normal' : 'Letra grande'">
            <UButton color="neutral" variant="ghost" icon="i-lucide-a-large-small" :aria-label="letraGrande ? 'Letra normal' : 'Letra grande'" :aria-pressed="letraGrande" @click="letraGrande = !letraGrande" />
          </UTooltip>
          <UTooltip :text="rotuloTema">
            <UButton color="neutral" variant="ghost" :icon="icone" :aria-label="rotuloTema" @click="girar" />
          </UTooltip>
          <template v-if="entrou">
            <UAvatar :text="iniciais(acesso.nome.value)" size="sm" :alt="acesso.nome.value" class="ml-1" />
            <span class="hidden max-w-40 truncate text-slate-600 sm:inline dark:text-slate-300">{{ acesso.nome.value }}<span v-if="acesso.papel.value === 'suporte'" class="text-slate-400"> · suporte</span></span>
            <UTooltip text="Sair">
              <UButton color="neutral" variant="ghost" icon="i-lucide-log-out" aria-label="Sair" @click="chat.sair()" />
            </UTooltip>
          </template>
        </div>
      </div>
    </header>

    <!-- O menu sempre começa sob o topo, para o botão ficar à vista: coluna ao lado da página em telas largas, gaveta nas estreitas. -->
    <aside
      v-if="entrou"
      class="fixed bottom-11 left-0 top-14 z-[25] flex w-60 flex-col overflow-y-auto border-r border-slate-200 bg-white p-3 transition-transform duration-200 dark:border-slate-800 dark:bg-slate-900"
      :class="[{ dark: cromoEscuro }, menuVisivel ? 'translate-x-0' : '-translate-x-full']"
      aria-label="Menu principal"
      :inert="!menuVisivel"
      @keydown.esc="gaveta = false"
    >
      <AppMenu :itens="itens" />
      <p class="mt-auto pt-4 text-center text-xs text-slate-400 dark:text-slate-500">Kaki {{ versao }}</p>
    </aside>
    <div v-if="entrou && !desktop && gaveta" class="fixed inset-x-0 bottom-11 top-14 z-10 bg-black/40" aria-hidden="true" @click="gaveta = false" />

    <div class="flex min-h-0 flex-1 flex-col pb-11 pt-14 transition-[padding] duration-200" :class="{ 'md:pl-60': entrou && colunaAberta }">
      <UContainer class="w-full flex-1 py-4" :class="entrou ? 'pb-8' : 'overflow-y-auto'">
        <ConnectionBanner class="mb-3" />
        <slot />
      </UContainer>

      <footer class="fixed inset-x-0 bottom-0 z-30 h-11 border-t border-slate-200 bg-white/90 text-sm text-slate-500 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-400" :class="{ dark: cromoEscuro }">
        <UContainer class="flex h-full items-center justify-between gap-3">
          <span class="truncate">Kaki {{ versao }} · assistente da Caqui Invest</span>
          <span class="hidden items-center gap-1.5 sm:flex"><UIcon name="i-lucide-shield-check" class="size-4" />Dados fictícios · CPF sempre mascarado</span>
          <span class="flex items-center gap-1.5"><span class="size-2 rounded-full bg-emerald-500" />Segurança 24h</span>
        </UContainer>
      </footer>
    </div>
  </div>
</template>
