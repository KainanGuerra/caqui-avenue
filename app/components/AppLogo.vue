<script setup lang="ts">
// Marca da Caqui: o "K" de traço em moss sobre marfim (superfície de marca), sem laranja, que fica só para estado.
// O nome acompanha a cor de texto de destaque. `empilhada` põe o nome sob a marca, para a tela de entrada.
defineProps<{ tamanho?: number; semNome?: boolean; empilhada?: boolean }>()
</script>

<template>
  <span class="inline-flex items-center" :class="empilhada ? 'flex-col gap-3' : 'gap-2.5'" role="img" aria-label="Caqui Invest">
    <svg :width="tamanho ?? 32" :height="tamanho ?? 32" viewBox="0 0 512 512" aria-hidden="true" class="shrink-0">
      <rect width="512" height="512" rx="120" class="fill-marfim-300" />
      <path d="M168 118V394M168 256L330 118M208 226L344 394" fill="none" stroke-width="52" stroke-linecap="round" stroke-linejoin="round" class="stroke-moss-900" />
      <circle cx="372" cy="150" r="26" class="fill-moss-900" />
    </svg>
    <span v-if="!semNome" class="leading-none" :class="empilhada ? 'text-center' : ''">
      <span class="block font-semibold tracking-tight text-highlighted" :class="empilhada ? 'text-2xl' : 'text-lg'">Caqui.</span>
      <span class="block text-[0.65rem] font-medium uppercase tracking-[0.2em] text-muted">Invest</span>
    </span>
  </span>
</template>
