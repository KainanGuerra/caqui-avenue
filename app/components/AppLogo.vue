<script setup lang="ts">
// Marca da Caqui: um "K" de traço em quadrado laranja, com o nome desenhado em traço (sem fonte,
// acompanha a cor do texto). `empilhada` põe o nome sob a marca, para a tela de entrada.
defineProps<{ tamanho?: number; semNome?: boolean; empilhada?: boolean }>()
</script>

<template>
  <span class="inline-flex items-center" :class="empilhada ? 'flex-col gap-3' : 'gap-2.5'" role="img" aria-label="Caqui Invest">
    <svg :width="tamanho ?? 32" :height="tamanho ?? 32" viewBox="0 0 512 512" aria-hidden="true" class="shrink-0 drop-shadow-sm">
      <defs>
        <linearGradient id="logo-caqui" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#e68551" />
          <stop offset="1" stop-color="#9a3f12" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="120" fill="url(#logo-caqui)" />
      <path d="M168 118V394M168 256L330 118M208 226L344 394" fill="none" stroke="#fff" stroke-width="52" stroke-linecap="round" stroke-linejoin="round" />
      <circle cx="372" cy="150" r="26" fill="#fde68a" />
    </svg>
    <span v-if="!semNome" class="leading-none" :class="empilhada ? 'text-center' : ''">
      <span class="block font-semibold tracking-tight" :class="empilhada ? 'text-2xl' : 'text-lg'">Caqui<span class="text-primary">.</span></span>
      <span class="block text-[0.65rem] font-medium uppercase tracking-[0.2em] text-muted">Invest</span>
    </span>
  </span>
</template>
