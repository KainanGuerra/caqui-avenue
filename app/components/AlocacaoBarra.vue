<script setup lang="ts">
import type { FatiaAlocacao } from '~/types'

const props = defineProps<{ fatias: FatiaAlocacao[]; totalBrutoCentavos: number }>()
const { valor } = useOcultarValores()

// A cor nunca é a única pista: cada fatia tem nome e percentual escritos na legenda.
const COR: Record<FatiaAlocacao['classe'], string> = { renda_fixa: 'bg-primary', renda_variavel: 'bg-moss-300' }
const leitura = computed(() => props.fatias.map((f) => `${f.rotulo} ${f.percentual}%`).join(', '))
</script>

<template>
  <section class="space-y-3" aria-labelledby="titulo-alocacao" data-testid="alocacao">
    <h2 id="titulo-alocacao" class="text-xl font-semibold text-highlighted">Alocação</h2>
    <UCard variant="outline" class="bg-default" :ui="{ body: 'space-y-4' }">
      <div class="flex h-3 overflow-hidden rounded-full bg-muted" role="img" :aria-label="leitura">
        <span v-for="f in fatias" :key="f.classe" :class="COR[f.classe]" :style="{ width: `${f.percentual}%` }" />
      </div>
      <ul class="space-y-2">
        <li v-for="f in fatias" :key="f.classe" class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span class="size-3 shrink-0 rounded-sm" :class="COR[f.classe]" aria-hidden="true" />
          <span class="flex-1 text-default">{{ f.rotulo }}</span>
          <span class="font-semibold tabular-nums text-highlighted">{{ f.percentual }}%</span>
          <span class="tabular-nums text-muted">{{ valor(f.centavos) }}</span>
        </li>
      </ul>
      <p class="text-xs text-muted">Posições: {{ valor(totalBrutoCentavos) }} em saldo bruto (investido mais resultado). Multimercado conta como renda variável.</p>
    </UCard>
  </section>
</template>
