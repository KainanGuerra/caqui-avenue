<script setup lang="ts">
useHead({ title: 'Início · Kaki' })

const chat = useChat()
const acesso = useAcesso()
// A conta vem do servidor, só do cliente da sessão, já com patrimônio, etapas, alocação e avisos. Ao voltar de outra tela ela é relida.
onMounted(() => { void chat.carregarConta(); void chat.atualizar(); chat.acompanhar() })

const conta = chat.conta
const primeiroNome = computed(() => (acesso.cliente.value?.nome ?? '').split(' ')[0])
const statusCaso = computed(() => {
  const c = chat.caso.value
  return !c ? '' : c.status === 'assumido' ? `com ${c.atendente ?? 'um atendente'}` : c.status === 'resolvido' ? 'resolvido' : 'na fila'
})
const casoAberto = computed(() => chat.caso.value && chat.caso.value.status !== 'resolvido')
// Nenhuma ação abre a conversa: cada uma leva à página que responde (D16). A conversa fica no Atendimento.
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-6 pt-2">
    <header>
      <h1 class="text-[1.75rem] leading-9 font-semibold text-highlighted">Olá, {{ primeiroNome }}</h1>
      <p class="text-muted">Veja como seu patrimônio mudou.</p>
    </header>

    <template v-if="conta">
      <EmAndamentoCard v-for="op in conta.emAndamento" :key="op.operacaoId" :operacao="op" :hoje="conta.hoje" @detalhes="navigateTo('/carteira')" />

      <ResumoPatrimonio :conta="conta" />

      <div v-if="conta.avisos.length || casoAberto" class="space-y-3">
        <UAlert
          v-for="aviso in conta.avisos" :key="aviso.data"
          color="warning" variant="subtle" icon="i-lucide-calendar-x"
          :title="aviso.titulo" :description="`${aviso.detalhe} Fonte: ${aviso.fontes.join(' · ')}.`"
          :ui="{ title: 'text-highlighted', description: 'text-default' }"
          data-testid="aviso-feriado"
        />
        <UAlert v-if="casoAberto && chat.caso.value" color="primary" variant="subtle" icon="i-lucide-ticket" :title="`Protocolo ${chat.caso.value.protocolo}: ${statusCaso}`" description="Você não precisa repetir nada: quem atende vê a sua conversa." role="status">
          <template #actions><UButton to="/conversa" size="sm" color="primary" variant="outline" label="Abrir conversa" /></template>
        </UAlert>
      </div>
    </template>
    <div v-else class="space-y-4"><USkeleton class="h-40" /><USkeleton class="h-48" /></div>

    <section class="space-y-3" aria-labelledby="titulo-acoes">
      <h2 id="titulo-acoes" class="text-xl font-semibold text-highlighted">O que você quer fazer?</h2>
      <div class="grid grid-cols-2 gap-3">
        <AcaoRapida icone="i-lucide-plus" titulo="Investir" subtitulo="Conheça os produtos" data-testid="acao-investir" @click="navigateTo('/investir')" />
        <AcaoRapida icone="i-lucide-arrow-up-right" titulo="Resgatar" subtitulo="Veja quando o dinheiro cai" data-testid="acao-resgatar" @click="navigateTo('/carteira')" />
        <AcaoRapida class="col-span-2" icone="i-lucide-message-circle" titulo="Atendimento" :subtitulo="chat.horarioAtendimento.value ? `${chat.horarioAtendimento.value}, todos os dias` : 'Pergunte à Kaki'" data-testid="acao-atendimento" @click="navigateTo('/atendimento')" />
      </div>
    </section>

    <AlocacaoBarra v-if="conta?.alocacao.length" :fatias="conta.alocacao" :total-bruto-centavos="conta.totalBrutoCentavos" />

    <section class="space-y-3" aria-labelledby="titulo-proximos">
      <h2 id="titulo-proximos" class="text-xl font-semibold text-highlighted">Próximos passos</h2>
      <NuxtLink to="/aprender" class="block space-y-2 rounded-xl border border-default bg-default p-4 transition hover:bg-elevated sm:p-5" data-testid="conteudo-educativo">
        <UBadge color="neutral" variant="subtle" icon="i-lucide-sprout">Conteúdo educativo, não é recomendação</UBadge>
        <p class="font-semibold text-highlighted">Conheça como funciona a liquidez antes de investir.</p>
        <p class="flex items-center justify-between gap-2 text-sm text-muted">Entenda quando você pode resgatar e quanto tempo o dinheiro leva para cair.<UIcon name="i-lucide-chevron-right" class="size-5 shrink-0" /></p>
      </NuxtLink>
    </section>
  </div>
</template>