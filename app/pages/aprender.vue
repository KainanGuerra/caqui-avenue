<script setup lang="ts">
import type { TemaAprender } from '~/types'

useHead({ title: 'Aprender · Kaki' })

// Artigos atuais da base, por tema, já filtrados no servidor (a KB-007 antiga não vem).
const temas = ref<TemaAprender[] | null>(null)
const falhou = ref(false)

async function carregar() {
  try {
    temas.value = await $fetch<TemaAprender[]>('/api/aprender')
    falhou.value = false
  } catch {
    falhou.value = true
  }
}
onMounted(carregar)

const itensDo = (tema: TemaAprender) => tema.artigos.map((artigo) => ({ label: artigo.titulo, value: artigo.id, artigo }))
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-6 pt-2">
    <header class="space-y-2">
      <h1 class="text-[1.75rem] leading-9 font-semibold text-highlighted">Aprender</h1>
      <p class="text-muted">Artigos da base da Caqui, com a fonte e a data de revisão.</p>
      <UBadge color="neutral" variant="subtle" icon="i-lucide-sprout">Conteúdo educativo, não é recomendação</UBadge>
    </header>

    <template v-if="temas">
      <section v-for="tema in temas" :key="tema.titulo" class="space-y-2" :aria-label="tema.titulo" data-testid="tema-aprender">
        <h2 class="text-xl font-semibold text-highlighted">{{ tema.titulo }}</h2>
        <UAccordion :items="itensDo(tema)" class="rounded-xl border border-default bg-default px-4" :ui="{ label: 'text-base text-highlighted text-left' }">
          <template #body="{ item }">
            <ArtigoLeitura :artigo="item.artigo" />
          </template>
        </UAccordion>
      </section>
    </template>
    <UAlert v-else-if="falhou" color="warning" variant="subtle" icon="i-lucide-wifi-off" title="Não consegui carregar os artigos agora." :actions="[{ label: 'Tentar de novo', color: 'neutral', variant: 'outline', onClick: carregar }]" />
    <div v-else class="space-y-4"><USkeleton class="h-40" /><USkeleton class="h-40" /></div>
  </div>
</template>
