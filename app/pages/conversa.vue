<script setup lang="ts">
useHead({ title: 'Conversa · Kaki' })
definePageMeta({ preencherAltura: true })

const chat = useChat()
const acesso = useAcesso()
const texto = ref('')
const rolagem = ref<HTMLElement | null>(null)

// A tela pode ser aberta direto (recarregar a página): relê a conversa e retoma o acompanhamento.
onMounted(() => { void chat.atualizar(); void chat.carregarSugestoes(); chat.acompanhar() })

// A cada tecla (com uma pausa curta) as sugestões se ajustam ao que está sendo digitado.
let pausa: ReturnType<typeof setTimeout> | undefined
watch(texto, (v) => {
  clearTimeout(pausa)
  pausa = setTimeout(() => chat.carregarSugestoes(v), 250)
})
onBeforeUnmount(() => clearTimeout(pausa))

watch([() => chat.mensagens.value.length, () => chat.enviando.value], async () => {
  await nextTick()
  rolagem.value?.scrollTo({ top: rolagem.value.scrollHeight, behavior: 'smooth' })
})

const comAtendente = computed(() => chat.caso.value?.status === 'assumido')
// Quando um atendente assume (ou o caso se resolve), as sugestões mudam: o servidor devolve vazio com atendente na conversa.
watch(() => chat.caso.value?.status, () => { void chat.carregarSugestoes(texto.value) })
const statusCaso = computed(() => {
  const c = chat.caso.value
  return !c ? '' : c.status === 'assumido' ? `com ${c.atendente ?? 'um atendente'}` : c.status === 'resolvido' ? 'resolvido' : 'na fila'
})
const nomeAtendente = computed(() => chat.caso.value?.atendente ?? null)

async function enviar(t: string) {
  texto.value = ''
  await chat.enviar(t)
}
</script>

