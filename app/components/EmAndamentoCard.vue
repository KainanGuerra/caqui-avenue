<script setup lang="ts">
import type { EstadoEtapa, OperacaoEmAndamento } from '~/types'
import { diaMes } from '~/utils/moeda'

const props = defineProps<{ operacao: OperacaoEmAndamento; hoje: string }>()
defineEmits<{ detalhes: [] }>()

const { valor } = useOcultarValores()

// Datas e etapas vêm prontas do servidor; aqui só se escolhe a frase para a data que chegou.
const titulo = computed(() => {
  const { tipo, liquidacaoPrevista: data } = props.operacao
  const sujeito = tipo === 'resgate' ? `Seu resgate de ${valor(props.operacao.valorCentavos)}` : `Sua aplicação de ${valor(props.operacao.valorCentavos)}`
  if (!data) return `${sujeito} está em processamento`
  const verbo = tipo === 'resgate' ? 'cai' : 'é efetivada'
  if (data === props.hoje) return `${sujeito} ${verbo} hoje, ${diaMes(data)}`
  if (data > props.hoje) return `${sujeito} ${verbo} em ${diaMes(data)}`
  return `${sujeito} ${tipo === 'resgate' ? 'estava previsto' : 'estava prevista'} para ${diaMes(data)} e segue em processamento`
})

// Estado nunca só por cor: o marcador muda de forma e o leitor de tela ouve o estado.
const MARCADOR: Record<EstadoEtapa, { classe: string; leitura: string }> = {
  feito: { classe: 'bg-primary', leitura: 'concluída' },
  atual: { classe: 'bg-warning ring-4 ring-warning/25', leitura: 'em andamento' },
  proximo: { classe: 'bg-default ring-2 ring-inset ring-(--ui-border-accented)', leitura: 'próxima' },
}
</script>

<template>
  <section class="space-y-3 rounded-xl bg-marfim-300 p-4 text-highlighted dark:bg-marfim-900" aria-label="Em andamento" data-testid="em-andamento">
    <UBadge color="neutral" variant="outline" icon="i-lucide-info" class="bg-default">Em processamento</UBadge>
    <div class="space-y-1">
      <h2 class="text-xl font-semibold text-balance">{{ titulo }}</h2>
      <p class="text-sm text-toned">{{ operacao.nomeProduto }}. O pedido está registrado e o prazo segue os dias úteis.</p>
    </div>
    <ol class="space-y-3">
      <li v-for="etapa in operacao.etapas" :key="etapa.titulo" class="flex gap-3">
        <span class="mt-1.5 size-2.5 shrink-0 rounded-full" :class="MARCADOR[etapa.estado].classe" aria-hidden="true" />
        <div class="min-w-0">
          <p class="text-sm font-semibold">
            {{ etapa.titulo }} · {{ diaMes(etapa.data) }}<template v-if="etapa.hora">, {{ etapa.hora }}</template>
            <span class="sr-only">({{ MARCADOR[etapa.estado].leitura }})</span>
          </p>
          <p class="text-sm text-toned">{{ etapa.detalhe }}</p>
        </div>
      </li>
    </ol>
    <div class="flex flex-wrap items-center justify-between gap-2">
      <p class="text-xs text-toned">Fonte: {{ operacao.fontes.join(' · ') }}</p>
      <UButton v-if="operacao.tipo === 'resgate'" variant="link" color="primary" trailing-icon="i-lucide-chevron-right" class="px-0" label="Ver detalhes do resgate" @click="$emit('detalhes')" />
    </div>
  </section>
</template>
