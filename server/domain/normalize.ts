// Texto do cliente é dado. Antes de qualquer análise: CPF mascarado, sem acento, minúsculo, sem pontuação.

const CPF = /\b\d{3}\.?\d{3}\.?(\d{3})-?(\d{2})\b/g

/** CPF digitado pelo cliente nunca volta em tela nem em log: sobram só os três dígitos do meio. */
export function mascararCpf(texto: string): string {
  return texto.replace(CPF, (_m, meio: string) => `***.***.${meio}-**`)
}

export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\-/:\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
