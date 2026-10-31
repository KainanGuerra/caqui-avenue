// Leitor de CSV mínimo: aspas duplas, vírgulas e quebras de linha dentro de campos entre aspas.
export function parseCsv(texto: string): Record<string, string>[] {
  const linhas: string[][] = []
  let campo = ''
  let linha: string[] = []
  let entreAspas = false
  const t = texto.replace(/^﻿/, '')
  for (let i = 0; i < t.length; i++) {
    const c = t[i]
    if (entreAspas) {
      if (c === '"' && t[i + 1] === '"') { campo += '"'; i++ }
      else if (c === '"') entreAspas = false
      else campo += c
    } else if (c === '"') entreAspas = true
    else if (c === ',') { linha.push(campo); campo = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && t[i + 1] === '\n') i++
      linha.push(campo); campo = ''
      if (linha.some((x) => x !== '')) linhas.push(linha)
      linha = []
    } else campo += c
  }
  if (campo !== '' || linha.length) { linha.push(campo); if (linha.some((x) => x !== '')) linhas.push(linha) }
  const [cab, ...resto] = linhas
  if (!cab) return []
  return resto.map((l) => Object.fromEntries(cab.map((nome, i) => [nome, l[i] ?? ''])))
}

export const centavos = (reais: string): number => Math.round(parseFloat(reais) * 100)
