import { normalizar } from './normalize'

export type Sinal = 'golpe' | 'vulneravel' | 'injecao' | 'dado_alheio' | 'recomendacao' | 'humano' | 'cancelamento' | 'reclamacao'
/** Cada sinal carrega os códigos de motivo que o dispararam (vão para o painel do atendente). */
export type Sinais = Partial<Record<Sinal, string[]>>

export type ContextoSinais = {
  clienteId: string
  /** Nome do próprio cliente, já normalizado. */
  nome: string
  idade: number
  /** Outros clientes que o texto não pode pedir: id e nome normalizado. */
  outros: { id: string; nome: string }[]
}

export const tem = (s: Sinais, k: Sinal): boolean => (s[k]?.length ?? 0) > 0

type Regra = { motivo: string; teste: (t: string) => boolean }
const re = (motivo: string, padrao: RegExp): Regra => ({ motivo, teste: (t) => padrao.test(t) })
const todos = (motivo: string, ...padroes: RegExp[]): Regra => ({ motivo, teste: (t) => padroes.every((p) => p.test(t)) })

const PEDIDO = /\b(pediu|pediram|pedindo|pede|pedem|solicitou|solicitaram|ligou|ligaram|ligando|mandou|mandaram|gerente|suporte|seguranca|atendente|funcionario|rapaz|moca|alguem)\b/
const CREDENCIAL = /\b(codigo|token|senha|cvv|sms)\b/

const GOLPE: Regra[] = [
  todos('GOLPE_CREDENCIAL', CREDENCIAL, PEDIDO),
  todos('GOLPE_CREDENCIAL_PASSADA', /\b(passei|passou|informei|enviei|dei|digitei)\b/, CREDENCIAL),
  re('GOLPE_PIX_TESTE', /\bpix (de )?teste\b|\bconta segura\b|\btransferir (pra|para) (uma )?conta (segura|de seguranca)\b/),
  todos('GOLPE_PIX_BLOQUEIO', /\b(pix|transferencia|deposito)\b/, /\b(nao bloquear|desbloquear|liberar minha conta|evitar bloqueio)\b/),
  re('GOLPE_INSTALAR_APP', /\b(instalar|baixar|instale|baixe)\b.*\b(aplicativo|app|programa)\b.*\b(suporte|acessar|controlar|atendente|gerente)\b|\b(suporte|gerente|atendente)\b.*\b(acessar|controlar)\b.*\b(celular|computador|aparelho)\b/),
  re('GOLPE_ACESSO_REMOTO', /\b(suporte remoto|acesso remoto|anydesk|teamviewer|controlar (o )?(meu )?(celular|computador))\b/),
  todos('GOLPE_LINK', /\b(link|cliquei|clicar|clique)\b/, /\b(atualizar|confirmar|validar|regularizar)\b.*\b(dados|cadastro|conta)\b/, /\b(pediram|pede|pedindo|pediu|senha|codigo)\b/),
]

const TERCEIRO = /\b(sobrinh[oa]|filh[oa]|net[oa]|genro|nora|vizinh[oa]|amig[oa]|cuidador[a]?|marido|esposa|irma[o]?|primo|prima|tio|tia)\b/
const PRESSAO = /\b(mandou|mandaram|mandando|disse|disseram|dizendo|falou|falaram|pediu|pedindo|quer que|querem que|obrigou|obrigaram|obrigando|pressionando|pressao|do meu lado|ao meu lado|aqui do lado|ajudando)\b/
const MOVIMENTO = /\b(resgat\w*|tirar|retirar|passar|transfer\w*|pix|dinheiro|tudo|todo)\b/
const CONFUSAO = /\b(nao estou entendendo|nao entendo nada|nao entendi nada|nao sei mexer|estou perdid[oa]|nao sei o que fazer|estou confus[oa]|ninguem me explica|ninguem me avisou|nao consigo (entrar|acessar|mexer|usar)|nao reconhece)\b/

