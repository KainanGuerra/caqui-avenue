<script setup lang="ts">
import type { PosicaoVista } from '~/types'
import { dataCurta, reais } from '~/utils/moeda'

defineProps<{ posicao: PosicaoVista }>()
</script>

<template>
  <UCard :ui="{ body: 'p-4 sm:p-4' }">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="truncate font-medium">{{ posicao.nomeProduto }}</p>
        <p class="text-xs text-muted">{{ posicao.taxaContratada }} · desde {{ dataCurta(posicao.dataAplicacao) }}<template v-if="posicao.vencimento"> · vence {{ dataCurta(posicao.vencimento) }}</template></p>
      </div>
      <UBadge :color="posicao.rendimentoBrutoCentavos >= 0 ? 'success' : 'error'" variant="subtle" class="shrink-0 tabular-nums">
        {{ posicao.rendimentoBrutoCentavos >= 0 ? '+' : '' }}{{ reais(posicao.rendimentoBrutoCentavos) }}
      </UBadge>
    </div>
    <dl class="mt-3 grid grid-cols-2 gap-2 text-sm">
      <div><dt class="text-muted">Aplicado</dt><dd class="font-medium tabular-nums">{{ reais(posicao.valorAplicadoCentavos) }}</dd></div>
      <div><dt class="text-muted">Saldo bruto</dt><dd class="font-medium tabular-nums">{{ reais(posicao.saldoBrutoCentavos) }}</dd></div>
    </dl>
  </UCard>
</template>
