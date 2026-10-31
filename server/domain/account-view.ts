import type { CalendarioUtil } from './calendar'
import { dataBr, hhmm, parseMomento, type Momento } from './momento'
import { CORTE_MINUTOS, calcularLiquidacao, diaBase } from './settlement'
import type { DadosDoCliente, Operacao, Posicao, ProdutoTaxa, Taxas } from './types'

/** Quando o dinheiro cai se o resgate for pedido agora. Datas em AAAA-MM-DD, sempre calculadas (regra 1). */
export type PrazoResgate =
  | { tipo: 'liquida'; pagamento: string; detalhe: string; fontes: string[] }
  | { tipo: 'em_carencia'; disponivelEm: string; fontes: string[] }
  | { tipo: 'no_vencimento'; vencimento: string | null; fontes: string[] }

export type PosicaoVista = {
  id: string
  produto: string
  nomeProduto: string
  dataAplicacao: string
  taxaContratada: string
  vencimento: string | null
  valorAplicadoCentavos: number
  saldoBrutoCentavos: number
  /** Saldo bruto menos o valor aplicado (antes do IR); pode ser negativo, como nas ações. */
  rendimentoBrutoCentavos: number
  /** null quando o produto da posição não está na tabela de taxas. */
  resgate: PrazoResgate | null
}

// Sem liquidacao_prevista: a coluna da planilha não é fonte de data (regra 1); o prazo das operações em processamento
// sai de `emAndamento`, calculado.
export type OperacaoVista = Pick<Operacao, 'id' | 'tipo' | 'valorCentavos' | 'pedidoEm' | 'status'> & { nomeProduto: string | null }

export type EstadoEtapa = 'feito' | 'atual' | 'proximo'
/** `data` em AAAA-MM-DD; `hora` só no pedido ("19h40"). */
export type Etapa = { titulo: string; detalhe: string; data: string; hora: string | null; estado: EstadoEtapa }

export type OperacaoEmAndamento = {
  operacaoId: string
  tipo: 'aplicacao' | 'resgate'
  valorCentavos: number
  nomeProduto: string
  /** Data calculada pelo calendário e pelo corte das 16h; null quando o produto não liquida agora (carência, vencimento). */
  liquidacaoPrevista: string | null
  etapas: Etapa[]
  fontes: string[]
}

export type ClasseAlocacao = 'renda_fixa' | 'renda_variavel'
export type FatiaAlocacao = { classe: ClasseAlocacao; rotulo: string; centavos: number; percentual: number }

export type Aviso = { data: string; titulo: string; detalhe: string; fontes: string[] }

export type ContaVista = {
  /** Data de hoje no relógio do servidor (AAAA-MM-DD): a tela só a usa para escrever "hoje". */
  hoje: string
  /** Data de referência dos saldos das posições. */
  atualizadoEm: string
  saldoEmContaCentavos: number
  totalAplicadoCentavos: number
  totalBrutoCentavos: number
  /** Saldo bruto das posições mais o saldo em conta. */
  patrimonioCentavos: number
  /** Saldo bruto menos o aplicado, desde a data de cada aplicação (antes do IR). */
  resultadoCentavos: number
  /** Resultado sobre o aplicado, em %, com uma casa; 0 sem posição. */
  resultadoPercentual: number
  posicoes: PosicaoVista[]
  operacoes: OperacaoVista[]
  emAndamento: OperacaoEmAndamento[]
  alocacao: FatiaAlocacao[]
  avisos: Aviso[]
}

export const MAX_OPERACOES = 6
/** Janela dos avisos de feriado: os próximos 5 dias úteis a partir de hoje. */
export const DIAS_UTEIS_AVISO = 5

const FONTE_PRAZOS = 'KB-006'
const FONTE_CALENDARIO = 'calendário da Caqui'

// Multimercado entra como renda variável: a cota pode cair (KB-014). A Home só mostra duas classes (D12).
const RENDA_VARIAVEL = new Set(['ACOES', 'FUNDO-MM-01'])
const ROTULO_CLASSE: Record<ClasseAlocacao, string> = { renda_fixa: 'Renda fixa', renda_variavel: 'Renda variável' }

const SEMANA = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']
const indiceSemana = (data: string) => new Date(`${data}T12:00:00Z`).getUTCDay()
const diaDaSemana = (data: string) => SEMANA[indiceSemana(data)]!
const ehFimDeSemana = (data: string) => indiceSemana(data) === 0 || indiceSemana(data) === 6
const diaMes = (data: string) => dataBr(data).slice(0, 5)

