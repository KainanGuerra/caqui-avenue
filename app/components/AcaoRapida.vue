<script setup lang="ts">
defineProps<{ icone: string; titulo: string; subtitulo: string }>()
</script>

<template>
  <button type="button" class="flex min-h-11 flex-col items-start gap-3 rounded-xl border border-default bg-default p-4 text-left transition hover:bg-elevated">
    <span class="grid size-10 place-items-center rounded-lg bg-marfim-300 text-highlighted dark:bg-marfim-900"><UIcon :name="icone" class="size-5" /></span>
    <span class="text-sm font-semibold text-highlighted">{{ titulo }}</span>
    <span class="text-xs text-muted first-letter:uppercase">{{ subtitulo }}</span>
  </button>
</template>
