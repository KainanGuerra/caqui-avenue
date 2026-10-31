<script setup lang="ts">
defineProps<{ rotulo: string; valor: number | string; icone: string; tom?: 'primary' | 'error' | 'warning' | 'success' | 'neutral' }>()
</script>

<template>
  <UCard :ui="{ body: 'p-4 sm:p-4' }">
    <div class="flex items-center gap-3">
      <span class="grid size-10 shrink-0 place-items-center rounded-lg" :class="{
        'bg-primary/10 text-primary': !tom || tom === 'primary',
        'bg-error/10 text-error': tom === 'error',
        'bg-warning/10 text-warning': tom === 'warning',
        'bg-success/10 text-success': tom === 'success',
        'bg-elevated text-muted': tom === 'neutral',
      }">
        <UIcon :name="icone" class="size-5" />
      </span>
      <div class="min-w-0">
        <p class="truncate text-sm text-muted">{{ rotulo }}</p>
        <p class="text-2xl font-semibold tabular-nums">{{ valor }}</p>
      </div>
    </div>
  </UCard>
</template>
