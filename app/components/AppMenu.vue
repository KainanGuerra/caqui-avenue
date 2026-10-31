<script setup lang="ts">
import { itemAtivo, type ItemMenu } from '~/utils/navegacao'

export type EntradaMenu = ItemMenu & { selo?: string }
defineProps<{ itens: EntradaMenu[] }>()
const rota = useRoute()
</script>

<template>
  <nav class="flex flex-col gap-1" aria-label="Seções" data-testid="menu">
    <NuxtLink
      v-for="item in itens"
      :key="item.chave"
      :to="item.para"
      :aria-current="itemAtivo(item, rota.path) ? 'page' : undefined"
      class="group flex min-h-11 items-center gap-3 rounded-lg px-2 py-1.5 text-sm text-default transition hover:translate-x-0.5 hover:bg-elevated"
      :class="{ 'bg-primary/10 font-semibold text-primary shadow-[inset_3px_0_0_var(--ui-primary)]': itemAtivo(item, rota.path) }"
    >
      <span class="grid size-8 shrink-0 place-items-center rounded-lg transition" :class="itemAtivo(item, rota.path) ? 'bg-primary text-inverted' : 'bg-elevated text-muted group-hover:bg-accented'">
        <UIcon :name="item.icone" class="size-4" />
      </span>
      <span class="min-w-0 flex-1 truncate">{{ item.rotulo }}</span>
      <UBadge v-if="item.selo" color="primary" variant="solid" size="sm">{{ item.selo }}</UBadge>
    </NuxtLink>
  </nav>
</template>
