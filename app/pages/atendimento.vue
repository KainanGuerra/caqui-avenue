<script setup lang="ts">
import type { AtendimentoVista, TipoPedido } from '~/types'
import { dataCurta } from '~/utils/moeda'

useHead({ title: 'Atendimento · Kaki' })

const chat = useChat()
const acesso = useAcesso()

// Tudo o que decide a página (há pessoa agora, retorno, fontes, casos) vem do servidor; a tela só exibe e envia intenção.
// Segurança, especialista e pessoa são registrados aqui; só "Pergunte à Kaki" abre a conversa (D16). A pessoa fica no fim, discreta (D17).
const atendimento = ref<AtendimentoVista | null>(null)
const falhou = ref(false)
const duvida = ref('')
const pedido = usePedido('Atendimento')
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

// O servidor decide a ação (pessoa agora ou protocolo) e devolve o texto com o protocolo; "Minhas conversas" é relida.
async function pedir(tipo: TipoPedido) {
  await pedido.pedir(tipo)
  await carregar()
}

const faqItens = computed(() => (atendimento.value?.faq ?? []).map((f) => ({ label: f.pergunta, value: f.pergunta, artigo: f.artigo })))
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-6 pt-2">
    <header>
      <h1 class="text-[1.75rem] leading-9 font-semibold text-highlighted">Atendimento</h1>
      <p class="text-muted">Pergunte à Kaki ou encontre a resposta aqui. Você não precisa repetir o que já contou.</p>
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
      <PedidoRegistrado v-if="pedido.resultados.value.seguranca" :resultado="pedido.resultados.value.seguranca" />
      <template v-else>
        <UButton color="error" size="lg" block label="Falar com a segurança agora" :loading="pedido.pedindo.value === 'seguranca'" data-testid="pedir-seguranca" @click="pedir('seguranca')" />
        <p v-if="pedido.falhou.value === 'seguranca'" class="text-sm text-error" role="alert">Não consegui registrar agora. Tente de novo em instantes.</p>
      </template>
    </section>

    <template v-if="atendimento">
      <section class="space-y-3 rounded-xl border border-default bg-default p-4" aria-label="Especialista" data-testid="atendimento-especialista">
        <div class="flex items-start gap-3">
          <UIcon name="i-lucide-calendar" class="mt-0.5 size-5 shrink-0 text-muted" />
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-highlighted">{{ atendimento.especialista.pergunta }}</p>
            <p class="text-sm text-muted">
              Isso é com um especialista, com agendamento<template v-if="atendimento.especialista.kbId"> ({{ atendimento.especialista.kbId }})</template>
            </p>
          </div>
        </div>
        <PedidoRegistrado v-if="pedido.resultados.value.especialista" :resultado="pedido.resultados.value.especialista" />
        <template v-else>
          <UButton color="neutral" variant="outline" block label="Pedir um especialista" :loading="pedido.pedindo.value === 'especialista'" data-testid="pedir-especialista" @click="pedir('especialista')" />
          <p v-if="pedido.falhou.value === 'especialista'" class="text-sm text-error" role="alert">Não consegui registrar agora. Tente de novo em instantes.</p>
        </template>
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
        <!-- A resposta abre aqui, com o artigo da base; se a pergunta não tiver artigo atual, ela vai à Kaki. -->
        <UAccordion :items="faqItens" class="rounded-xl border border-default bg-default px-4" :ui="{ label: 'text-base text-highlighted text-left' }" data-testid="faq">
          <template #body="{ item }">
            <ArtigoLeitura v-if="item.artigo" :artigo="item.artigo" />
            <UButton v-else variant="link" color="primary" class="px-0" label="Perguntar à Kaki" @click="perguntar(item.label)" />
          </template>
        </UAccordion>
      </section>

      <!-- A regra 1 pede a saída para uma pessoa visível; ela fica por último, discreta, depois de tudo que resolve sozinho (D17). -->
      <section class="space-y-2 border-t border-default pt-4 text-sm" aria-label="Falar com uma pessoa" data-testid="atendimento-pessoa">
        <PedidoRegistrado v-if="pedido.resultados.value.pessoa" :resultado="pedido.resultados.value.pessoa" :acompanhar="pedido.resultados.value.pessoa.humanoDisponivel" />
        <template v-else>
          <p class="text-muted">
            Não encontrou o que precisava?
            <UButton variant="link" color="primary" class="p-0 align-baseline underline underline-offset-2" label="Prefere falar com uma pessoa?" :loading="pedido.pedindo.value === 'pessoa'" data-testid="pedir-pessoa" @click="pedir('pessoa')" />
          </p>
          <p class="text-xs text-muted">
            {{ atendimento.humanoDisponivel ? `Pessoas atendem ${atendimento.horario}. Quem atender já vê o que você contou.` : `Pessoas atendem ${atendimento.horario}. Registramos agora e retornamos ${atendimento.retorno}.` }}
          </p>
          <p v-if="pedido.falhou.value === 'pessoa'" class="text-error" role="alert">Não consegui registrar agora. Tente de novo em instantes.</p>
        </template>
      </section>
    </template>
    <UAlert v-else-if="falhou" color="warning" variant="subtle" icon="i-lucide-wifi-off" title="Não consegui carregar o atendimento agora." description="A segurança continua 24h no botão acima." :actions="[{ label: 'Tentar de novo', color: 'neutral', variant: 'outline', onClick: carregar }]" />
    <div v-else class="space-y-4"><USkeleton class="h-48" /><USkeleton class="h-40" /></div>
  </div>
</template>
