<script setup lang="ts">
// O rótulo quebra linha em vez de ser cortado, e o cartão ocupa a altura toda da linha da grade:
// cartões lado a lado ficam do mesmo tamanho mesmo com rótulos de tamanhos diferentes.
defineProps<{ rotulo: string; valor: number | string; icone: string; tom?: 'primary' | 'error' | 'warning' | 'success' | 'neutral'; dica?: string }>()
</script>

<template>
  <UCard class="h-full" :ui="{ body: 'p-4 sm:p-4' }">
    <div class="flex items-start gap-3">
      <span class="grid size-10 shrink-0 place-items-center rounded-lg" :class="{
        'bg-primary/10 text-primary': !tom || tom === 'primary',
        'bg-error/10 text-error': tom === 'error',
        'bg-warning/10 text-warning': tom === 'warning',
        'bg-success/10 text-success': tom === 'success',
        'bg-elevated text-muted': tom === 'neutral',
      }">
        <UIcon :name="icone" class="size-5" />
      </span>
      <div class="min-w-0 flex-1">
        <p class="text-sm leading-snug text-muted">{{ rotulo }}</p>
        <p class="mt-0.5 break-words text-2xl font-semibold leading-tight tabular-nums">{{ valor }}</p>
        <p v-if="dica" class="mt-1 text-xs leading-snug text-muted">{{ dica }}</p>
      </div>
    </div>
  </UCard>
</template>
