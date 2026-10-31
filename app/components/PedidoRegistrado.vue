<script setup lang="ts">
import type { ResultadoPedido } from '~/types'

// Confirmação do pedido com o texto e o protocolo que vieram do servidor; a tela não monta a frase.
defineProps<{ resultado: ResultadoPedido; acompanhar?: boolean }>()
</script>

<template>
  <div class="space-y-3 rounded-lg bg-elevated p-3" role="status" data-testid="pedido-registrado">
    <p class="flex items-start gap-2 text-sm text-default">
      <UIcon name="i-lucide-circle-check" class="mt-0.5 size-4 shrink-0 text-success" />
      <span>{{ resultado.texto }}</span>
    </p>
    <ArtigoLeitura v-for="a in resultado.orientacao" :key="a.id" :artigo="a" />
    <UButton v-if="acompanhar" to="/conversa" color="neutral" variant="outline" size="sm" icon="i-lucide-message-circle" label="Abrir conversa" />
  </div>
</template>
