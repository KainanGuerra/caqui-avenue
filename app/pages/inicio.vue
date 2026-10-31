<script setup lang="ts">
import { dataCurta, reais } from '~/utils/moeda'

useHead({ title: 'Início · Kaki' })

const chat = useChat()
const acesso = useAcesso()
// A conta vem do servidor, só do cliente da sessão. Ao voltar de outra tela ela é relida.
onMounted(() => { void chat.carregarConta(); void chat.atualizar(); chat.acompanhar() })

const conta = chat.conta
const primeiroNome = computed(() => (acesso.cliente.value?.nome ?? '').split(' ')[0])
const statusCaso = computed(() => {
  const c = chat.caso.value
  return !c ? '' : c.status === 'assumido' ? `com ${c.atendente ?? 'um atendente'}` : c.status === 'resolvido' ? 'resolvido' : 'na fila'
})
async function pedirPessoa() {
  await navigateTo('/conversa')
  await chat.enviar('Quero falar com uma pessoa')
}
</script>

<template>
  <div class="space-y-4 pt-2">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold">Olá, {{ primeiroNome }}</h1>
        <p class="text-sm text-muted">Seu resumo em {{ dataCurta('2026-11-18') }}. Valores brutos, antes do imposto de renda.</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <UButton to="/conversa" icon="i-lucide-message-circle" size="lg" label="Conversar com a Kaki" data-testid="ir-conversa" />
        <UButton color="neutral" variant="outline" icon="i-lucide-headset" size="lg" label="Falar com uma pessoa" @click="pedirPessoa" />
      </div>
    </div>

    <UAlert v-if="chat.caso.value && chat.caso.value.status !== 'resolvido'" color="primary" variant="subtle" icon="i-lucide-ticket" :title="`Protocolo ${chat.caso.value.protocolo}: ${statusCaso}`" description="Você não precisa repetir nada: quem atende vê a sua conversa." role="status">
      <template #actions><UButton to="/conversa" size="sm" color="primary" variant="outline" label="Abrir conversa" /></template>
    </UAlert>

    <div v-if="conta" class="grid gap-3 sm:grid-cols-3">
      <KpiCard rotulo="Saldo em conta" :valor="reais(conta.saldoEmContaCentavos)" icone="i-lucide-wallet" />
      <KpiCard rotulo="Total aplicado" :valor="reais(conta.totalAplicadoCentavos)" icone="i-lucide-piggy-bank" tom="neutral" />
      <KpiCard rotulo="Saldo bruto investido" :valor="reais(conta.totalBrutoCentavos)" icone="i-lucide-trending-up" tom="success" />
    </div>
    <div v-else class="grid gap-3 sm:grid-cols-3"><USkeleton v-for="i in 3" :key="i" class="h-20" /></div>

    <div class="grid gap-4 lg:grid-cols-5">
      <section class="space-y-2 lg:col-span-3" aria-label="Investimentos">
        <h2 class="text-sm font-medium text-muted">Seus investimentos</h2>
        <div v-if="conta?.posicoes.length" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <PosicaoCard v-for="p in conta.posicoes" :key="p.id" :posicao="p" />
        </div>
        <UCard v-else-if="conta"><p class="py-4 text-center text-sm text-muted">Você ainda não tem investimentos. Pergunte à Kaki como cada produto funciona.</p></UCard>
      </section>
      <section class="space-y-2 lg:col-span-2" aria-label="Últimas operações">
        <h2 class="text-sm font-medium text-muted">Últimas operações</h2>
        <UCard>
          <ul v-if="conta?.operacoes.length" class="-my-3 divide-y divide-default">
            <OperacaoLinha v-for="o in conta.operacoes" :key="o.id" :operacao="o" />
          </ul>
          <p v-else-if="conta" class="py-4 text-center text-sm text-muted">Nenhuma operação por aqui.</p>
        </UCard>
      </section>
    </div>
  </div>
</template>
