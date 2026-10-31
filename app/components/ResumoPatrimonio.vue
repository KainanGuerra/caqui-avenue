<script setup lang="ts">
import type { ContaVista } from '~/types'
import { dataCurta, percentualComSinal, reaisComSinal } from '~/utils/moeda'

const props = defineProps<{ conta: ContaVista }>()
const { oculto, valor } = useOcultarValores()

const resultado = computed(() => {
  const r = props.conta.resultadoCentavos
  return {
    texto: oculto.value ? valor(r) : `${reaisComSinal(r)} (${percentualComSinal(props.conta.resultadoPercentual)})`,
    tom: r > 0 ? 'text-success' : 'text-highlighted',
    icone: r < 0 ? 'i-lucide-trending-down' : 'i-lucide-trending-up',
  }
})
</script>

<template>
  <UCard variant="outline" class="bg-default" :ui="{ body: 'space-y-4 sm:p-6' }" data-testid="resumo-patrimonio">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h2 class="font-sans text-sm font-normal text-muted">Patrimônio atual</h2>
      <UButton
        variant="ghost" color="neutral" size="sm"
        :icon="oculto ? 'i-lucide-eye' : 'i-lucide-eye-off'"
        :label="oculto ? 'Mostrar valores' : 'Ocultar valores'"
        :aria-pressed="oculto"
        @click="oculto = !oculto"
      />
    </div>
    <div>
      <p class="text-[1.75rem] leading-9 font-semibold text-highlighted tabular-nums" data-valor>{{ valor(conta.patrimonioCentavos) }}</p>
      <p class="text-xs text-muted">Atualizado em {{ dataCurta(conta.atualizadoEm) }}</p>
    </div>
    <dl class="flex flex-wrap gap-x-6 gap-y-3">
      <div class="min-w-[8.75rem] flex-1">
        <dt class="text-sm text-muted">Investido</dt>
        <dd class="font-semibold tabular-nums">{{ valor(conta.totalAplicadoCentavos) }}</dd>
      </div>
      <div class="min-w-[8.75rem] flex-1">
        <dt class="text-sm text-muted">Saldo disponível</dt>
        <dd class="font-semibold tabular-nums">{{ valor(conta.saldoEmContaCentavos) }}</dd>
      </div>
      <div class="min-w-[8.75rem] flex-1">
        <dt class="text-sm text-muted">Resultado desde a aplicação</dt>
        <dd class="flex items-center gap-1 font-semibold tabular-nums" :class="resultado.tom">
          <UIcon :name="resultado.icone" class="size-4 shrink-0" aria-hidden="true" />{{ resultado.texto }}
        </dd>
      </div>
    </dl>
    <p class="text-xs text-muted">Patrimônio é o saldo bruto das posições mais o saldo em conta. Valores brutos, antes do imposto de renda. Fonte: posições da conta.</p>
  </UCard>
</template>
