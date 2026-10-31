<script setup lang="ts">
import type { PosicaoVista } from '~/types'
import { dataCurta, diaMes } from '~/utils/moeda'

const props = defineProps<{ posicao: PosicaoVista; hoje: string }>()
const { valor } = useOcultarValores()

// O prazo vem calculado do servidor (corte das 16h, dias úteis, carência); aqui só se escolhe a frase para o tipo.
const resgate = computed(() => {
  const r = props.posicao.resgate
  if (!r) return null
  if (r.tipo === 'liquida') {
    const quando = r.pagamento === props.hoje ? `hoje, ${diaMes(r.pagamento)}` : `em ${dataCurta(r.pagamento)}`
    return { titulo: `Se pedir o resgate agora, o dinheiro cai ${quando}`, detalhe: r.detalhe, fontes: r.fontes }
  }
  if (r.tipo === 'em_carencia') return { titulo: `Em carência: o resgate fica liberado em ${dataCurta(r.disponivelEm)}`, detalhe: '', fontes: r.fontes }
  return { titulo: r.vencimento ? `Sem resgate antes do vencimento: o valor sai em ${dataCurta(r.vencimento)}` : 'Sem resgate antes do vencimento', detalhe: '', fontes: r.fontes }
})
</script>

<template>
  <UCard :ui="{ body: 'p-4 sm:p-4' }" data-testid="posicao">
    <!-- Em 375px o selo desce para baixo do título: nome e taxa quebram linha em vez de estourar. -->
    <div class="flex flex-col items-start gap-2 sm:flex-row sm:justify-between sm:gap-3">
      <div class="min-w-0">
        <p class="break-words font-medium">{{ posicao.nomeProduto }}</p>
        <p class="break-words text-xs text-muted">{{ posicao.taxaContratada }} · desde {{ dataCurta(posicao.dataAplicacao) }}<template v-if="posicao.vencimento"> · vence {{ dataCurta(posicao.vencimento) }}</template></p>
      </div>
      <UBadge :color="posicao.rendimentoBrutoCentavos >= 0 ? 'success' : 'error'" variant="subtle" class="shrink-0 tabular-nums">
        {{ posicao.rendimentoBrutoCentavos >= 0 ? '+' : '' }}{{ valor(posicao.rendimentoBrutoCentavos) }}
      </UBadge>
    </div>
    <dl class="mt-3 grid grid-cols-2 gap-2 text-sm">
      <div><dt class="text-muted">Aplicado</dt><dd class="font-medium tabular-nums">{{ valor(posicao.valorAplicadoCentavos) }}</dd></div>
      <div><dt class="text-muted">Saldo bruto</dt><dd class="font-medium tabular-nums">{{ valor(posicao.saldoBrutoCentavos) }}</dd></div>
    </dl>
    <div v-if="resgate" class="mt-3 flex gap-2 border-t border-default pt-3" data-testid="prazo-resgate">
      <UIcon name="i-lucide-calendar-clock" class="mt-0.5 size-4 shrink-0 text-muted" />
      <div class="min-w-0 text-sm">
        <p class="font-medium text-highlighted">{{ resgate.titulo }}</p>
        <p v-if="resgate.detalhe" class="text-toned">{{ resgate.detalhe }}</p>
        <p class="text-xs text-muted">Fonte: {{ resgate.fontes.join(' · ') }}</p>
      </div>
    </div>
  </UCard>
</template>
