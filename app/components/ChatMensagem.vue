<script setup lang="ts">
import type { Mensagem } from '~/types'

const props = defineProps<{ msg: Mensagem; atendente?: string | null; cliente?: string }>()
const quem = computed(() => (props.msg.papel === 'cliente' ? (props.cliente ?? 'Você') : props.msg.papel === 'humano' ? (props.atendente ?? 'Atendente') : 'Kaki'))
const rotulo = computed(() => (props.msg.papel === 'agente' ? 'assistente virtual' : props.msg.papel === 'humano' ? 'pessoa da Caqui' : ''))
const seguranca = computed(() => props.msg.acao === 'seguranca_imediata')
</script>

<template>
  <div class="flex" :class="msg.papel === 'cliente' ? 'justify-end' : 'justify-start'" :data-papel="msg.papel">
    <div
      class="max-w-[88%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-sm sm:max-w-[80%]"
      :class="{
        'rounded-br-sm bg-primary text-inverted': msg.papel === 'cliente',
        'rounded-bl-sm bg-default ring ring-default': msg.papel === 'agente' && !seguranca,
        'rounded-bl-sm bg-error/10 ring ring-error/40': seguranca,
        'rounded-bl-sm bg-success/10 ring ring-success/40': msg.papel === 'humano',
      }"
    >
      <span class="mb-0.5 block text-xs font-semibold" :class="msg.papel === 'cliente' ? 'text-inverted/80' : 'text-muted'">{{ quem }}<template v-if="rotulo"> · {{ rotulo }}</template></span>
      {{ msg.texto }}
      <div v-if="msg.fontes?.length || msg.protocolo" class="mt-2 flex flex-wrap gap-1.5" aria-label="Fontes e protocolo desta resposta">
        <UBadge v-for="f in msg.fontes" :key="f.id" color="info" variant="subtle" size="sm" :title="f.rotulo" icon="i-lucide-book-open-text">Fonte: {{ f.rotulo }}</UBadge>
        <UBadge v-if="msg.protocolo" color="primary" variant="subtle" size="sm" icon="i-lucide-ticket">Protocolo {{ msg.protocolo }}</UBadge>
      </div>
    </div>
  </div>
</template>
