<script setup lang="ts">
useHead({ title: 'Fila de atendimento · Kaki' })

const s = useSuporte()
const acesso = useAcesso()
const resposta = ref('')

const ACAO: Record<string, string> = {
  seguranca_imediata: 'Segurança imediata', encaminhar_humano: 'Atendimento por pessoa', encaminhar_especialista: 'Especialista em investimentos', protocolo: 'Protocolo (fora do horário ou reclamação)',
}
const COR_RISCO = { baixo: 'neutral', medio: 'neutral', alto: 'warning', critico: 'error' } as const

const caso = computed(() => s.detalhe.value?.caso ?? null)
const encerrado = computed(() => caso.value?.status === 'resolvido')

async function enviar() {
  const t = resposta.value.trim()
  if (!t) return
  await s.acao('responder', { texto: t, atendente: acesso.atendente.value })
  resposta.value = ''
}
</script>

<template>
  <div class="space-y-4 pt-2">
    <div>
      <h1 class="text-2xl font-semibold">Fila de atendimento</h1>
      <p class="text-sm text-muted">Ordem: golpe, depois pessoas com 60 anos ou mais, depois os demais. Atendendo como {{ acesso.atendente.value }}.</p>
    </div>

    <div class="grid grid-cols-2 gap-3 lg:grid-cols-5" data-testid="resumo">
      <template v-if="s.resumo.value">
        <KpiCard rotulo="Em aberto" :valor="s.resumo.value.emAberto" icone="i-lucide-inbox" />
        <KpiCard rotulo="Golpe" :valor="s.resumo.value.golpe" icone="i-lucide-shield-alert" tom="error" />
        <KpiCard rotulo="Prioridade (60+)" :valor="s.resumo.value.prioridade" icone="i-lucide-star" tom="warning" />
        <KpiCard rotulo="Assumidos" :valor="s.resumo.value.assumidos" icone="i-lucide-user-check" tom="neutral" />
        <KpiCard rotulo="Resolvidos" :valor="s.resumo.value.resolvidos" icone="i-lucide-circle-check" tom="success" />
      </template>
      <USkeleton v-else v-for="i in 5" :key="i" class="h-20" />
    </div>

    <div class="grid gap-4 lg:grid-cols-5">
      <section class="space-y-2 lg:col-span-2" aria-label="Fila de casos">
        <UCard v-if="!s.casos.value.length"><p class="py-6 text-center text-sm text-muted">Nenhum caso ainda. Quando alguém pedir uma pessoa, o caso aparece aqui.</p></UCard>
        <CasoCard v-for="c in s.casos.value" :key="c.id" :caso="c" :ativo="s.selecionado.value === c.id" @abrir="s.abrir" />
      </section>

      <UCard class="lg:col-span-3" aria-label="Caso selecionado">
        <p v-if="!caso" class="py-10 text-center text-sm text-muted">Escolha um caso na fila para ver o resumo e a conversa.</p>
        <div v-else class="space-y-4">
          <div>
            <h2 class="text-lg font-semibold">{{ caso.clienteNome }}, {{ caso.idade }} anos <span class="text-sm font-normal text-muted">· {{ caso.protocolo }}</span></h2>
            <div class="mt-2 flex flex-wrap gap-1.5">
              <UBadge :color="COR_RISCO[caso.risco]" variant="subtle">risco {{ caso.risco }}</UBadge>
              <UBadge color="primary" variant="subtle">{{ ACAO[caso.acao] ?? caso.acao }}</UBadge>
              <UBadge color="neutral" variant="outline" icon="i-lucide-id-card">CPF {{ caso.cpfMascarado }}</UBadge>
              <UBadge color="neutral" variant="outline">{{ caso.status }}<template v-if="caso.atendente"> · {{ caso.atendente }}</template></UBadge>
              <UBadge v-if="caso.status === 'aberto' && s.detalhe.value" color="neutral" variant="outline" icon="i-lucide-timer">espera estimada ~{{ s.detalhe.value.esperaEstimadaMin }} min (simulada)</UBadge>
            </div>
          </div>

          <section>
            <h3 class="mb-1 text-xs font-medium uppercase tracking-wide text-muted">Por que chegou aqui</h3>
            <div class="flex flex-wrap gap-1.5"><UBadge v-for="m in caso.motivosTexto" :key="m" color="warning" variant="subtle">{{ m }}</UBadge></div>
          </section>

          <section>
            <h3 class="mb-1 text-xs font-medium uppercase tracking-wide text-muted">Resumo (montado pelo sistema, sem texto gerado)</h3>
            <ul class="list-disc space-y-0.5 pl-5 text-sm"><li v-for="l in caso.resumo" :key="l">{{ l }}</li></ul>
          </section>

          <section v-if="caso.fontes.length">
            <h3 class="mb-1 text-xs font-medium uppercase tracking-wide text-muted">Fontes que o agente citou</h3>
            <div class="flex flex-wrap gap-1.5"><UBadge v-for="f in caso.fontes" :key="f.id" color="info" variant="subtle" icon="i-lucide-book-open-text">{{ f.rotulo }}</UBadge></div>
          </section>

          <section>
            <h3 class="mb-1 text-xs font-medium uppercase tracking-wide text-muted">Conversa</h3>
            <div class="rolagem-chat max-h-80 space-y-3 overflow-y-auto rounded-lg bg-elevated/40 p-3" data-testid="conversa-caso">
              <ChatMensagem v-for="(m, i) in s.detalhe.value?.mensagens ?? []" :key="i" :msg="m" :atendente="caso.atendente" :cliente="caso.clienteNome" />
            </div>
          </section>

          <section v-if="!encerrado" class="space-y-2">
            <label for="resposta" class="text-xs font-medium uppercase tracking-wide text-muted">Responder ao cliente</label>
            <UTextarea id="resposta" v-model="resposta" class="w-full" :rows="3" placeholder="Escreva a resposta. O cliente a vê no chat dele." data-testid="suporte-resposta" />
            <div class="flex flex-wrap gap-2">
              <UButton v-if="caso.status === 'aberto'" color="neutral" variant="outline" icon="i-lucide-user-check" label="Assumir caso" data-testid="assumir" @click="s.acao('assumir', { atendente: acesso.atendente.value })" />
              <UButton icon="i-lucide-send-horizontal" label="Enviar resposta" :disabled="!resposta.trim()" data-testid="enviar-resposta" @click="enviar" />
              <UButton color="success" variant="soft" icon="i-lucide-circle-check" label="Resolver caso" data-testid="resolver" @click="s.acao('resolver')" />
            </div>
          </section>
          <UAlert v-else color="success" variant="subtle" icon="i-lucide-circle-check" title="Caso resolvido" />
          <UAlert v-if="s.erro.value" color="error" variant="subtle" icon="i-lucide-triangle-alert" role="alert" :title="s.erro.value" />
        </div>
      </UCard>
    </div>
  </div>
</template>
