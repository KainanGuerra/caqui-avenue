<script setup lang="ts">
import type { EntradaMenu } from '~/components/AppMenu.vue'
import { itemAtivo } from '~/utils/navegacao'

// Rodapé de abas do Figma (50:202), para o cliente em tela estreita. Os itens são os mesmos do menu lateral.
defineProps<{ itens: EntradaMenu[] }>()
const rota = useRoute()
</script>

<template>
  <!-- A altura soma a barra do sistema no celular (safe area); o layout reserva a mesma conta embaixo da página. -->
  <nav
    class="fixed inset-x-0 bottom-0 z-30 flex h-[calc(4rem+env(safe-area-inset-bottom))] justify-between border-t border-default bg-default px-1 pb-[env(safe-area-inset-bottom)]"
    aria-label="Seções"
    data-testid="rodape-abas"
  >
    <NuxtLink
      v-for="item in itens"
      :key="item.chave"
      :to="item.para"
      :aria-current="itemAtivo(item, rota.path) ? 'page' : undefined"
      class="flex min-h-14 flex-auto flex-col items-center justify-center gap-1 py-2 text-xs"
      :class="itemAtivo(item, rota.path) ? 'font-semibold text-highlighted' : 'text-muted'"
    >
      <span class="relative rounded-full px-4 py-0.5" :class="{ 'bg-marfim-300 dark:bg-marfim-900': itemAtivo(item, rota.path) }">
        <UIcon :name="item.icone" class="block size-5" />
        <span v-if="item.selo" class="absolute right-2 top-0 size-2 rounded-full bg-primary" />
      </span>
      <!-- Largura pelo conteúdo: em 375px "Atendimento" em negrito não cabe numa coluna de 1/5 e seria cortado. -->
      <span class="whitespace-nowrap">{{ item.rotulo }}</span>
      <span v-if="item.selo" class="sr-only">, conversa em andamento</span>
    </NuxtLink>
  </nav>
</template>