// A tela só exibe: somas, datas, etapas e textos saem daqui. Sem CPF e sem campo de outro cliente (regra 10).
export function montarConta(conta: DadosDoCliente, taxas: Taxas, cal: CalendarioUtil, agora: Momento): ContaVista {
  const hoje = agora.data
  const produtoDe = (codigo: string | null) => (codigo ? taxas.produtos.find((p) => p.codigo === codigo) ?? null : null)
  const nome = (codigo: string | null) => (codigo ? (produtoDe(codigo)?.nome ?? codigo) : null)
  const posicoes = conta.posicoes.map<PosicaoVista>((p) => {
    const produto = produtoDe(p.produto)
    return {
      id: p.id, produto: p.produto, nomeProduto: produto?.nome ?? p.produto, dataAplicacao: p.dataAplicacao, taxaContratada: p.taxaContratada,
      vencimento: p.vencimento, valorAplicadoCentavos: p.valorAplicadoCentavos, saldoBrutoCentavos: p.saldoBrutoCentavos,
      rendimentoBrutoCentavos: p.saldoBrutoCentavos - p.valorAplicadoCentavos,
      resgate: produto ? prazoDeResgate(p, produto, cal, agora) : null,
    }
  })
  const operacoes = [...conta.operacoes]
    .sort((a, b) => b.pedidoEm.localeCompare(a.pedidoEm))
    .slice(0, MAX_OPERACOES)
    .map<OperacaoVista>((o) => ({ id: o.id, tipo: o.tipo, valorCentavos: o.valorCentavos, pedidoEm: o.pedidoEm, status: o.status, nomeProduto: nome(o.produto) }))
  const soma = (f: (p: PosicaoVista) => number) => posicoes.reduce((s, p) => s + f(p), 0)
  const totalAplicadoCentavos = soma((p) => p.valorAplicadoCentavos)
  const totalBrutoCentavos = soma((p) => p.saldoBrutoCentavos)
  const resultadoCentavos = totalBrutoCentavos - totalAplicadoCentavos
  return {
    hoje,
    atualizadoEm: conta.posicoes.reduce((max, p) => (p.dataReferencia > max ? p.dataReferencia : max), '') || hoje,
    saldoEmContaCentavos: conta.cliente.saldoEmContaCentavos,
    totalAplicadoCentavos,
    totalBrutoCentavos,
    patrimonioCentavos: totalBrutoCentavos + conta.cliente.saldoEmContaCentavos,
    resultadoCentavos,
    resultadoPercentual: totalAplicadoCentavos ? Math.round((resultadoCentavos / totalAplicadoCentavos) * 1000) / 10 : 0,
    posicoes, operacoes,
    emAndamento: operacoesEmAndamento(conta, produtoDe, cal, hoje),
    alocacao: alocarPorClasse(conta.posicoes),
    avisos: avisosDeFeriado(cal, hoje),
  }
}

/**
 * Operações em processamento com as etapas do prazo. As datas vêm sempre do cálculo (corte das 16h e dias úteis):
 * a coluna liquidacao_prevista dos dados nunca é a fonte (regra 1).
 */
export function operacoesEmAndamento(
  conta: DadosDoCliente, produtoDe: (codigo: string | null) => ProdutoTaxa | null, cal: CalendarioUtil, hoje: string,
): OperacaoEmAndamento[] {
  return [...conta.operacoes]
    .filter((o): o is Operacao & { tipo: 'aplicacao' | 'resgate' } => o.status === 'em_processamento' && (o.tipo === 'aplicacao' || o.tipo === 'resgate'))
    .sort((a, b) => b.pedidoEm.localeCompare(a.pedidoEm))
    .flatMap((o) => {
      const produto = produtoDe(o.produto)
      if (!produto) return []
      const posicao = conta.posicoes.find((p) => p.produto === produto.codigo)
      const { etapas, liquidacaoPrevista } = etapasDaOperacao(o, produto, posicao, cal, hoje)
      return [{ operacaoId: o.id, tipo: o.tipo, valorCentavos: o.valorCentavos, nomeProduto: produto.nome, liquidacaoPrevista, etapas, fontes: [FONTE_PRAZOS, o.id] }]
    })
}

