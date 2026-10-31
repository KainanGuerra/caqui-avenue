import { normalizar } from './normalize'

export type Intencao =
  | 'prazo_resgate'
  | 'imposto'
  | 'comparar_poupanca'
  | 'taxa_poupanca'
  | 'cpf'
  | 'horario_corte'
  | 'conceito'
  | 'garantia'
  | 'produto_inexistente'
  | 'informe'
  | 'saudacao'

type Regra = [Intencao, RegExp]

const REGRAS: Regra[] = [
  ['produto_inexistente', /\b(previdencia|cripto\w*|bitcoin|cambio|dolar|euro|seguro de vida|seguros?|consorcio|emprestimo|financiamento)\b/],
  ['taxa_poupanca', /\b(taxa|rende|rendimento)\b.*\bpoupanca\b|\bpoupanca\b.*\b(taxa|hoje)\b/],
  ['comparar_poupanca', /\bpoupanca\b.*\b(rendeu|rende|menos|mais|melhor|pior|compar\w*)\b|\b(rendeu|rende|menos|mais)\b.*\bpoupanca\b/],
  ['imposto', /\b(aliquota|imposto|ir|tributa\w*|imposto de renda)\b|\b(e se|se eu tivesse|se eu resgatar|se resgatar)\b.*\bresgat\w*\b/],
  ['prazo_resgate', /\b(cai|cair|caiu|caindo|liquid\w*|prazo|receb\w*|entra|disponivel|pagamento)\b.*\b(resgat\w*|pedi|pedido|dinheiro|cdb|fundo|tesouro|lci|lca)\b|\b(resgat\w*|pedi|pedido)\b.*\b(cai|caiu|cair|quando|prazo|ainda nao)\b|\bquando\b.*\bcai\b/],
  ['horario_corte', /\b(horario de corte|corte)\b/],
  ['cpf', /\bcpf\b/],
  ['garantia', /\b(garantia|fgc|garantido)\b/],
  ['informe', /\binforme\b/],
  ['conceito', /\b(o que e|o que significa|como funciona|diferenca entre|explica\w*)\b/],
  ['saudacao', /^(oi|ola|bom dia|boa tarde|boa noite|e ai)\b/],
]

export function detectarIntencoes(texto: string): Intencao[] {
  const t = normalizar(texto)
  const achadas = REGRAS.filter(([, r]) => r.test(t)).map(([i]) => i)
  // "comparar" e "taxa" da poupança não coexistem; "imposto" junto de "comparar" fica (é parte da conta).
  return achadas.includes('comparar_poupanca') ? achadas.filter((i) => i !== 'taxa_poupanca') : achadas
}

const INTERROGATIVOS = /^(qual|quais|quando|como|quanto|quantos|onde|por que|porque|voces|vcs|existe|tem|ha|posso|da pra|e possivel|o que|quem)\b/

/** Frase que é claramente uma pergunta sobre algum assunto (mesmo fora da base): o agente "entendeu" e diz que não sabe. */
export function ehPergunta(texto: string): boolean {
  const t = normalizar(texto)
  const palavras = t.split(' ').filter((p) => p.length > 2)
  return palavras.length >= 4 && (texto.includes('?') || INTERROGATIVOS.test(t))
}
