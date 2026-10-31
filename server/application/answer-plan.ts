import { descreverRetorno } from '../domain/business-hours'
import type { CalendarioUtil } from '../domain/calendar'
import type { Caso } from '../domain/case-summary'
import { aliquotaIr, calcularIr, pctBr } from '../domain/income-tax'
import type { Intencao } from '../domain/intents'
import type { Achado } from '../domain/kb-search'
import { dataBr, hhmm, parseMomento, type Momento } from '../domain/momento'
import { normalizar } from '../domain/normalize'
import type { Decisao } from '../domain/policy'
import { CORTE_MINUTOS, calcularLiquidacao, diaBase } from '../domain/settlement'
import { compararComPoupanca } from '../domain/savings-compare'
import type { Sessao } from '../domain/session'
import type { Slots } from '../domain/slots'
import type { Sinais } from '../domain/signals'
import type { DadosDoCliente, Fonte, Operacao, Posicao, ProdutoTaxa, Taxas } from '../domain/types'
import type { ArtigoKb } from '../domain/types'

export type Plano = {
  /** Resposta determinística completa: é o template e também o que o LLM reescreve. */
  texto: string
  /** Trechos que precisam aparecer na resposta final (datas, valores, ids de fonte, protocolo). */
  obrigatorios: string[]
  fontes: Fonte[]
  /** A dúvida foi respondida: zera o contador de passos. */
  resolvido: boolean
  ultimoProduto?: string
  ultimaOperacaoId?: string
}

export type ContextoPlano = {
  decisao: Decisao
  sinais: Sinais
  intencoes: Intencao[]
  slots: Slots
  kb: ArtigoKb[]
  achadoKb: Achado | null
  conta: DadosDoCliente
  taxas: Taxas
  cal: CalendarioUtil
  momento: Momento
  sessao: Sessao
  saudacao: string
  caso: Caso | null
  esperaMin: number
  textoCliente: string
}