<template>
  <!-- A página rola por dentro: a área do chat tem a altura inteira disponível e os controles da demonstração ficam abaixo dela. -->
  <div class="rolagem-chat mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col gap-3 overflow-y-auto [container-type:size]">
    <section class="flex shrink-0 basis-full flex-col gap-3 max-sm:min-h-fit sm:min-h-[26rem]" aria-label="Conversa com a Kaki">
      <UAlert v-if="chat.caso.value && chat.caso.value.status !== 'resolvido'" color="primary" variant="subtle" icon="i-lucide-ticket" role="status" :title="`Protocolo ${chat.caso.value.protocolo}: ${statusCaso}`" :description="comAtendente ? `Você está conversando com ${nomeAtendente ?? 'uma pessoa da Caqui'}. A Kaki fica em silêncio enquanto isso.` : 'Você não precisa repetir nada: quem atende vê esta conversa.'" :ui="{ description: 'max-sm:hidden' }" />

      <!-- No celular a lista de mensagens fica com pelo menos 55% da altura disponível (cqh mede a área que rola, acima).
           Se cabeçalho e rodapé não cabem no resto (letra grande), o card cresce e a página rola até o campo, sem cortá-lo. -->
      <UCard class="flex flex-1 flex-col max-sm:min-h-fit sm:min-h-0" :ui="{ root: 'flex flex-col flex-1 max-sm:min-h-fit sm:min-h-0', body: 'flex min-h-0 flex-1 flex-col p-0 sm:p-0 max-sm:min-h-[55cqh]', header: 'p-3 sm:p-3', footer: 'p-3 sm:p-3' }">
        <template #header>
          <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span class="grid size-8 shrink-0 place-items-center rounded-full bg-primary font-semibold text-inverted sm:size-10" aria-hidden="true">K</span>
            <div class="min-w-0 flex-1">
              <p class="truncate font-semibold leading-tight">Kaki <span class="font-normal text-muted">· assistente virtual da Caqui</span></p>
              <p class="truncate text-xs text-muted max-sm:hidden">Conversando como {{ acesso.nome.value }}</p>
            </div>
            <!-- Selo e botão não cabem lado a lado em 375px: no celular o botão sobe para a linha do nome e o selo vai logo abaixo. -->
            <UBadge :color="chat.humanoDisponivel.value ? 'success' : 'warning'" variant="subtle" :icon="chat.humanoDisponivel.value ? 'i-lucide-headset' : 'i-lucide-moon'" class="max-sm:order-last">
              {{ chat.humanoDisponivel.value ? 'Pessoa disponível agora' : 'Pessoa volta às 8h · segurança 24h' }}
            </UBadge>
            <UButton color="neutral" variant="outline" icon="i-lucide-headset" label="Falar com uma pessoa" class="max-sm:min-h-11" :disabled="chat.enviando.value || comAtendente" data-testid="pedir-pessoa" @click="enviar('Quero falar com uma pessoa')" />
          </div>
        </template>

        <!-- contain:size: a conversa longa rola aqui dentro em vez de esticar o card (que mede só cabeçalho, 55% e rodapé). -->
        <div ref="rolagem" class="rolagem-chat flex-1 space-y-3 overflow-y-auto bg-elevated/40 p-3 [contain:size] sm:p-4" aria-live="polite" aria-label="Mensagens da conversa" data-testid="mensagens">
        <ChatMensagem :msg="{ papel: 'agente', texto: acesso.saudacao.value, em: '' }" />
        <ChatMensagem v-for="(m, i) in chat.mensagens.value" :key="i" :msg="m" :atendente="nomeAtendente" :cliente="acesso.nome.value" />
          <p v-if="chat.enviando.value && !comAtendente" class="flex items-center gap-2 text-sm italic text-muted"><UIcon name="i-lucide-loader-circle" class="size-4 animate-spin" />Kaki está escrevendo…</p>
        </div>

        <template #footer>
          <div v-if="chat.sugestoes.value.length && !comAtendente" class="mb-2" data-testid="sugestoes">
            <p class="mb-1 text-xs font-medium uppercase tracking-wide text-muted max-sm:sr-only">{{ chat.sugestoesPorDigitacao.value ? 'Parecido com o que você digita' : 'Sugestões para você' }}</p>
            <!-- Uma linha só, rolando para o lado; a barra fica escondida, mas cada sugestão continua alcançável pelo Tab. -->
            <div class="flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Sugestões de pergunta">
              <UButton v-for="s in chat.sugestoes.value" :key="s" :label="s" color="neutral" variant="outline" size="xs" class="shrink-0 whitespace-nowrap rounded-full" :disabled="chat.enviando.value" @click="enviar(s)" />
            </div>
          </div>
          <form class="flex gap-2" @submit.prevent="enviar(texto)">
            <label for="mensagem" class="sr-only">Sua mensagem</label>
            <UInput id="mensagem" v-model="texto" class="flex-1" size="lg" maxlength="2000" autocomplete="off" :placeholder="comAtendente ? `Escreva para ${nomeAtendente ?? 'a pessoa que atende'}` : 'Escreva sua mensagem'" :disabled="chat.enviando.value" data-testid="conversa-entrada" />
            <UButton type="submit" size="lg" icon="i-lucide-send-horizontal" label="Enviar" :disabled="chat.enviando.value || !texto.trim()" data-testid="conversa-enviar" />
          </form>
          <p class="mt-2 text-xs text-muted max-sm:hidden">Dados fictícios · informações pessoais sempre mascaradas</p>
        </template>
      </UCard>

      <UAlert v-if="chat.erro.value" color="error" variant="subtle" icon="i-lucide-triangle-alert" role="alert" :title="chat.erro.value" />
    </section>

    <details class="shrink-0 text-sm text-muted">
      <summary class="cursor-pointer">Controles da demonstração</summary>
      <div class="mt-2 flex flex-wrap items-center gap-2">
        <label for="horario">Simular horário (dia 18/11/2026):</label>
        <UInput id="horario" v-model="chat.horarioSimulado.value" type="time" size="sm" class="w-32" />
        <UButton size="xs" color="neutral" variant="outline" label="Usar relógio do servidor" @click="chat.horarioSimulado.value = ''" />
        <span class="text-xs">Ex.: 14:00 (pessoa disponível) e 23:00 (fora do horário).</span>
      </div>
    </details>
  </div>
</template>
