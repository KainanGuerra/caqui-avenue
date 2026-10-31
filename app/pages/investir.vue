<script setup lang="ts">
import type { InvestirVista } from '~/types'

useHead({ title: 'Investir · Kaki' })

// Produtos na ordem dos dados, com textos do servidor. Aplicar não existe neste corte: quem quer saber onde investir
// pede um especialista aqui mesmo (regra 4), sem passar pela conversa.
const vista = ref<InvestirVista | null>(null)
const falhou = ref(false)
const pedido = usePedido('Investir')

async function carregar() {
  try {
    vista.value = await $fetch<InvestirVista>('/api/investir')
    falhou.value = false
  } catch {
    falhou.value = true
  }
}
onMounted(carregar)

const artigoDe = (kbId: string | null) => vista.value?.artigos.find((a) => a.id === kbId) ?? null
const aberto = ref<string | null>(null)
const alternar = (codigo: string) => { aberto.value = aberto.value === codigo ? null : codigo }
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-6 pt-2">
    <header class="space-y-2">
      <h1 class="text-[1.75rem] leading-9 font-semibold text-highlighted">Investir</h1>
      <p class="text-muted">Conheça os produtos da Caqui: quanto rendem, quando dá para resgatar e como é o imposto.</p>
      <UBadge color="neutral" variant="subtle" icon="i-lucide-sprout">Conteúdo educativo, não é recomendação</UBadge>
    </header>

    <template v-if="vista">
      <section class="space-y-3 rounded-xl bg-marfim-300 p-4 text-highlighted dark:bg-marfim-900" aria-labelledby="titulo-especialista" data-testid="investir-especialista">
        <div class="flex items-start gap-3">
          <UIcon name="i-lucide-calendar" class="mt-0.5 size-5 shrink-0" />
          <div class="min-w-0">
            <h2 id="titulo-especialista" class="font-semibold">{{ vista.especialista.pergunta }}</h2>
            <p class="text-sm text-toned">
              Quem indica onde investir é um especialista em investimentos, com agendamento.<template v-if="vista.especialista.kbId"> Fonte: {{ vista.especialista.kbId }}.</template>
            </p>
          </div>
        </div>
        <PedidoRegistrado v-if="pedido.resultados.value.especialista" :resultado="pedido.resultados.value.especialista" />
        <template v-else>
          <UButton size="lg" block label="Pedir um especialista" :loading="pedido.pedindo.value === 'especialista'" data-testid="pedir-especialista" @click="pedido.pedir('especialista')" />
          <p v-if="pedido.falhou.value === 'especialista'" class="text-sm text-error" role="alert">Não consegui registrar agora. Tente de novo em instantes.</p>
        </template>
      </section>

      <section class="space-y-3" aria-labelledby="titulo-produtos">
        <h2 id="titulo-produtos" class="text-xl font-semibold text-highlighted">Produtos</h2>
        <ul class="space-y-3">
          <li v-for="p in vista.produtos" :key="p.codigo" class="rounded-xl border border-default bg-default p-4" data-testid="produto">
            <p class="font-semibold text-highlighted">{{ p.nome }}</p>
            <dl class="mt-2 space-y-1 text-sm">
              <div class="flex gap-2"><dt class="w-28 shrink-0 text-muted">Rentabilidade</dt><dd class="min-w-0">{{ p.rentabilidade }}</dd></div>
              <div class="flex gap-2"><dt class="w-28 shrink-0 text-muted">Resgate</dt><dd class="min-w-0">{{ p.liquidez }}</dd></div>
              <div class="flex gap-2"><dt class="w-28 shrink-0 text-muted">Imposto</dt><dd class="min-w-0">{{ p.imposto }}</dd></div>
            </dl>
            <template v-if="artigoDe(p.kbId)">
              <UButton
                variant="link" color="primary" class="mt-2 px-0"
                :trailing-icon="aberto === p.codigo ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                :label="aberto === p.codigo ? 'Esconder explicação' : `Como funciona (${p.kbId})`"
                :aria-expanded="aberto === p.codigo"
                @click="alternar(p.codigo)"
              />
              <div v-if="aberto === p.codigo" class="mt-2 border-t border-default pt-3">
                <ArtigoLeitura :artigo="artigoDe(p.kbId)!" />
              </div>
            </template>
          </li>
        </ul>
      </section>
    </template>
    <UAlert v-else-if="falhou" color="warning" variant="subtle" icon="i-lucide-wifi-off" title="Não consegui carregar os produtos agora." :actions="[{ label: 'Tentar de novo', color: 'neutral', variant: 'outline', onClick: carregar }]" />
    <div v-else class="space-y-4"><USkeleton class="h-32" /><USkeleton class="h-48" /></div>
  </div>
</template>
