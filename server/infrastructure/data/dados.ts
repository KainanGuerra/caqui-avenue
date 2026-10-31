import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { centavos, parseCsv } from './csv'
import type {
  ArtigoKb, Calendario, Cliente, ConversaHistorica, DadosDoCliente, Operacao, Posicao, Taxas,
} from '../../domain/types'

export type Dados = {
  clientes: ReadonlyMap<string, Cliente>
  calendario: Calendario
  taxas: Taxas
  kb: ArtigoKb[]
  /** Único caminho para ler posições e operações: sempre por cliente. */
  dadosDoCliente(clienteId: string): DadosDoCliente | null
  conversasHistoricas(): ConversaHistorica[]
}

const ler = (dir: string, arquivo: string) => readFileSync(join(dir, arquivo), 'utf-8')

function lerKb(dir: string): ArtigoKb[] {
  const pasta = join(dir, 'base_conhecimento')
  return readdirSync(pasta).filter((f) => f.endsWith('.md')).sort().map((f) => {
    const bruto = readFileSync(join(pasta, f), 'utf-8')
    const m = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(bruto)
    if (!m) throw new Error(`Artigo sem cabeçalho: ${f}`)
    const meta = Object.fromEntries(m[1]!.split('\n').map((l) => [l.slice(0, l.indexOf(':')).trim(), l.slice(l.indexOf(':') + 1).trim()]))
    return { id: meta.id!, titulo: meta.titulo!, revisadoEm: meta.revisado_em!, corpo: m[2]!.trim() }
  })
}

export function carregarDados(dir: string): Dados {
  const clientesJson = JSON.parse(ler(dir, 'clientes.json')) as Record<string, unknown>[]
  const clientes = new Map<string, Cliente>(clientesJson.map((c) => [String(c.id), {
    id: String(c.id), nome: String(c.nome), idade: Number(c.idade), cidade: String(c.cidade), uf: String(c.uf),
    cpfMascarado: String(c.cpf_mascarado), canalPreferido: String(c.canal_preferido), clienteDesde: String(c.cliente_desde),
    origem: c.origem as Cliente['origem'], saldoEmContaCentavos: Math.round(Number(c.saldo_em_conta_brl) * 100),
    notaPersona: c.nota_persona ? String(c.nota_persona) : null,
  }]))

  const posicoes = parseCsv(ler(dir, 'posicoes.csv')).map<Posicao>((r) => ({
    id: r.id_posicao!, clienteId: r.id_cliente!, produto: r.produto!, dataAplicacao: r.data_aplicacao!,
    valorAplicadoCentavos: centavos(r.valor_aplicado_brl!), taxaContratada: r.taxa_contratada!,
    vencimento: r.vencimento || null, saldoBrutoCentavos: centavos(r.saldo_bruto_brl!), dataReferencia: r.data_referencia!,
  }))
  const operacoes = parseCsv(ler(dir, 'operacoes.csv')).map<Operacao>((r) => ({
    id: r.id_operacao!, clienteId: r.id_cliente!, tipo: r.tipo as Operacao['tipo'], produto: r.produto || null,
    valorCentavos: centavos(r.valor_brl!), pedidoEm: r.pedido_em!, status: r.status as Operacao['status'],
    liquidacaoPrevista: r.liquidacao_prevista || null, observacao: r.observacao || null,
  }))

  const cal = JSON.parse(ler(dir, 'calendario.json')) as {
    inicio: string; fim: string; horario_corte: string; dias: { data: string; dia_util: boolean; feriado: string | null }[]
  }
  const calendario: Calendario = {
    inicio: cal.inicio, fim: cal.fim, horarioCorte: cal.horario_corte,
    diaUtil: new Map(cal.dias.map((d) => [d.data, d.dia_util])),
    feriados: new Map(cal.dias.filter((d) => d.feriado).map((d) => [d.data, d.feriado!])),
  }

  const t = JSON.parse(ler(dir, 'taxas.json')) as Record<string, any>
  const taxas: Taxas = {
    dataReferencia: t.data_referencia, cdiAa: t.cdi_aa, poupancaAm: t.poupanca_am,
    irRegressivo: (t.ir_regressivo as any[]).map((f) => ({ atedias: f.ate_dias ?? null, aliquota: f.aliquota })),
    produtos: (t.produtos as any[]).map((p) => ({
      codigo: p.codigo, nome: p.nome, tipo: p.tipo, pctCdi: p.pct_cdi ?? null, tributavel: Boolean(p.tributavel),
      liquidez: p.liquidez, carenciaDias: p.carencia_dias ?? 0, cotizacaoDu: p.cotizacao_du ?? null,
      pagamentoDu: p.pagamento_du ?? null, cotizacaoCorridos: p.cotizacao_corridos ?? null,
      pagamentoDuAposCotizacao: p.pagamento_du_apos_cotizacao ?? null,
    })),
  }

  const porCliente = <T extends { clienteId: string }>(lista: T[]) => {
    const m = new Map<string, T[]>()
    for (const x of lista) m.set(x.clienteId, [...(m.get(x.clienteId) ?? []), x])
    return m
  }
  const posPorCliente = porCliente(posicoes)
  const opPorCliente = porCliente(operacoes)
  const kb = lerKb(dir)

  return {
    clientes, calendario, taxas, kb,
    dadosDoCliente(clienteId) {
      const cliente = clientes.get(clienteId)
      if (!cliente) return null
      return { cliente, posicoes: posPorCliente.get(clienteId) ?? [], operacoes: opPorCliente.get(clienteId) ?? [] }
    },
    conversasHistoricas() {
      return parseCsv(ler(dir, 'conversas.csv')).map<ConversaHistorica>((r) => ({
        id: r.id_conversa!, clienteId: r.id_cliente!, motivo: r.motivo!, risco: r.risco!,
        sinais: r.sinais ? r.sinais.split(';').map((s) => s.trim()).filter(Boolean) : [], transcricao: r.transcricao!,
      }))
    },
  }
}
