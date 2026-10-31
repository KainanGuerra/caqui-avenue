<script setup lang="ts">
import type { EstadoEtapa, OperacaoEmAndamento } from '~/types'
import { diaMes } from '~/utils/moeda'

const props = defineProps<{ operacao: OperacaoEmAndamento; hoje: string }>()
defineEmits<{ detalhes: [] }>()

const { valor } = useOcultarValores()
// Recolhido, o card ainda responde "quando cai" e "em que etapa está"; as etapas completas ficam a um toque.
const aberto = ref(false)

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

const etapaAtual = computed(() => props.operacao.etapas.find((e) => e.estado === 'atual'))

// Estado nunca só por cor: o marcador muda de forma e o leitor de tela ouve o estado.
const MARCADOR: Record<EstadoEtapa, { classe: string; leitura: string }> = {
  feito: { classe: 'bg-primary', leitura: 'concluída' },
  atual: { classe: 'bg-warning ring-4 ring-warning/25', leitura: 'em andamento' },
  proximo: { classe: 'bg-default ring-2 ring-inset ring-(--ui-border-accented)', leitura: 'próxima' },
}
</script>

<template>
  <section class="rounded-xl border border-default bg-default text-highlighted" aria-label="Em andamento" data-testid="em-andamento">
    <UCollapsible v-model:open="aberto">
      <button type="button" class="flex w-full items-center gap-3 rounded-xl p-4 text-left transition hover:bg-elevated focus-visible:outline-2 focus-visible:outline-primary" data-testid="em-andamento-alternar">
        <span class="grid size-10 shrink-0 place-items-center rounded-lg bg-marfim-300 dark:bg-marfim-900" aria-hidden="true">
          <UIcon name="i-lucide-hourglass" class="size-5" />
        </span>
        <span class="min-w-0 flex-1">
          <span class="block font-semibold text-balance">{{ titulo }}</span>
          <span class="mt-0.5 flex items-center gap-1.5 text-sm text-muted">
            <span class="size-2 shrink-0 rounded-full bg-warning" aria-hidden="true" />
            <span v-if="etapaAtual" class="min-w-0"><span class="sr-only">Em processamento. </span>Etapa atual: {{ etapaAtual.titulo }}</span>
            <span v-else class="min-w-0">Em processamento</span>
          </span>
        </span>
        <UIcon name="i-lucide-chevron-down" class="size-5 shrink-0 text-muted transition-transform duration-200" :class="{ 'rotate-180': aberto }" aria-hidden="true" />
        <span class="sr-only">{{ aberto ? 'Esconder as etapas' : 'Ver as etapas' }}</span>
      </button>

      <template #content>
        <div class="space-y-3 px-4 pb-4">
          <p class="text-sm text-toned">{{ operacao.nomeProduto }}. O pedido está registrado e o prazo segue os dias úteis.</p>
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
        </div>
      </template>
    </UCollapsible>
  </section>
</template>
