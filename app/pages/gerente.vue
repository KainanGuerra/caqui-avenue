<script setup lang="ts">
import { horaCurta, reais } from '~/utils/moeda'
import { duracao, inteiro, porcento } from '~/utils/painel'
import type { StatusCaso } from '~/types'

useHead({ title: 'Painel gerencial · Kaki' })

const g = useGerente()
onMounted(async () => { await g.atualizar(); g.acompanhar() })
onBeforeUnmount(() => g.parar())

const p = computed(() => g.painel.value)
const STATUS = { aberto: 'Em aberto', assumido: 'Com atendente', resolvido: 'Resolvido' } as const
const COR_STATUS = { aberto: 'warning', assumido: 'primary', resolvido: 'success' } as const
const PRIORIDADE = ['Golpe', '60+ ou vulnerável', 'Demais'] as const
// Igual ao do servidor (CASOS_POR_PAGINA): o componente de paginação precisa dele para contar as páginas.
const CASOS_POR_PAGINA = 10

const FILTROS = [
  { label: 'Todos', value: 'todos' },
  { label: 'Em aberto', value: 'aberto' },
  { label: 'Com atendente', value: 'assumido' },
  { label: 'Resolvidos', value: 'resolvido' },
]
const filtroStatus = computed({
  get: () => g.status.value ?? 'todos',
  set: (v: string) => { g.status.value = v === 'todos' ? null : (v as StatusCaso) },
})
</script>