function etapasDaOperacao(
  o: Operacao & { tipo: 'aplicacao' | 'resgate' }, produto: ProdutoTaxa, posicao: Posicao | undefined, cal: CalendarioUtil, hoje: string,
): { etapas: Etapa[]; liquidacaoPrevista: string | null } {
  const pedido = parseMomento(o.pedidoEm)
  const base = diaBase(cal, pedido.data, pedido.minutos)
  const detalhePedido = base === pedido.data
    ? 'Até 16h de dia útil: conta no mesmo dia'
    : !cal.ehDiaUtil(pedido.data) ? 'Fim de semana ou feriado: conta a partir do próximo dia útil'
      : `Depois das ${hhmm(CORTE_MINUTOS)}: conta a partir do próximo dia útil`
  const etapas: Omit<Etapa, 'estado'>[] = [{ titulo: 'Pedido recebido', detalhe: detalhePedido, data: pedido.data, hora: hhmm(pedido.minutos) }]

  // Para aplicação, a KB-006 só garante o corte das 16h e a liquidação no dia-base de CDB e LCI com liquidez diária.
  // Nos demais produtos o prazo de aplicação não está na base: mostra o dia-base e não inventa a data.
  if (o.tipo === 'aplicacao') {
    if (produto.liquidez.startsWith('diaria') && (produto.tipo === 'CDB' || produto.tipo === 'LCI')) {
      etapas.push({ titulo: 'Liquidação', detalhe: detalheLiquidacao(produto), data: base, hora: null })
      etapas.push({ titulo: 'Aplicado no produto', detalhe: 'O valor passa a render no produto', data: base, hora: null })
      return { etapas: marcarEstados(etapas, hoje), liquidacaoPrevista: base }
    }
    etapas.push({ titulo: 'Dia-base do pedido', detalhe: 'O prazo da aplicação conta a partir deste dia útil', data: base, hora: null })
    return { etapas: marcarEstados(etapas, hoje), liquidacaoPrevista: null }
  }

  const liq = calcularLiquidacao(cal, { produto, data: pedido.data, minutos: pedido.minutos, dataAplicacao: posicao?.dataAplicacao, vencimento: posicao?.vencimento })
  if (liq.tipo === 'liquida') {
    if (liq.cotizacao) etapas.push({ titulo: 'Cotização', detalhe: 'O valor da cota do dia é apurado', data: liq.cotizacao, hora: null })
    etapas.push({ titulo: 'Liquidação', detalhe: detalheLiquidacao(produto), data: liq.pagamento, hora: null })
    etapas.push({ titulo: 'No saldo disponível', detalhe: 'O valor entra no seu saldo em conta', data: liq.pagamento, hora: null })
  } else if (liq.tipo === 'em_carencia') {
    etapas.push({ titulo: 'Fim da carência', detalhe: 'Antes disso o produto não pode ser resgatado', data: liq.disponivelEm, hora: null })
  } else if (liq.vencimento) {
    etapas.push({ titulo: 'Vencimento', detalhe: 'Produto sem liquidez diária: o valor sai no vencimento', data: liq.vencimento, hora: null })
  }
  return { etapas: marcarEstados(etapas, hoje), liquidacaoPrevista: liq.tipo === 'liquida' ? liq.pagamento : null }
}

/** O mesmo cálculo da conversa (`calcularLiquidacao`), com o pedido feito agora. */
export function prazoDeResgate(posicao: Pick<Posicao, 'dataAplicacao' | 'vencimento'>, produto: ProdutoTaxa, cal: CalendarioUtil, agora: Momento): PrazoResgate {
  const fontes = [FONTE_PRAZOS]
  const liq = calcularLiquidacao(cal, { produto, data: agora.data, minutos: agora.minutos, dataAplicacao: posicao.dataAplicacao, vencimento: posicao.vencimento })
  if (liq.tipo === 'em_carencia') return { tipo: 'em_carencia', disponivelEm: liq.disponivelEm, fontes }
  if (liq.tipo === 'sem_liquidez_diaria') return { tipo: 'no_vencimento', vencimento: liq.vencimento, fontes }
  const contaDepois = liq.diaBase !== agora.data
    ? ` Pedido agora conta a partir de ${diaDaSemana(liq.diaBase)}, ${diaMes(liq.diaBase)}${cal.ehDiaUtil(agora.data) ? `, porque passou das ${hhmm(CORTE_MINUTOS)}` : ''}.`
    : ''
  return { tipo: 'liquida', pagamento: liq.pagamento, detalhe: `${detalheLiquidacao(produto)}.${contaDepois}`, fontes }
}

