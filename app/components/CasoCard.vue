<script setup lang="ts">
import type { Caso } from '~/types'

const props = defineProps<{ caso: Caso; ativo: boolean }>()
defineEmits<{ abrir: [id: string] }>()
const prio = computed(() => (props.caso.prioridade === 0 ? 'Golpe' : props.caso.prioridade === 1 ? 'Prioridade' : 'Normal'))
const corPrio = computed(() => (props.caso.prioridade === 0 ? 'error' : props.caso.prioridade === 1 ? 'warning' : 'neutral'))
const corStatus = computed(() => (props.caso.status === 'resolvido' ? 'success' : props.caso.status === 'assumido' ? 'info' : 'neutral'))
const hora = computed(() => props.caso.criadoEm.slice(11, 16))
</script>

<template>
  <button
    type="button"
    class="block w-full rounded-lg border border-l-4 bg-default p-3 text-left transition hover:bg-elevated focus-visible:outline-2 focus-visible:outline-primary"
    :class="[
      ativo ? 'border-primary ring-1 ring-primary' : 'border-default',
      caso.prioridade === 0 ? 'border-l-error' : caso.prioridade === 1 ? 'border-l-warning' : 'border-l-accented',
    ]"
    :aria-current="ativo ? 'true' : undefined"
    :data-testid="`caso-${caso.protocolo}`"
    @click="$emit('abrir', caso.id)"
  >
    <div class="flex items-baseline justify-between gap-2 text-sm">
      <span class="truncate font-semibold">{{ caso.clienteNome }}, {{ caso.idade }}</span>
      <span class="shrink-0 text-xs text-muted">{{ caso.protocolo }} · {{ hora }}</span>
    </div>
    <div class="mt-1.5 flex flex-wrap gap-1.5">
      <UBadge :color="corPrio" variant="subtle" size="sm">{{ prio }}</UBadge>
      <UBadge :color="corStatus" variant="subtle" size="sm">{{ caso.status }}</UBadge>
      <UBadge color="neutral" variant="outline" size="sm">risco {{ caso.risco }}</UBadge>
    </div>
    <p class="mt-1.5 line-clamp-2 text-xs text-muted">{{ caso.motivosTexto.join('; ') }}</p>
  </button>
</template>
