<script setup lang="ts">
import type { Polaridade, ResumoSentimento, Sentimento } from '~/types'

// Sentimento estimado: destaque no positivo, barra fina positivo · neutro · negativo (os números ficam na legenda)
// e os cinco sentimentos com o mesmo peso.
// Cor não carrega o sentido sozinha: cada parte tem ícone, nome e número, e há um vão entre os segmentos.
const props = defineProps<{ dados: ResumoSentimento }>()

const ICONE_POLARIDADE: Record<Polaridade, string> = { positivo: 'i-lucide-smile', neutro: 'i-lucide-meh', negativo: 'i-lucide-frown' }
const ICONE: Record<Sentimento, string> = {
  satisfeito: 'i-lucide-smile', neutro: 'i-lucide-meh', preocupado: 'i-lucide-shield-alert', insatisfeito: 'i-lucide-frown', frustrado: 'i-lucide-annoyed',
}

const positivo = computed(() => props.dados.polaridades.find((p) => p.chave === 'positivo')!)
const presentes = computed(() => props.dados.polaridades.filter((p) => p.total > 0))
const maior = computed(() => Math.max(1, ...props.dados.categorias.map((c) => c.total)))
</script>

<template>
  <UCard class="sentimento">
    <div class="grid gap-6 md:grid-cols-[auto_minmax(0,1fr)] md:items-center md:gap-10">
      <!-- Destaque: o positivo -->
      <div class="flex items-center gap-3">
        <span class="grid size-12 shrink-0 place-items-center rounded-xl fundo-positivo texto-positivo">
          <UIcon name="i-lucide-smile" class="size-7" />
        </span>
        <div class="whitespace-nowrap">
          <p class="flex items-baseline gap-2">
            <span class="text-4xl font-semibold leading-none tabular-nums">{{ dados.conversas ? `${positivo.pct}%` : '—' }}</span>
            <span class="text-sm font-medium">positivas</span>
          </p>
          <p class="mt-1 text-sm text-muted">{{ dados.conversas ? `de ${dados.conversas} ${dados.conversas === 1 ? 'conversa' : 'conversas'}` : 'sem conversas ainda' }}</p>
        </div>
      </div>

      <!-- Barra: positivo à esquerda, neutro no meio, negativo à direita -->
      <figure class="space-y-3">
        <figcaption class="sr-only">Conversas por sentimento provável: positivo, neutro e negativo</figcaption>
        <div class="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full bg-elevated" role="img" :aria-label="dados.polaridades.map((p) => `${p.rotulo}: ${p.total} (${p.pct}%)`).join(', ')">
          <UTooltip v-for="p in presentes" :key="p.chave" :text="`${p.rotulo}: ${p.total} ${p.total === 1 ? 'conversa' : 'conversas'} (${p.pct}%)`">
            <div class="h-full min-w-1.5 rounded-full transition-[flex-grow] duration-500" :class="`seg-${p.chave}`" :style="{ flexGrow: p.total }" />
          </UTooltip>
        </div>
        <ul class="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <li v-for="p in dados.polaridades" :key="p.chave" class="flex items-center gap-1.5">
            <span class="size-2.5 rounded-sm" :class="`seg-${p.chave}`" aria-hidden="true" />
            <UIcon :name="ICONE_POLARIDADE[p.chave]" class="size-4 text-muted" aria-hidden="true" />
            <span>{{ p.rotulo }}</span>
            <span class="tabular-nums text-muted">{{ p.total }} · {{ p.pct }}%</span>
          </li>
        </ul>
      </figure>
    </div>

    <USeparator class="my-5" />

    <!-- Os cinco sentimentos, com o mesmo peso; cada um na cor do seu grupo -->
    <ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <li v-for="c in dados.categorias" :key="c.chave" class="flex flex-col rounded-lg border border-default p-3">
        <div class="flex items-center gap-2">
          <span class="grid size-8 shrink-0 place-items-center rounded-lg" :class="[`fundo-${c.polaridade}`, `texto-${c.polaridade}`]">
            <UIcon :name="ICONE[c.chave]" class="size-4.5" />
          </span>
          <span class="font-medium">{{ c.rotulo }}</span>
        </div>
        <p class="mt-2 text-2xl font-semibold leading-none tabular-nums">{{ c.total }} <span class="text-sm font-normal text-muted">· {{ c.pct }}%</span></p>
        <p class="mt-1 flex-1 text-xs leading-snug text-muted">{{ c.criterio }}</p>
        <span class="mt-3 block h-1.5 overflow-hidden rounded-full bg-elevated" aria-hidden="true">
          <span class="block h-full rounded-full transition-[width] duration-500" :class="`seg-${c.polaridade}`" :style="{ width: `${(100 * c.total) / maior}%` }" />
        </span>
      </li>
    </ul>
  </UCard>
</template>

<style>
/* Escala validada contra as superfícies do app (claro #FAFAF7, escuro #0D1611): dois polos e cinza no meio.
   O polo negativo é um coral suave, para o painel não puxar o olho para o problema.
   Fora do scoped de propósito: o scoped reduz ":global(.dark) .sentimento" a ".dark" e o tema claro venceria. */
.sentimento { --seg-positivo: #2a78d6; --seg-neutro: #b1b0aa; --seg-negativo: #dc6a5f; --seg-neutro-texto: #262624; }
.dark .sentimento { --seg-positivo: #3987e5; --seg-neutro: #6f6e69; --seg-negativo: #dc6a5f; --seg-neutro-texto: #ffffff; }
</style>

<style scoped>
.seg-positivo { background-color: var(--seg-positivo); }
.seg-neutro { background-color: var(--seg-neutro); }
.seg-negativo { background-color: var(--seg-negativo); }
.texto-positivo { color: var(--seg-positivo); }
.texto-neutro { color: color-mix(in oklab, var(--seg-neutro) 70%, var(--seg-neutro-texto)); }
.texto-negativo { color: var(--seg-negativo); }
.fundo-positivo { background-color: color-mix(in oklab, var(--seg-positivo) 12%, transparent); }
.fundo-neutro { background-color: color-mix(in oklab, var(--seg-neutro) 14%, transparent); }
.fundo-negativo { background-color: color-mix(in oklab, var(--seg-negativo) 12%, transparent); }
</style>
