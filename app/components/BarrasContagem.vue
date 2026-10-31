<script setup lang="ts">
import type { Contagem } from '~/types'

// Barras horizontais de uma série só (magnitude): uma cor, o rótulo e o número em texto ao lado, para não depender da cor.
const props = defineProps<{ titulo: string; itens: Contagem[]; vazio?: string }>()
const maior = computed(() => Math.max(1, ...props.itens.map((i) => i.total)))
</script>

<template>
  <figure class="space-y-2">
    <figcaption class="text-sm font-medium">{{ titulo }}</figcaption>
    <p v-if="!itens.length" class="text-sm text-muted">{{ vazio ?? 'Sem dados ainda.' }}</p>
    <ul v-else class="space-y-2">
      <li v-for="i in itens" :key="i.chave" class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1" :title="`${i.rotulo}: ${i.total} (${i.pct}%)`">
        <span class="truncate text-sm">{{ i.rotulo }}</span>
        <span class="text-sm tabular-nums text-muted">{{ i.total }} · {{ i.pct }}%</span>
        <span class="col-span-2 h-2 overflow-hidden rounded-full bg-elevated" aria-hidden="true">
          <span class="block h-full rounded-full bg-primary" :style="{ width: `${(100 * i.total) / maior}%` }" />
        </span>
      </li>
    </ul>
  </figure>
</template>
