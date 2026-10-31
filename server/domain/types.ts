// Tipos do domínio. Dinheiro sempre em centavos inteiros; datas em AAAA-MM-DD; horários em ISO com offset.

export type Cliente = {
  id: string
  nome: string
  idade: number
  cidade: string
  uf: string
  cpfMascarado: string
  canalPreferido: string
  clienteDesde: string
  origem: 'direto' | 'parceria_varejista'
  saldoEmContaCentavos: number
  notaPersona: string | null
}

export type Posicao = {
  id: string
  clienteId: string
  produto: string
  dataAplicacao: string
  valorAplicadoCentavos: number
  taxaContratada: string
  vencimento: string | null
  saldoBrutoCentavos: number
  dataReferencia: string
}

export type Operacao = {
  id: string
  clienteId: string
  tipo: 'aplicacao' | 'resgate' | 'transferencia_saida_pix' | 'transferencia_entrada'
  produto: string | null
  valorCentavos: number
  pedidoEm: string
  status: 'pendente' | 'em_processamento' | 'liquidada' | 'recusada'
  liquidacaoPrevista: string | null
  observacao: string | null
}

export type Feriado = { data: string; nome: string }

export type Calendario = {
  inicio: string
  fim: string
  horarioCorte: string
  diaUtil: ReadonlyMap<string, boolean>
  feriados: ReadonlyMap<string, string>
}

export type FaixaIr = { atedias: number | null; aliquota: number }

export type ProdutoTaxa = {
  codigo: string
  nome: string
  tipo: 'CDB' | 'LCI' | 'LCA' | 'FUNDO' | 'TESOURO' | 'ACOES' | string
  pctCdi: number | null
  tributavel: boolean
  liquidez: string
  carenciaDias: number
  cotizacaoDu: number | null
  pagamentoDu: number | null
  cotizacaoCorridos: number | null
  pagamentoDuAposCotizacao: number | null
}

export type Taxas = {
  dataReferencia: string
  cdiAa: number
  poupancaAm: number
  irRegressivo: FaixaIr[]
  produtos: ProdutoTaxa[]
}

export type ArtigoKb = {
  id: string
  titulo: string
  revisadoEm: string
  corpo: string
}

export type ConversaHistorica = {
  id: string
  clienteId: string
  motivo: string
  risco: string
  sinais: string[]
  transcricao: string
}

// O motor só recebe os dados do cliente da sessão: dado alheio não tem por onde entrar (regras 10 e 11).
export type DadosDoCliente = {
  cliente: Cliente
  posicoes: Posicao[]
  operacoes: Operacao[]
}

export type Acao =
  | 'responder'
  | 'encaminhar_humano'
  | 'encaminhar_especialista'
  | 'seguranca_imediata'
  | 'protocolo'
  | 'recusar'

export type Fonte = { tipo: 'kb' | 'conta' | 'taxas' | 'calendario'; id: string; rotulo: string }
