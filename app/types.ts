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

export type EstadoEtapa = 'feito' | 'atual' | 'proximo'
export type Etapa = { titulo: string; detalhe: string; data: string; hora: string | null; estado: EstadoEtapa }

export type OperacaoEmAndamento = {
  operacaoId: string
  tipo: 'aplicacao' | 'resgate'
  valorCentavos: number
  nomeProduto: string
  liquidacaoPrevista: string | null
  etapas: Etapa[]
  fontes: string[]
}

export type FatiaAlocacao = { classe: 'renda_fixa' | 'renda_variavel'; rotulo: string; centavos: number; percentual: number }

export type Aviso = { data: string; titulo: string; detalhe: string; fontes: string[] }

export type ContaVista = {
  hoje: string
  atualizadoEm: string
  saldoEmContaCentavos: number
  totalAplicadoCentavos: number
  totalBrutoCentavos: number
  patrimonioCentavos: number
  resultadoCentavos: number
  resultadoPercentual: number
  posicoes: PosicaoVista[]
  operacoes: OperacaoVista[]
  emAndamento: OperacaoEmAndamento[]
  alocacao: FatiaAlocacao[]
  avisos: Aviso[]
}

// Página de Atendimento do cliente. Espelha server/domain/support-view.ts.
export type PerguntaComFonte = { pergunta: string; kbId: string | null }

export type CasoVista = { protocolo: string; motivo: string; criadoEm: string; status: 'respondido' | 'em_andamento' }

export type AtendimentoVista = {
  humanoDisponivel: boolean
  horario: string
  retorno: string | null
  faq: PerguntaComFonte[]
  especialista: PerguntaComFonte
  casos: CasoVista[]
}

export type ResumoFila = { emAberto: number; golpe: number; prioridade: number; assumidos: number; resolvidos: number }
