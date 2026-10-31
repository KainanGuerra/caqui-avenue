// Formatos que a API devolve para as duas telas.
export type Fonte = { tipo: string; id: string; rotulo: string }

export type Mensagem = {
  papel: 'cliente' | 'agente' | 'humano'
  texto: string
  em: string
  acao?: string
  fontes?: Fonte[]
  protocolo?: string
}

export type ClienteResumo = { id: string; nome: string; idade: number; persona: string | null }

export type CasoResumo = { protocolo: string; status: 'aberto' | 'assumido' | 'resolvido'; atendente: string | null }

export type Caso = {
  id: string
  protocolo: string
  sessaoId: string
  clienteId: string
  clienteNome: string
  idade: number
  cpfMascarado: string
  acao: string
  motivos: string[]
  motivosTexto: string[]
  prioridade: 0 | 1 | 2
  risco: 'baixo' | 'medio' | 'alto' | 'critico'
  status: 'aberto' | 'assumido' | 'resolvido'
  atendente: string | null
  criadoEm: string
  atualizadoEm: string
  resumo: string[]
  fontes: Fonte[]
}

// Dashboard do cliente (só leitura, centavos inteiros). Espelha server/domain/account-view.ts.
export type PosicaoVista = {
  id: string
  produto: string
  nomeProduto: string
  dataAplicacao: string
  taxaContratada: string
  vencimento: string | null
  valorAplicadoCentavos: number
  saldoBrutoCentavos: number
  rendimentoBrutoCentavos: number
}

export type OperacaoVista = {
  id: string
  tipo: 'aplicacao' | 'resgate' | 'transferencia_saida_pix' | 'transferencia_entrada'
  valorCentavos: number
  pedidoEm: string
  status: 'pendente' | 'em_processamento' | 'liquidada' | 'recusada'
  liquidacaoPrevista: string | null
  nomeProduto: string | null
}

export type ContaVista = {
  saldoEmContaCentavos: number
  totalAplicadoCentavos: number
  totalBrutoCentavos: number
  posicoes: PosicaoVista[]
  operacoes: OperacaoVista[]
}

export type ResumoFila = { emAberto: number; golpe: number; prioridade: number; assumidos: number; resolvidos: number }
