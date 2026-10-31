<script setup lang="ts">
import type { OperacaoVista } from '~/types'
import { dataCurta } from '~/utils/moeda'

const props = defineProps<{ operacao: OperacaoVista }>()
const { valor } = useOcultarValores()

const TIPO: Record<OperacaoVista['tipo'], { rotulo: string; icone: string }> = {
  aplicacao: { rotulo: 'Aplicação', icone: 'i-lucide-arrow-down-to-line' },
  resgate: { rotulo: 'Resgate', icone: 'i-lucide-arrow-up-from-line' },
  transferencia_saida_pix: { rotulo: 'Pix enviado', icone: 'i-lucide-send' },
  transferencia_entrada: { rotulo: 'Entrada na conta', icone: 'i-lucide-arrow-down-left' },
}
const STATUS: Record<OperacaoVista['status'], { rotulo: string; cor: 'success' | 'warning' | 'error' | 'neutral' }> = {
  liquidada: { rotulo: 'Liquidada', cor: 'success' },
  em_processamento: { rotulo: 'Em processamento', cor: 'warning' },
  pendente: { rotulo: 'Pendente', cor: 'neutral' },
  recusada: { rotulo: 'Recusada', cor: 'error' },
}
const tipo = computed(() => TIPO[props.operacao.tipo])
const status = computed(() => STATUS[props.operacao.status])
</script>

<template>
  <li class="flex items-center gap-3 py-3">
    <span class="grid size-9 shrink-0 place-items-center rounded-lg bg-elevated text-muted"><UIcon :name="tipo.icone" class="size-4" /></span>
    <div class="min-w-0 flex-1">
      <p class="truncate text-sm font-medium">{{ tipo.rotulo }}<template v-if="operacao.nomeProduto"> · {{ operacao.nomeProduto }}</template></p>
      <p class="text-xs text-muted">{{ dataCurta(operacao.pedidoEm) }}</p>
    </div>
    <div class="text-right">
      <p class="text-sm font-medium tabular-nums">{{ valor(operacao.valorCentavos) }}</p>
      <UBadge :color="status.cor" variant="subtle" size="sm">{{ status.rotulo }}</UBadge>
    </div>
  </li>
</template>