function detalheLiquidacao(produto: ProdutoTaxa): string {
  if (produto.tipo === 'TESOURO') return 'Tesouro Selic: 1 dia útil após o dia-base'
  if (produto.tipo === 'ACOES') return 'Ações: 2 dias úteis após o dia-base'
  if (produto.tipo === 'FUNDO' && produto.pagamentoDuAposCotizacao !== null) return `Pagamento ${produto.pagamentoDuAposCotizacao} dias úteis após a cotização`
  if (produto.tipo === 'FUNDO' && produto.pagamentoDu !== null) return `Pagamento ${produto.pagamentoDu} dias úteis após o dia-base`
  return 'Liquidez diária: liquida no dia-base'
}

// O pedido já aconteceu. Das etapas seguintes, a primeira de hoje em diante é a atual; se todas já passaram e a operação
// segue em processamento (atraso), a última continua como atual: a tela não diz que terminou o que não terminou.
function marcarEstados(etapas: Omit<Etapa, 'estado'>[], hoje: string): Etapa[] {
  const iAtual = etapas.findIndex((e, i) => i > 0 && e.data >= hoje)
  const atual = iAtual === -1 ? etapas.length - 1 : iAtual
  return etapas.map((e, i) => ({ ...e, estado: i < atual ? 'feito' : i === atual ? 'atual' : 'proximo' }))
}

/** Classe por produto; percentuais inteiros que somam 100 (maiores restos), sobre o saldo bruto. */
export function alocarPorClasse(posicoes: Pick<Posicao, 'produto' | 'saldoBrutoCentavos'>[]): FatiaAlocacao[] {
  const centavos: Record<ClasseAlocacao, number> = { renda_fixa: 0, renda_variavel: 0 }
  for (const p of posicoes) centavos[RENDA_VARIAVEL.has(p.produto) ? 'renda_variavel' : 'renda_fixa'] += p.saldoBrutoCentavos
  const total = centavos.renda_fixa + centavos.renda_variavel
  if (total <= 0) return []
  const fatias = (Object.keys(centavos) as ClasseAlocacao[])
    .filter((c) => centavos[c] > 0)
    .map((classe) => {
      const exato = (centavos[classe] * 100) / total
      return { classe, rotulo: ROTULO_CLASSE[classe], centavos: centavos[classe], percentual: Math.floor(exato), resto: exato - Math.floor(exato) }
    })
  let falta = 100 - fatias.reduce((s, f) => s + f.percentual, 0)
  for (const f of [...fatias].sort((a, b) => b.resto - a.resto)) {
    if (falta-- <= 0) break
    f.percentual += 1
  }
  return fatias.map(({ resto: _resto, ...f }) => f)
}

/**
 * Feriados do calendário entre amanhã e o 5º dia útil: mudam o prazo de qualquer pedido feito na véspera depois das 16h
 * e de todo resgate cuja contagem passe por eles. Feriado em fim de semana não muda prazo e não vira aviso.
 */
export function avisosDeFeriado(cal: CalendarioUtil, hoje: string): Aviso[] {
  const limite = cal.somarDiasUteis(hoje, DIAS_UTEIS_AVISO)
  const avisos: Aviso[] = []
  for (let d = cal.somarDiasCorridos(hoje, 1); d <= limite; d = cal.somarDiasCorridos(d, 1)) {
    const feriado = cal.nomeFeriado(d)
    if (!feriado || cal.ehDiaUtil(d) || ehFimDeSemana(d)) continue
    let vespera = cal.somarDiasCorridos(d, -1)
    while (!cal.ehDiaUtil(vespera)) vespera = cal.somarDiasCorridos(vespera, -1)
    const depois = cal.proximoDiaUtil(d)
    avisos.push({
      data: d,
      titulo: `${diaMes(d)} é feriado (${feriado})`,
      detalhe: `Pedidos de ${diaDaSemana(vespera)}, ${diaMes(vespera)}, depois das ${hhmm(CORTE_MINUTOS)} contam a partir de ${diaDaSemana(depois)}, ${diaMes(depois)}.`,
      fontes: [FONTE_PRAZOS, FONTE_CALENDARIO],
    })
  }
  return avisos
}