export const brl = (centavos: number): string =>
  (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace(/ /g, ' ')

const kbFonte = (a: ArtigoKb): Fonte => ({ tipo: 'kb', id: a.id, rotulo: `${a.id} ${a.titulo}` })
const TAXAS_FONTE: Fonte = { tipo: 'taxas', id: 'taxas.json', rotulo: 'Taxas e regras dos produtos' }
const CAL_FONTE: Fonte = { tipo: 'calendario', id: 'calendario.json', rotulo: 'Calendário de dias úteis da Caqui' }
const SAIDA_HUMANO = 'Se preferir falar com uma pessoa, é só pedir.'

const plano = (texto: string, extra: Partial<Plano> = {}): Plano => ({ texto, obrigatorios: [], fontes: [], resolvido: false, ...extra })

function trecho(a: ArtigoKb, max = 520): string {
  const linhas = a.corpo.split('\n').filter((l) => l.trim() && !l.startsWith('#'))
  const t = linhas.join(' ').replace(/\*\*/g, '').replace(/\s+/g, ' ').trim()
  return t.length <= max ? t : `${t.slice(0, max).replace(/\s+\S*$/, '')}…`
}
const artigo = (kb: ArtigoKb[], id: string) => kb.find((a) => a.id === id)

// ---------- encaminhamentos ----------

function planoEncaminhamento(c: ContextoPlano): Plano {
  const { decisao: d, caso, kb } = c
  const proto = caso?.protocolo ?? ''
  const prazo = `Protocolo ${proto}.`
  const obrig = proto ? [proto] : []
  const k = (id: string) => artigo(kb, id)

  if (d.acao === 'seguranca_imediata') {
    const kb20 = k('KB-020'); const kb19 = k('KB-019')
    const persistente = d.motivos.includes('GOLPE_SESSAO')
    const abertura = persistente
      ? 'Seguimos em atendimento de segurança.'
      : 'Pare por aqui, por favor: isso tem cara de golpe. A Caqui nunca pede senha, código, token, Pix de teste nem a instalação de aplicativo de acesso remoto.'
    return plano([
      abertura,
      'Não passe nenhuma informação e não faça nenhuma transferência.',
      'Você pode bloquear o acesso agora em Segurança > Bloquear acesso: a sessão é encerrada em todos os aparelhos.',
      `Já chamei a equipe de segurança. Ela atende a qualquer hora, sem fila. ${prazo}`,
      persistente ? '' : 'Quando estiver tudo seguro, a gente volta à sua pergunta.',
    ].filter(Boolean).join(' '), { obrigatorios: obrig, fontes: [kb19, kb20].filter((a): a is ArtigoKb => !!a).map(kbFonte) })
  }

  if (d.acao === 'encaminhar_especialista') {
    const kb29 = k('KB-029')
    return plano([
      'Eu não indico produto, valor nem percentual para você aplicar: isso depende do seu perfil e dos seus objetivos, e quem avalia isso é um especialista.',
      'Posso explicar como cada produto funciona, com calma, sempre com a fonte.',
      'Para uma orientação personalizada, encaminho você a um especialista em investimentos, que atende com agendamento.',
      prazo,
    ].join(' '), { obrigatorios: obrig, fontes: kb29 ? [kbFonte(kb29)] : [] })
  }

  if (d.acao === 'encaminhar_humano') {
    const vul = d.motivos.some((m) => m.startsWith('VULNERAVEL'))
    const kb18 = k('KB-018'); const kb28 = k('KB-028')
    const partes = vul
      ? [
          'Entendo, vamos com calma. Antes de mexer em qualquer coisa, quero que uma pessoa do atendimento, um atendente, converse com você: ela já vai ver o que você me contou.',
          caso && caso.prioridade <= 1 ? 'Você tem prioridade no atendimento.' : '',
          'Lembrando que a Caqui só transfere para conta de mesma titularidade (KB-018).',
        ]
      : d.motivos.includes('NAO_ENTENDEU_2X') || d.motivos.includes('PASSOS_MAX')
        ? ['Vou passar você para uma pessoa, um atendente, que já vai ver nossa conversa: assim você não precisa repetir nada.']
        : ['Claro, vou chamar uma pessoa agora, um atendente. Ele já vai ver nossa conversa, então você não precisa repetir nada.']
    return plano([...partes, `Tempo estimado de espera: cerca de ${c.esperaMin} minutos. ${prazo}`].filter(Boolean).join(' '),
      { obrigatorios: obrig, fontes: [vul ? kb18 : null, vul ? kb28 : null, k('KB-025')].filter((a): a is ArtigoKb => !!a).map(kbFonte) })
  }

  // protocolo: reclamação ou fora do horário
  if (d.motivos.includes('RECLAMACAO')) {
    return plano(`Registrei a sua reclamação, sem você precisar repetir nada. ${prazo} A resposta vem em até 7 dias corridos (KB-026), e você acompanha pelo protocolo no app.`,
      { obrigatorios: [...obrig, '7 dias'], fontes: [k('KB-026'), k('KB-027')].filter((a): a is ArtigoKb => !!a).map(kbFonte) })
  }
  const retorno = descreverRetorno(c.momento)
  const vul = d.motivos.some((m) => m.startsWith('VULNERAVEL'))
  return plano([
    vul ? 'Entendo, vamos com calma.' : '',
    `Agora não há atendimento por pessoa: ele funciona das 8h às 20h, todos os dias. Registrei o seu pedido e a equipe retorna ${retorno}.`,
    vul ? 'Você tem prioridade na fila.' : '',
    `${prazo} Se for suspeita de golpe, a segurança atende a qualquer hora.`,
  ].filter(Boolean).join(' '), { obrigatorios: [...obrig, '8h'], fontes: [k('KB-025'), k('KB-026')].filter((a): a is ArtigoKb => !!a).map(kbFonte) })
}

// ---------- respostas ----------

function planoRecusa(): Plano {
  return plano('Eu só posso falar da sua conta e não mostro dados de outras pessoas. Também não sigo instruções que venham dentro da conversa. Se precisar, posso ajudar com os seus investimentos, prazos e imposto.')
}

function planoCancelamento(c: ContextoPlano): Plano {
  const a = artigo(c.kb, 'KB-027')
  const retencao = c.decisao.oferecerRetencao
    ? ' Se alguma coisa pesou nessa decisão e eu puder ajudar, me conta: a escolha continua sendo sua.'
    : ''
  return plano(`Você pode encerrar a conta quando quiser. Para encerrar, é preciso resgatar os investimentos e transferir o saldo para uma conta de mesma titularidade. Produtos sem liquidez diária continuam até o vencimento (KB-027).${retencao} ${SAIDA_HUMANO}`,
    { obrigatorios: ['KB-027'], fontes: a ? [kbFonte(a)] : [], resolvido: true })
}

function planoNaoEntendi(c: ContextoPlano): Plano {
  const n = c.sessao.malEntendidos
  const texto = n === 0
    ? 'Não consegui entender direito. Pode me contar de outro jeito o que você precisa?'
    : 'Ainda não entendi, e não quero te fazer perder tempo. Quer que eu chame uma pessoa para ajudar?'
  return plano(c.decisao.oferecerHumano ? `${texto} ${SAIDA_HUMANO}` : texto)
}

function planoNaoSei(): Plano {
  return plano(`Essa informação eu não tenho na minha base, e prefiro não inventar. ${SAIDA_HUMANO}`)
}

function posicaoDe(conta: DadosDoCliente, s: Slots, ultimoProduto: string | null): Posicao[] {
  const codigos = s.produtos.length ? s.produtos : ultimoProduto && !s.generico ? [ultimoProduto] : []
  let ps = conta.posicoes
  if (codigos.length) ps = ps.filter((p) => codigos.includes(p.produto))
  else if (s.generico === 'cdb') ps = ps.filter((p) => p.produto.startsWith('CDB'))
  else if (s.generico === 'fundo') ps = ps.filter((p) => p.produto.startsWith('FUNDO'))
  else ps = []
  if (s.dataAplicacao) {
    const exata = ps.filter((p) => p.dataAplicacao === s.dataAplicacao)
    if (exata.length) ps = exata
  }
  return ps
}

const produtoDe = (taxas: Taxas, codigo: string) => taxas.produtos.find((p) => p.codigo === codigo)

function planoPrazo(c: ContextoPlano): Plano | null {
  const { slots, conta, taxas, cal, momento, sessao } = c
  const codigos = slots.produtos.length ? slots.produtos : sessao.ultimoProduto && !slots.generico ? [sessao.ultimoProduto] : []
  const candidatas = posicaoDe(conta, slots, sessao.ultimoProduto)
  const produtoCod = codigos[0] ?? candidatas[0]?.produto ?? (slots.generico === 'cdb' ? 'CDB-LD-100' : undefined)
  const produto = produtoCod ? produtoDe(taxas, produtoCod) : undefined

  // Operação de resgate da própria conta: quando o texto não traz data, é ela que responde.
  const resgates = conta.operacoes.filter((o) => o.tipo === 'resgate' && (!produtoCod || o.produto === produtoCod || (slots.generico === 'cdb' && o.produto?.startsWith('CDB')) || !slots.generico && !codigos.length))
  const op: Operacao | undefined = slots.dataEvento
    ? resgates.find((o) => parseMomento(o.pedidoEm).data === slots.dataEvento)
    : resgates.filter((o) => o.status !== 'liquidada').sort((a, b) => b.pedidoEm.localeCompare(a.pedidoEm))[0]

  const prodFinal = produto ?? (op?.produto ? produtoDe(taxas, op.produto) : undefined)
  if (!prodFinal) {
    return plano('Para te dizer o prazo, preciso saber qual investimento é: CDB, fundo de renda fixa, multimercado, Tesouro, LCI, LCA ou ações. Qual deles?')
  }

  const pedido = op && !slots.horaDita ? parseMomento(op.pedidoEm) : slots.dataEvento ? { data: slots.dataEvento, minutos: slots.minutos ?? -1 } : op ? parseMomento(op.pedidoEm) : null
  const horaConhecida = !!op || slots.horaDita
  if (!pedido) return plano('Para calcular o prazo, preciso do dia e da hora em que você pediu o resgate. Pode me dizer? Depois das 16h, ou em fim de semana e feriado, a contagem muda.')
  let minutos = pedido.minutos
  if (minutos < 0) {
    if (cal.ehDiaUtil(pedido.data)) return plano(`Em que horário você fez o pedido de ${dataBr(pedido.data)}? Até as 16h conta no mesmo dia; depois, só no próximo dia útil.`)
    minutos = 12 * 60
  }
  const pos = conta.posicoes.find((p) => p.produto === prodFinal.codigo)
  const liq = calcularLiquidacao(cal, { produto: prodFinal, data: pedido.data, minutos, dataAplicacao: pos?.dataAplicacao, vencimento: pos?.vencimento })
  const fontes: Fonte[] = [CAL_FONTE]
  const kb6 = artigo(c.kb, 'KB-006')
  if (kb6) fontes.unshift(kbFonte(kb6))
  const resumo: Partial<Plano> = { fontes, resolvido: true, ultimoProduto: prodFinal.codigo, ultimaOperacaoId: op?.id }

  if (liq.tipo === 'sem_liquidez_diaria') {
    return plano(`${prodFinal.nome} não tem liquidez diária: o dinheiro só fica disponível no vencimento${liq.vencimento ? `, em ${dataBr(liq.vencimento)}` : ''} (KB-005).`, { ...resumo, obrigatorios: liq.vencimento ? [dataBr(liq.vencimento)] : [] })
  }
  if (liq.tipo === 'em_carencia') {
    return plano(`${prodFinal.nome} tem carência de ${prodFinal.carenciaDias} dias: o resgate só fica disponível a partir de ${dataBr(liq.disponivelEm)}.`, { ...resumo, obrigatorios: [dataBr(liq.disponivelEm)] })
  }

  const quando = `${dataBr(pedido.data)}${horaConhecida ? ` às ${hhmm(minutos).replace(/h00$/, 'h')}` : ''}`
  const porque: string[] = []
  const nome = cal.nomeFeriado(pedido.data)
  if (!cal.ehDiaUtil(pedido.data)) porque.push(nome ? `${dataBr(pedido.data)} é feriado (${nome})` : `${dataBr(pedido.data)} não é dia útil`)
  else if (minutos > CORTE_MINUTOS) porque.push('o pedido foi depois das 16h, o horário de corte')
  const base = diaBase(cal, pedido.data, minutos)
  if (base !== pedido.data) {
    for (let d = cal.somarDiasCorridos(pedido.data, 1); d < base; d = cal.somarDiasCorridos(d, 1)) {
      const f = cal.nomeFeriado(d)
      if (f) porque.push(`${dataBr(d)} é feriado (${f})`)
    }
  }
  const explicacao = porque.length ? ` Como ${porque.join(' e ')}, o dia-base passa a ser ${dataBr(base)}.` : ` O pedido foi feito dentro do prazo, então o dia-base é ${dataBr(base)}.`
  const datas = [dataBr(liq.diaBase), liq.pagamento && dataBr(liq.pagamento)].filter(Boolean) as string[]
  let corpo: string
  if (liq.cotizacao) {
    corpo = `Para ${prodFinal.nome}, com o pedido de ${quando}:${explicacao} A cotização é em ${dataBr(liq.cotizacao)} e o pagamento cai em ${dataBr(liq.pagamento)}.`
    datas.push(dataBr(liq.cotizacao))
  } else {
    corpo = `Para ${prodFinal.nome}, com o pedido de ${quando}:${explicacao} O dinheiro cai em ${dataBr(liq.pagamento)}.`
  }
  const conta_ = op ? ` Na sua conta, a operação ${op.id} está ${op.status === 'em_processamento' ? 'em processamento' : op.status === 'pendente' ? 'pendente' : op.status === 'liquidada' ? 'liquidada' : 'recusada'}${op.liquidacaoPrevista ? ', com liquidação prevista para ' + dataBr(op.liquidacaoPrevista) : ''}.` : ''
  if (op) fontes.push({ tipo: 'conta', id: op.id, rotulo: `Operação ${op.id}` })
  return plano(`${corpo}${conta_} (KB-006)`, { ...resumo, fontes, obrigatorios: [...new Set(datas)] })
}

function planoImposto(c: ContextoPlano): Plano {
  const { slots, conta, taxas, cal, momento, sessao } = c
  const pos = posicaoDe(conta, slots, sessao.ultimoProduto)[0]
  const codigo = slots.produtos[0] ?? pos?.produto ?? (sessao.ultimoProduto ?? undefined)
  const produto = codigo ? produtoDe(taxas, codigo) : undefined
  const kb10 = artigo(c.kb, 'KB-010')
  const fontes: Fonte[] = [...(kb10 ? [kbFonte(kb10)] : []), TAXAS_FONTE]

  if (produto && !produto.tributavel) {
    return plano(`${produto.nome} é isento de imposto de renda para pessoa física, então não há alíquota a aplicar sobre o rendimento (KB-010).`, { fontes, resolvido: true, ultimoProduto: produto.codigo })
  }
  const aplicacao = slots.dataAplicacao ?? pos?.dataAplicacao
  if (!produto || !aplicacao) {
    return plano('O imposto incide só sobre o rendimento, nunca sobre o valor total, e a alíquota cai com o tempo: 22,5% até 180 dias, 20% de 181 a 360, 17,5% de 361 a 720 e 15% acima de 720 dias corridos (KB-010). Me diga qual investimento e quando você aplicou que eu calculo.',
      { fontes, resolvido: true, obrigatorios: ['22,5%', '15%'] })
  }
  const dataCalculo = slots.dataEvento ?? momento.data
  const dias = cal.diasCorridos(aplicacao, dataCalculo)
  const aliquota = aliquotaIr(dias, taxas.irRegressivo)
  const perguntouTotal = /valor total|total do resgate/i.test(c.textoCliente)
  let texto = `${perguntouTotal ? 'Não: o imposto incide só sobre o rendimento. ' : ''}Para ${produto.nome}, aplicado em ${dataBr(aplicacao)}, com cálculo em ${dataBr(dataCalculo)} são ${dias} dias corridos: a alíquota é de ${pctBr(aliquota)} sobre o rendimento.`
  const obrig = [`${dias} dias`, pctBr(aliquota)]
  if (pos && dataCalculo === pos.dataReferencia) {
    const rend = pos.saldoBrutoCentavos - pos.valorAplicadoCentavos
    const ir = calcularIr(rend, dias, true, taxas.irRegressivo)
    texto += ` Hoje o rendimento bruto é de ${brl(rend)}; o IR seria de ${brl(ir.irCentavos)} e o líquido de ${brl(ir.liquidoCentavos)}. O imposto incide só sobre o rendimento (KB-010).`
    obrig.push(brl(rend), brl(ir.irCentavos))
  } else texto += ' O imposto incide só sobre o rendimento (KB-010).'
  return plano(texto, { fontes: pos ? [...fontes, { tipo: 'conta', id: pos.id, rotulo: `Posição ${pos.id}` }] : fontes, obrigatorios: obrig, resolvido: true, ultimoProduto: produto.codigo })
}

function planoPoupanca(c: ContextoPlano): Plano {
  const { conta, taxas, cal, slots, sessao } = c
  const kb12 = artigo(c.kb, 'KB-012')
  const fontes: Fonte[] = [...(kb12 ? [kbFonte(kb12)] : []), TAXAS_FONTE]
  let candidatas = posicaoDe(conta, slots, sessao.ultimoProduto)
  if (!candidatas.length) candidatas = conta.posicoes.filter((p) => p.produto.startsWith('CDB'))
  const pos = candidatas[0]
  const produto = pos ? produtoDe(taxas, pos.produto) : undefined
  if (!pos || !produto) return plano('Não encontrei um CDB na sua conta para comparar com a poupança. Para comparar, uso sempre o valor líquido, com a taxa fictícia de 0,6% ao mês da poupança (taxas.json).', { fontes, resolvido: true })
  const cmp = compararComPoupanca(pos, produto, pos.dataReferencia, cal, taxas.poupancaAm, taxas.irRegressivo)
  const veredito = cmp.conclusao === 'cdb_perde' ? 'O CDB rendeu menos que a poupança no líquido.' : cmp.conclusao === 'cdb_ganha' ? 'O CDB rendeu mais que a poupança no líquido.' : 'O CDB e a poupança renderam o mesmo no líquido.'
  const texto = `Comparando líquido com líquido em ${cmp.dias} dias: ${produto.nome} rendeu ${brl(cmp.brutoCentavos)} bruto e ${brl(cmp.liquidoCentavos)} líquido (depois do IR); a poupança, no mesmo período, rendeu ${brl(cmp.poupancaCentavos)}. ${veredito} Comparar o bruto do CDB com a poupança, que é isenta, enganaria. Taxa da poupança: 0,6% ao mês, fictícia, de taxas.json.`
  return plano(texto, { fontes: [...fontes, { tipo: 'conta', id: pos.id, rotulo: `Posição ${pos.id}` }], obrigatorios: [brl(cmp.brutoCentavos), brl(cmp.liquidoCentavos), brl(cmp.poupancaCentavos), `${cmp.dias} dias`], resolvido: true, ultimoProduto: pos.produto })
}

function planoTaxaPoupanca(c: ContextoPlano): Plano {
  const kb12 = artigo(c.kb, 'KB-012')
  const pct = (c.taxas.poupancaAm * 100).toLocaleString('pt-BR', { maximumFractionDigits: 2 })
  return plano(`Para este atendimento, a poupança rende ${pct}% ao mês (cerca de ${((Math.pow(1 + c.taxas.poupancaAm, 12) - 1) * 100).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}% ao ano, composto), isenta de imposto de renda. É a taxa do arquivo de taxas, fictícia e fixa; não consulto taxas reais.`,
    { fontes: [TAXAS_FONTE, ...(kb12 ? [kbFonte(kb12)] : [])], obrigatorios: [`${pct}%`], resolvido: true })
}

function planoCpf(c: ContextoPlano): Plano {
  return plano(`Por segurança, só mostro o CPF mascarado: ${c.conta.cliente.cpfMascarado}. Eu também nunca peço os seus dados de acesso.`, { obrigatorios: [c.conta.cliente.cpfMascarado], fontes: [{ tipo: 'conta', id: c.conta.cliente.id, rotulo: 'Cadastro do cliente' }], resolvido: true })
}

const NAO_OFERECE: [RegExp, string][] = [
  [/previdencia/, 'previdência privada'], [/cripto|bitcoin/, 'criptoativos'], [/cambio|dolar|euro/, 'câmbio'],
  [/seguro/, 'seguros'], [/consorcio/, 'consórcio'], [/emprestimo|financiamento/, 'empréstimos'],
]
function planoInexistente(c: ContextoPlano): Plano {
  const a = artigo(c.kb, 'KB-030')
  const t = normalizar(c.textoCliente)
  const alvo = NAO_OFERECE.find(([r]) => r.test(t))?.[1]
  if (!a) return planoNaoSei()
  return plano(`Não: a Caqui não oferece ${alvo ?? 'esse produto'}, então não tenho prazo, taxa nem regra para isso e prefiro não inventar. O que a Caqui não oferece: poupança, previdência privada, criptoativos, câmbio, seguros, consórcio e empréstimos (KB-030, revisado em ${dataBr(a.revisadoEm)}).`,
    { fontes: [kbFonte(a)], obrigatorios: ['KB-030'], resolvido: true })
}

function planoKb(c: ContextoPlano, achado: Achado | null, prefixo = ''): Plano {
  if (!achado) return planoNaoSei()
  const a = achado.artigo
  return plano(`${prefixo}${trecho(a)} (${a.id}, revisado em ${dataBr(a.revisadoEm)})`, { fontes: [kbFonte(a)], obrigatorios: [a.id], resolvido: true })
}

export function montarPlano(c: ContextoPlano): Plano {
  const { decisao: d } = c
  if (['seguranca_imediata', 'encaminhar_especialista', 'encaminhar_humano', 'protocolo'].includes(d.acao)) return planoEncaminhamento(c)
  if (d.acao === 'recusar') return planoRecusa()
  if (d.motivos.includes('CANCELAMENTO')) return planoCancelamento(c)
  if (d.naoEntendeu) return planoNaoEntendi(c)

  const partes: Plano[] = []
  // Pergunta sobre produto que a Caqui não tem: não se calcula prazo nem taxa de nada.
  const intencoes = c.intencoes.includes('produto_inexistente') ? (['produto_inexistente'] as Intencao[]) : c.intencoes
  for (const i of intencoes) {
    if (i === 'prazo_resgate') { const p = planoPrazo(c); if (p) partes.push(p) }
    else if (i === 'imposto') partes.push(planoImposto(c))
    else if (i === 'comparar_poupanca') partes.push(planoPoupanca(c))
    else if (i === 'taxa_poupanca') partes.push(planoTaxaPoupanca(c))
    else if (i === 'cpf') partes.push(planoCpf(c))
    else if (i === 'horario_corte') {
      const a = artigo(c.kb, 'KB-006')
      partes.push(a ? plano(`O horário de corte é 16h. Pedido até as 16h de dia útil liquida no mesmo dia (CDB e LCI com liquidez diária); depois das 16h, ou em fim de semana ou feriado, a contagem começa no próximo dia útil. (KB-006, revisado em ${dataBr(a.revisadoEm)})`, { fontes: [kbFonte(a)], obrigatorios: ['16h', 'KB-006'], resolvido: true }) : planoNaoSei())
    } else if (i === 'garantia') partes.push(planoKb(c, achadoPor(c, 'KB-013')))
    else if (i === 'informe') partes.push(planoKb(c, achadoPor(c, 'KB-017')))
    else if (i === 'produto_inexistente') partes.push(planoInexistente(c))
    else if (i === 'conceito') partes.push(planoKb(c, c.achadoKb))
    else if (i === 'saudacao') partes.push(plano(c.saudacao, { resolvido: true }))
  }
  if (!partes.length) return planoKb(c, c.achadoKb)

  const uniao = partes.slice(0, 2)
  return plano(uniao.map((p) => p.texto).join(' '), {
    obrigatorios: [...new Set(uniao.flatMap((p) => p.obrigatorios))],
    fontes: [...new Map(uniao.flatMap((p) => p.fontes).map((f) => [f.id, f])).values()],
    resolvido: uniao.every((p) => p.resolvido),
    ultimoProduto: uniao.find((p) => p.ultimoProduto)?.ultimoProduto,
    ultimaOperacaoId: uniao.find((p) => p.ultimaOperacaoId)?.ultimaOperacaoId,
  })
}

function achadoPor(c: ContextoPlano, id: string): Achado | null {
  const a = artigo(c.kb, id)
  return a ? { artigo: a, score: 99, termos: 9 } : null
}

