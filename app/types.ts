// Formatos que a API devolve para as duas telas.
export type Fonte = { tipo: string; id: string; rotulo: string }

export type Mensagem = {
  papel: 'cliente' | 'agente' | 'humano'
  texto: string
  em: string
  acao?: string
  fontes?: Fonte[]
  protocolo?: string
  oferecerHumano?: boolean
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
/** Quando cai um resgate pedido agora, calculado pelo servidor com o relógio e o calendário (regra 1). */
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
  rendimentoBrutoCentavos: number
  resgate: PrazoResgate | null
}

export type OperacaoVista = {
  id: string
  tipo: 'aplicacao' | 'resgate' | 'transferencia_saida_pix' | 'transferencia_entrada'
  valorCentavos: number
  pedidoEm: string
  status: 'pendente' | 'em_processamento' | 'liquidada' | 'recusada'
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

// Artigo da base pronto para ler, sem HTML. Espelha server/domain/kb-reading.ts.
export type Trecho = { texto: string; forte: boolean }
export type BlocoArtigo =
  | { tipo: 'paragrafo'; trechos: Trecho[] }
  | { tipo: 'lista'; ordenada: boolean; itens: Trecho[][] }
  | { tipo: 'tabela'; cabecalho: string[]; linhas: string[][] }
export type ArtigoLeitura = { id: string; titulo: string; revisadoEm: string; blocos: BlocoArtigo[] }

// Página de Atendimento do cliente. Espelha server/domain/support-view.ts.
export type PerguntaComFonte = { pergunta: string; kbId: string | null }
export type PerguntaFrequente = PerguntaComFonte & { artigo: ArtigoLeitura | null }

export type CasoVista = { protocolo: string; motivo: string; criadoEm: string; status: 'respondido' | 'em_andamento' }

export type AtendimentoVista = {
  humanoDisponivel: boolean
  horario: string
  retorno: string | null
  faq: PerguntaFrequente[]
  especialista: PerguntaComFonte
  casos: CasoVista[]
}

// Pedido feito numa página. Espelha server/application/page-request-service.ts.
export type TipoPedido = 'pessoa' | 'especialista' | 'seguranca'
export type PaginaPedido = 'Atendimento' | 'Investir'
export type ResultadoPedido = {
  acao: string
  protocolo: string
  humanoDisponivel: boolean
  retorno: string | null
  texto: string
  orientacao: ArtigoLeitura[]
}

// Páginas Investir e Aprender. Espelham server/domain/invest-view.ts e learning-view.ts.
export type ProdutoVista = { codigo: string; nome: string; rentabilidade: string; liquidez: string; imposto: string; kbId: string | null }
export type InvestirVista = { produtos: ProdutoVista[]; artigos: ArtigoLeitura[]; especialista: PerguntaComFonte }
export type TemaAprender = { titulo: string; artigos: ArtigoLeitura[] }

export type ResumoFila = { emAberto: number; golpe: number; prioridade: number; assumidos: number; resolvidos: number }

// Painel do gerente (GET /api/gerente/painel): a Kaki desde que o servidor subiu. Percentual null = sem base para calcular.
export type Contagem = { chave: string; rotulo: string; total: number; pct: number }

export type StatusCaso = 'aberto' | 'assumido' | 'resolvido'
export type CasoEscalonado = { protocolo: string; clienteNome: string; acao: string; motivos: string[]; status: StatusCaso; prioridade: 0 | 1 | 2; criadoEm: string }

export type Sentimento = 'preocupado' | 'insatisfeito' | 'frustrado' | 'satisfeito' | 'neutro'
export type Polaridade = 'negativo' | 'neutro' | 'positivo'
export type ContagemSentimento = Contagem & { chave: Sentimento; criterio: string; polaridade: Polaridade }
export type ContagemPolaridade = Contagem & { chave: Polaridade }
export type ResumoSentimento = { conversas: number; polaridades: ContagemPolaridade[]; categorias: ContagemSentimento[] }

export type PainelGerente = {
  redacao: 'template' | 'anthropic' | 'openai'
  conversas: number
  mensagens: number
  resolucaoAutomaticaPct: number | null
  escalonadas: number
  escalonadasPct: number | null
  sentimento: ResumoSentimento
  travadas: number
  porAcao: Contagem[]
  casos: { itens: CasoEscalonado[]; total: number; pagina: number; paginas: number }
  qualidade: { redacoesLlm: number; reprovadasPct: number | null; comFontePct: number | null; naoEntendeuPct: number | null }
  latencia: { mediaMs: number | null }
  custo: { chamadasLlm: number; tokensEntrada: number; tokensSaida: number; totalCentavos: number; porMilConversasCentavos: number | null; precoConfigurado: boolean }
}
