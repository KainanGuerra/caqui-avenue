<script setup lang="ts">
import type { AtendimentoVista } from '~/types'
import { dataCurta } from '~/utils/moeda'
import { PEDIDOS } from '~/utils/pedidos'

useHead({ title: 'Atendimento · Kaki' })

const chat = useChat()
const acesso = useAcesso()

// Tudo o que decide a página (há pessoa agora, retorno, fontes, casos) vem do servidor; a tela só exibe e envia intenção.
const atendimento = ref<AtendimentoVista | null>(null)
const falhou = ref(false)
const duvida = ref('')
const protocoloRegistrado = ref('')
const SUGESTOES_NO_CARD = 3

async function carregar() {
  if (!acesso.sessaoId.value) return
  try {
    atendimento.value = await $fetch<AtendimentoVista>(`/api/chat/${acesso.sessaoId.value}/atendimento`)
    falhou.value = false
  } catch {
    falhou.value = true
  }
}
onMounted(() => { void carregar(); void chat.carregarSugestoes() })

const sugestoes = computed(() => chat.sugestoes.value.slice(0, SUGESTOES_NO_CARD))

async function perguntar(texto: string) {
  if (!texto.trim()) return
  await navigateTo('/conversa')
  await chat.enviar(texto)
}

// Fora do horário o pedido de pessoa vira protocolo no servidor; ele só aparece aqui quando a resposta o traz.
async function registrarDemanda() {
  const r = await chat.enviar(PEDIDOS.pessoa)
  if (r?.protocolo) protocoloRegistrado.value = r.protocolo
  await carregar()
}
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-6 pt-2">
    <header>
      <h1 class="text-[1.75rem] leading-9 font-semibold text-highlighted">Atendimento</h1>
      <p class="text-muted">Pergunte à Kaki ou fale com uma pessoa. Você não precisa repetir o que já contou.</p>
    </header>

    <section class="space-y-3 rounded-xl border border-default bg-default p-4" aria-labelledby="titulo-pergunte">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-sparkles" class="size-6 shrink-0 text-primary" />
        <h2 id="titulo-pergunte" class="text-[1.375rem] leading-[1.875rem] font-semibold text-highlighted">Pergunte à Kaki</h2>
      </div>
      <p class="text-sm text-muted">Toda resposta mostra de onde veio. Se a Kaki não souber, ela diz e chama uma pessoa.</p>
      <form class="flex items-end gap-2" @submit.prevent="perguntar(duvida)">
        <UFormField label="Sua dúvida" name="duvida" class="min-w-0 flex-1">
          <UInput v-model="duvida" size="xl" class="w-full" placeholder="Ex.: quando cai meu resgate?" data-testid="atendimento-duvida" />
        </UFormField>
        <UButton type="submit" icon="i-lucide-send" size="xl" square aria-label="Enviar dúvida para a Kaki" :disabled="!duvida.trim()" />
      </form>
      <div v-if="sugestoes.length" class="space-y-2">
        <p class="text-xs text-muted">Sugestões</p>
        <div class="flex flex-wrap gap-2">
          <UButton v-for="s in sugestoes" :key="s" :label="s" color="neutral" variant="outline" size="sm" class="max-w-full" :ui="{ label: 'truncate' }" @click="perguntar(s)" />
        </div>
      </div>
    </section>

    <section class="space-y-3 rounded-xl bg-error/10 p-4" aria-labelledby="titulo-seguranca" data-testid="atendimento-seguranca">
      <div class="flex items-center gap-2 text-error">
        <UIcon name="i-lucide-shield-alert" class="size-5 shrink-0" />
        <h2 id="titulo-seguranca" class="text-sm font-semibold">Suspeita de golpe? Segurança 24h, sem fila</h2>
      </div>
      <p class="text-sm text-default">A Caqui nunca liga pedindo código, senha, Pix de teste ou app de acesso remoto.</p>
      <UButton color="error" size="lg" block label="Falar com a segurança agora" @click="perguntar(PEDIDOS.seguranca)" />
    </section>

    <template v-if="atendimento">
      <section class="space-y-3 rounded-xl border border-default bg-default p-4" aria-labelledby="titulo-pessoa" data-testid="atendimento-pessoa">
        <div class="flex items-start gap-2">
          <span class="mt-2.5 size-2.5 shrink-0 rounded-full" :class="atendimento.humanoDisponivel ? 'bg-success' : 'bg-(--ui-border-accented)'" aria-hidden="true" />
          <h2 id="titulo-pessoa" class="text-[1.375rem] leading-[1.875rem] font-semibold text-highlighted">
            {{ atendimento.humanoDisponivel ? 'Uma pessoa pode te atender agora' : `Atendimento volta ${atendimento.retorno}` }}
          </h2>
        </div>

        <template v-if="atendimento.humanoDisponivel">
          <p class="text-sm text-muted">Quem atender já vê esta conversa e seu protocolo.</p>
          <UButton size="lg" block label="Falar com uma pessoa" @click="perguntar(PEDIDOS.pessoa)" />
        </template>
        <template v-else>
          <p v-if="protocoloRegistrado" class="text-sm text-default" role="status" data-testid="protocolo-registrado">
            Registramos sua demanda no protocolo <strong class="font-semibold whitespace-nowrap text-highlighted">{{ protocoloRegistrado }}</strong> e retornamos {{ atendimento.retorno }}.
          </p>
          <template v-else>
            <p class="text-sm text-muted">Pessoas atendem {{ atendimento.horario }}, todos os dias. Registre sua demanda e retornamos {{ atendimento.retorno }}.</p>
            <UButton size="lg" block label="Registrar minha demanda" :loading="chat.enviando.value" @click="registrarDemanda" />
          </template>
          <p v-if="chat.erro.value" class="text-sm text-error" role="alert">{{ chat.erro.value }}</p>
        </template>

        <button type="button" class="flex w-full items-center gap-3 border-t border-default pt-3 text-left" data-testid="atendimento-especialista" @click="perguntar(atendimento.especialista.pergunta)">
          <UIcon name="i-lucide-calendar" class="size-5 shrink-0 text-muted" />
          <span class="min-w-0 flex-1">
            <span class="block text-sm font-semibold text-highlighted">{{ atendimento.especialista.pergunta }}</span>
            <span class="block text-sm text-muted">
              Isso é com um especialista, com agendamento<template v-if="atendimento.especialista.kbId"> ({{ atendimento.especialista.kbId }})</template>
            </span>
          </span>
          <UIcon name="i-lucide-chevron-right" class="size-5 shrink-0 text-muted" />
        </button>
      </section>

      <section v-if="atendimento.casos.length" class="space-y-3" aria-labelledby="titulo-conversas" data-testid="minhas-conversas">
        <h2 id="titulo-conversas" class="text-[1.375rem] leading-[1.875rem] font-semibold text-highlighted">Minhas conversas</h2>
        <ul class="divide-y divide-default rounded-xl border border-default bg-default">
          <li v-for="c in atendimento.casos" :key="c.protocolo" class="flex items-center gap-3 p-4">
            <span class="min-w-0 flex-1">
              <span class="block font-semibold text-highlighted first-letter:uppercase">{{ c.motivo }}</span>
              <span class="block text-sm text-muted">{{ c.protocolo }} · {{ dataCurta(c.criadoEm) }}</span>
            </span>
            <UBadge v-if="c.status === 'respondido'" color="success" variant="subtle" icon="i-lucide-circle-check" class="shrink-0">Respondido</UBadge>
            <UBadge v-else color="neutral" variant="subtle" icon="i-lucide-info" class="shrink-0">Em andamento</UBadge>
          </li>
        </ul>
      </section>

      <section class="space-y-3" aria-labelledby="titulo-faq">
        <h2 id="titulo-faq" class="text-[1.375rem] leading-[1.875rem] font-semibold text-highlighted">Perguntas frequentes</h2>
        <ul class="divide-y divide-default rounded-xl border border-default bg-default">
          <li v-for="f in atendimento.faq" :key="f.pergunta">
            <button type="button" class="flex w-full items-center gap-3 p-4 text-left transition hover:bg-elevated" @click="perguntar(f.pergunta)">
              <span class="min-w-0 flex-1">
                <span class="block text-highlighted">{{ f.pergunta }}</span>
                <span v-if="f.kbId" class="block text-xs text-muted">Fonte: {{ f.kbId }}</span>
              </span>
              <UIcon name="i-lucide-chevron-right" class="size-5 shrink-0 text-muted" />
            </button>
          </li>
        </ul>
      </section>
    </template>
    <UAlert v-else-if="falhou" color="warning" variant="subtle" icon="i-lucide-wifi-off" title="Não consegui carregar o atendimento agora." description="A segurança continua 24h no botão acima." :actions="[{ label: 'Tentar de novo', color: 'neutral', variant: 'outline', onClick: carregar }]" />
    <div v-else class="space-y-4"><USkeleton class="h-48" /><USkeleton class="h-40" /></div>
  </div>
</template>
