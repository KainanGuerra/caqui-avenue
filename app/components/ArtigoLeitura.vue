<script setup lang="ts">
import type { ArtigoLeitura } from '~/types'
import { dataCurta } from '~/utils/moeda'

// Mostra o artigo da base em blocos, sem v-html: o texto vem do servidor já separado em parágrafo, lista e tabela.
defineProps<{ artigo: ArtigoLeitura }>()
</script>

<template>
  <article class="space-y-3 text-sm text-default" :data-kb="artigo.id">
    <template v-for="(bloco, i) in artigo.blocos" :key="i">
      <p v-if="bloco.tipo === 'paragrafo'">
        <template v-for="(t, j) in bloco.trechos" :key="j"><strong v-if="t.forte" class="font-semibold text-highlighted">{{ t.texto }}</strong><template v-else>{{ t.texto }}</template></template>
      </p>
      <component :is="bloco.ordenada ? 'ol' : 'ul'" v-else-if="bloco.tipo === 'lista'" class="space-y-1 ps-5" :class="bloco.ordenada ? 'list-decimal' : 'list-disc'">
        <li v-for="(item, j) in bloco.itens" :key="j">
          <template v-for="(t, k) in item" :key="k"><strong v-if="t.forte" class="font-semibold text-highlighted">{{ t.texto }}</strong><template v-else>{{ t.texto }}</template></template>
        </li>
      </component>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead><tr class="border-b border-default"><th v-for="c in bloco.cabecalho" :key="c" class="py-1.5 pe-3 font-semibold text-highlighted">{{ c }}</th></tr></thead>
          <tbody><tr v-for="(linha, j) in bloco.linhas" :key="j" class="border-b border-default last:border-0"><td v-for="(celula, k) in linha" :key="k" class="py-1.5 pe-3">{{ celula }}</td></tr></tbody>
        </table>
      </div>
    </template>
    <p class="text-xs text-muted">Fonte: {{ artigo.id }} · revisado em {{ dataCurta(artigo.revisadoEm) }}</p>
  </article>
</template>