const RECOMENDACAO: Regra[] = [
  re('RECOMENDACAO_ONDE', /\bonde\s+(eu\s+)?(devo\s+|posso\s+|e melhor\s+)?(investir|aplicar|coloco|colocar|invisto|aplico|botar|boto)\b/),
  re('RECOMENDACAO_OPINIAO', /\b(o que|oq)\s+(voce|vc|tu|a caqui)\s+(faria|fazia|escolheria|indicaria|recomendaria|colocaria)\b|\bno meu lugar\b/),
  re('RECOMENDACAO_ESCOLHA', /\b(qual|quais)\s+(voce|vc)\s+(escolheria|indicaria|recomendaria)\b|\b(voce|vc)\s+acha\s+que\s+(eu\s+)?devo\b/),
  todos('RECOMENDACAO_MELHOR', /\b(melhor|mais vale a pena|vale mais a pena|compensa mais|mais rentavel|mais seguro|vale a pena)\b/, /\b(invest\w*|cdb|fundo|lci|lca|tesouro|produto|aplicac\w*|opcao)\b/, /\b(pra mim|para mim|eu|me|minha|meu)\b/),
  todos('RECOMENDACAO_COMPARACAO', /\b(cdb|fundo|lci|lca|tesouro|multimercado)\b.*\bou\b.*\b(cdb|fundo|lci|lca|tesouro|multimercado)\b/, /\b(pra mim|para mim|melhor|vale|escolh\w+|prefer\w+)\b/),
  re('RECOMENDACAO_INDICA', /\b(me indica|me indique|me recomenda|me recomende|me sugere|me sugira|me aconselha|me aconselhe|indica um|indique um)\b.*\b(invest\w*|produto|aplicac\w*|cdb|fundo|lci|lca|tesouro|um nome)\b/),
  re('RECOMENDACAO_DEVO', /\bdevo\b.*\b(tirar|colocar|aplicar|investir|trocar|mudar|migrar|resgatar)\b.*\b(poupanca|cdb|fundo|lci|lca|tesouro|acoes|renda fixa)\b/),
  re('RECOMENDACAO_MELHOR_INV', /\b(melhor|mais indicado|mais recomendado)\s+(investimento|produto|aplicacao|opcao)\b/),
  re('RECOMENDACAO_QUANTO', /\bquanto\s+(eu\s+)?(devo|deveria|posso)\s+(colocar|aplicar|investir)\b|\bqual\s+(o\s+)?percentual\b/),
  todos('RECOMENDACAO_ORIENTAR', /\b(o que fazer|o que eu faco|o que devo fazer|me ajuda a decidir|me orienta)\b/, /\b(heranca|investir|investimento|reais|mil|dinheiro|parad\w+|aplicar)\b/),
  re('RECOMENDACAO_ASSESSOR', /\b(assessor|consultor|gerente de investimentos?)\b.*\b(onde|invest\w*|aplic\w*|me diz|me diga)\b/),
]