<template>
  <div class="space-y-6 pt-2">
    <div>
      <h1 class="text-2xl font-semibold">Painel gerencial</h1>
      <p class="text-sm text-muted">Atendimentos da Kaki desde que o servidor subiu (os números zeram ao reiniciar). Atualiza a cada 5 segundos.</p>
    </div>

    <UAlert v-if="g.falhou.value" color="warning" variant="subtle" icon="i-lucide-wifi-off" title="Não foi possível atualizar agora. Os números são da última leitura." />
    <div v-if="!p" class="flex items-center gap-2 text-sm text-muted"><UIcon name="i-lucide-loader-circle" class="size-4 animate-spin" />Carregando o painel…</div>

    <template v-else>
      <UAlert v-if="!p.conversas" color="neutral" variant="subtle" icon="i-lucide-message-circle-dashed" title="Nenhum atendimento ainda." description="Entre como cliente em outra aba e converse com a Kaki: os números aparecem aqui sozinhos." />

      <!-- 1 e 2. Volume e resolução automática -->
      <section class="space-y-3" aria-labelledby="volume">
        <h2 id="volume" class="text-lg font-semibold">Volume e resolução automática</h2>
        <div class="grid gap-3 sm:grid-cols-3">
          <KpiCard rotulo="Conversas" :valor="inteiro(p.conversas)" icone="i-lucide-messages-square" dica="Clientes que falaram com a Kaki" />
          <KpiCard rotulo="Mensagens" :valor="inteiro(p.mensagens)" icone="i-lucide-message-circle" dica="Respostas que a Kaki deu" />
          <KpiCard rotulo="Resolução automática" :valor="porcento(p.resolucaoAutomaticaPct)" icone="i-lucide-bot" tom="success" dica="Conversas resolvidas sem passar para uma pessoa" />
        </div>
      </section>

      <!-- 3. Escalonadas -->
      <section class="space-y-3" aria-labelledby="escalonadas">
        <h2 id="escalonadas" class="text-lg font-semibold">Conversas escalonadas</h2>
        <div class="grid gap-3 sm:grid-cols-2">
          <KpiCard rotulo="Escalonadas" :valor="`${inteiro(p.escalonadas)} · ${porcento(p.escalonadasPct)}`" icone="i-lucide-arrow-up-right" tom="warning" dica="Passaram para pessoa, segurança, especialista ou protocolo" />
          <KpiCard rotulo="Travadas" :valor="inteiro(p.travadas)" icone="i-lucide-repeat" tom="error" dica="Escalonadas porque a Kaki não conseguiu resolver" />
        </div>
        <UCard>
          <BarrasContagem titulo="Para onde foram" :itens="p.porAcao" vazio="Nenhuma conversa escalonada ainda." />
        </UCard>
        <UCard :ui="{ header: 'p-3 sm:px-4', body: 'p-0 sm:p-0', footer: 'p-3 sm:px-4' }">
          <template #header>
            <div class="flex flex-wrap items-center justify-between gap-2">
              <h3 class="text-sm font-medium">Casos <span class="text-muted">({{ inteiro(p.casos.total) }})</span></h3>
              <UTabs v-model="filtroStatus" :items="FILTROS" :content="false" size="xs" color="neutral" variant="pill" aria-label="Filtrar casos por status" />
            </div>
          </template>
          <p v-if="!p.casos.itens.length" class="p-4 text-sm text-muted">{{ g.status.value ? 'Nenhum caso com esse status.' : 'Nenhum caso aberto pela Kaki ainda.' }}</p>
          <div v-else class="overflow-x-auto">
            <table class="w-full text-sm">
              <caption class="sr-only">Casos escalonados pela Kaki</caption>
              <thead class="text-left text-muted">
                <tr class="border-b border-default">
                  <th scope="col" class="px-4 py-2 font-medium">Protocolo</th>
                  <th scope="col" class="px-4 py-2 font-medium">Cliente</th>
                  <th scope="col" class="px-4 py-2 font-medium">Destino</th>
                  <th scope="col" class="hidden px-4 py-2 font-medium lg:table-cell">Motivos</th>
                  <th scope="col" class="px-4 py-2 font-medium">Status</th>
                  <th scope="col" class="px-4 py-2 text-right font-medium">Hora</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-default">
                <tr v-for="c in p.casos.itens" :key="c.protocolo">
                  <td class="px-4 py-2 font-mono">{{ c.protocolo }}</td>
                  <td class="px-4 py-2">{{ c.clienteNome }}<span class="block text-xs text-muted">{{ PRIORIDADE[c.prioridade] }}</span></td>
                  <td class="px-4 py-2">{{ c.acao }}</td>
                  <td class="hidden px-4 py-2 text-muted lg:table-cell">{{ c.motivos.join('; ') }}</td>
                  <td class="px-4 py-2"><UBadge :color="COR_STATUS[c.status]" variant="subtle" class="whitespace-nowrap">{{ STATUS[c.status] }}</UBadge></td>
                  <td class="px-4 py-2 text-right tabular-nums">{{ horaCurta(c.criadoEm) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <template v-if="p.casos.paginas > 1" #footer>
            <div class="flex flex-wrap items-center justify-between gap-2">
              <span class="text-xs text-muted">Página {{ p.casos.pagina }} de {{ p.casos.paginas }}</span>
              <UPagination v-model:page="g.pagina.value" :total="p.casos.total" :items-per-page="CASOS_POR_PAGINA" size="sm" />
            </div>
          </template>
        </UCard>
      </section>

      <!-- 4. Qualidade -->
      <section class="space-y-3" aria-labelledby="qualidade">
        <h2 id="qualidade" class="text-lg font-semibold">Qualidade das respostas</h2>
        <div class="grid gap-3 sm:grid-cols-3">
          <KpiCard rotulo="Respostas com fonte" :valor="porcento(p.qualidade.comFontePct)" icone="i-lucide-book-open-check" tom="success" dica="Citam o artigo da base de ajuda de onde veio a informação" />
          <KpiCard rotulo="Mensagens não entendidas" :valor="porcento(p.qualidade.naoEntendeuPct)" icone="i-lucide-circle-help" tom="warning" dica="A Kaki pediu para o cliente explicar de novo" />
          <KpiCard rotulo="Respostas da IA barradas" :valor="porcento(p.qualidade.reprovadasPct)" icone="i-lucide-shield-check" tom="error" :dica="p.redacao === 'template' ? 'IA desligada: as respostas usam o texto padrão' : 'A IA errou ou omitiu um fato; o cliente recebeu o texto padrão, correto'" />
        </div>
      </section>

      <!-- Sentimento: suposição a partir das ações e motivos já registrados; nada é gravado por cliente. -->
      <section class="space-y-3" aria-labelledby="sentimento">
        <div>
          <h2 id="sentimento" class="text-lg font-semibold">Sentimento estimado</h2>
          <p class="text-sm text-muted">Suposição por conversa, a partir do que aconteceu nela. Não é gravado por cliente nem lido do texto: aparece só aqui, somado.</p>
        </div>
        <SentimentoPainel :dados="p.sentimento" />
      </section>

      <!-- 5. Custos e latência -->
      <section class="space-y-3" aria-labelledby="custos">
        <h2 id="custos" class="text-lg font-semibold">Custos e latência</h2>
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard rotulo="Tempo de resposta" :valor="duracao(p.latencia.mediaMs)" icone="i-lucide-timer" dica="Média, da mensagem do cliente à resposta pronta" />
          <KpiCard rotulo="Chamadas à IA" :valor="inteiro(p.custo.chamadasLlm)" icone="i-lucide-send" tom="neutral" :dica="`${inteiro(p.custo.tokensEntrada)} tokens enviados, ${inteiro(p.custo.tokensSaida)} recebidos`" />
          <KpiCard rotulo="Custo estimado" :valor="reais(p.custo.totalCentavos)" icone="i-lucide-wallet" dica="Desde que o servidor subiu" />
          <KpiCard rotulo="Custo em escala" :valor="p.custo.porMilConversasCentavos === null ? '—' : reais(p.custo.porMilConversasCentavos)" icone="i-lucide-calculator" dica="Projeção para cada mil conversas" />
        </div>
      </section>
    </template>
  </div>
</template>
