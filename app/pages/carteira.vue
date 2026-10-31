<script setup lang="ts">
useHead({ title: 'Carteira · Kaki' })

const chat = useChat()
// Posições, prazos de resgate e operações vêm do servidor, só do cliente da sessão (regra 10). Relida ao abrir.
onMounted(() => { void chat.carregarConta() })
const conta = chat.conta
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-6 pt-2">
    <header>
      <h1 class="text-[1.75rem] leading-9 font-semibold text-highlighted">Carteira</h1>
      <p class="text-muted">Suas posições, quando cai cada resgate e as últimas operações.</p>
    </header>

    <template v-if="conta">
      <EmAndamentoCard v-for="op in conta.emAndamento" :key="op.operacaoId" :operacao="op" :hoje="conta.hoje" />

      <section class="space-y-3" aria-labelledby="titulo-posicoes">
        <h2 id="titulo-posicoes" class="text-xl font-semibold text-highlighted">Posições</h2>
        <p v-if="!conta.posicoes.length" class="text-sm text-muted">Você ainda não tem posições.</p>
        <PosicaoCard v-for="p in conta.posicoes" :key="p.id" :posicao="p" :hoje="conta.hoje" />
        <p v-if="conta.posicoes.length" class="text-xs text-muted">Valores brutos, antes do imposto de renda.</p>
      </section>

      <section class="space-y-3" aria-labelledby="titulo-operacoes">
        <h2 id="titulo-operacoes" class="text-xl font-semibold text-highlighted">Operações</h2>
        <p v-if="!conta.operacoes.length" class="text-sm text-muted">Nenhuma operação registrada.</p>
        <ul v-else class="divide-y divide-default rounded-xl border border-default bg-default px-4" data-testid="operacoes">
          <OperacaoLinha v-for="op in conta.operacoes" :key="op.id" :operacao="op" />
        </ul>
      </section>
    </template>
    <div v-else class="space-y-4"><USkeleton class="h-32" /><USkeleton class="h-48" /></div>
  </div>
</template>