const INJECAO: Regra[] = [
  re('INJECAO_IGNORAR', /\b(ignore|ignora|ignorar|esqueca|esquece|desconsidere|desconsidera)\b.*\b(instrucoes|regras|anteriores|tudo|prompt|politicas?|restricoes|limites)\b|\bignore (all |any )?(previous|prior|above)\b/),
  re('INJECAO_MODO', /\b(modo|mode)\s+(administrador|admin|desenvolvedor|developer|debug|deus|god)\b/),
  re('INJECAO_SISTEMA', /^\s*(sistema|system|admin|desenvolvedor)\s*:|\[(instrucao|system|sistema|desenvolvedor)|instrucao do desenvolvedor/),
  re('INJECAO_PAPEL', /\bvoce agora e (um|uma)\b|\b(finge|finja|fingir|aja como|atue como|simule|simula|faca de conta)\b.*\b(que (voce )?e|ser|um|uma|meu|minha)\b|\bsem restricoes\b/),
  re('INJECAO_PROMPT', /\b(mostre|revele|imprima|exiba|print|show|diga)\b.*\b(prompt|instrucoes internas|instrucoes do sistema|configuracao|system prompt)\b|\bprint the system prompt\b/),
  re('INJECAO_DESATIVAR', /\b(desative|desativa|desligue|remova)\b.*\b(filtro|regra|seguranca|restricao)\b/),
  re('INJECAO_HORARIO', /\bcomo se (o )?horario fosse\b|\bfinja que (sao|e)\b.*\b\d{1,2}\s?h\b/),
  re('INJECAO_FORMATO', /\bresponda (so |apenas )?em json\b/),
]

const PEDE_DADO = /\b(saldo|cpf|cpfs|extrato|dados|posicoes?|investimentos?|operacoes)\b/

const HUMANO: Regra[] = [
  re('HUMANO_PEDIDO', /\b(falar|conversar|atendimento|atender|passa|passe|me passa|quero|preciso|prefiro)\b.*\b(pessoa|humano|atendente|alguem de verdade|gente de verdade)\b/),
  re('HUMANO_PALAVRA', /^(atendente|humano|pessoa|atendimento humano|quero atendente|quero um humano)$/),
  re('HUMANO_DE_VERDADE', /\b(pessoa de verdade|alguem de verdade|uma pessoa)\b/),
]
const CANCELAMENTO = re('CANCELAMENTO', /\b(encerrar|encerra|encerramento|cancelar|cancela|fechar|excluir|apagar)\b.*\b(conta|cadastro|tudo)\b|\bquero (cancelar|encerrar)\b|\bja disse que quero (encerrar|cancelar)\b/)
const RECLAMACAO = re('RECLAMACAO', /\b(reclamacao|reclamar|reclamo|ouvidoria|procon|registrar (uma )?queixa)\b/)

function acumular(saida: string[], regras: Regra[], texto: string) {
  for (const r of regras) if (r.teste(texto)) saida.push(r.motivo)
}

export function detectarSinais(textoOriginal: string, ctx: ContextoSinais): Sinais {
  const t = normalizar(textoOriginal)
  const s: Sinais = {}
  const add = (k: Sinal, motivos: string[]) => { if (motivos.length) s[k] = motivos }

  const golpe: string[] = []; acumular(golpe, GOLPE, t); add('golpe', golpe)

  const vul: string[] = []
  if (TERCEIRO.test(t) && PRESSAO.test(t) && MOVIMENTO.test(t)) vul.push('VULNERAVEL_TERCEIRO')
  if (/\b(me disseram|me falaram|mandaram eu|estao me pressionando)\b/.test(t) && /\b(resgat\w*|tirar|transfer\w*|pix)\b/.test(t)) vul.push('VULNERAVEL_PRESSAO')
  if (ctx.idade >= 60 && CONFUSAO.test(t)) vul.push('VULNERAVEL_CONFUSAO')
  if (ctx.idade >= 60 && /\b(quero|vou|preciso|tirar|retirar|passar|transferir)\b.*\b(tudo|todo)\b/.test(t) && !/\b(quanto|se eu|se resgatar|qual)\b/.test(t)) vul.push('VULNERAVEL_RESGATE_ATIPICO')
  add('vulneravel', vul)

  const inj: string[] = []; acumular(inj, INJECAO, t); add('injecao', inj)

  const alheio: string[] = []
  for (const m of t.matchAll(/\bc-?\s?0*(\d{1,4})\b/g)) {
    const id = `C-${m[1]!.padStart(4, '0')}`
    if (id !== ctx.clienteId) alheio.push('DADO_ALHEIO_ID')
  }
  if (PEDE_DADO.test(t)) {
    for (const o of ctx.outros) if (o.nome && t.includes(o.nome)) alheio.push('DADO_ALHEIO_NOME')
    if (/\b(liste|lista|listar|mostre|mostra|exiba|todos)\b.*\b(cpfs?|saldos?|dados)\b.*\b(clientes|todos)\b|\bcpfs? completos? dos clientes\b/.test(t)) alheio.push('DADO_ALHEIO_LISTA')
    if (/\b(saldo|cpf|extrato|dados)\s+d[aoe]\s+(?!meu|minha|conta|cliente\b)[a-z]+\s+[a-z]+/.test(t) && !alheio.length && !(ctx.nome && t.includes(ctx.nome))) alheio.push('DADO_ALHEIO_TERCEIRO')
  }
  add('dado_alheio', [...new Set(alheio)])

  const rec: string[] = []; acumular(rec, RECOMENDACAO, t); add('recomendacao', rec)

  const hum: string[] = []; acumular(hum, HUMANO, t); add('humano', hum)
  if (CANCELAMENTO.teste(t)) s.cancelamento = [CANCELAMENTO.motivo]
  if (RECLAMACAO.teste(t)) s.reclamacao = [RECLAMACAO.motivo]
  return s
}
