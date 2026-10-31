import type { Persona } from '../persona'
import type { Plano } from './answer-plan'

export type Validacao = { ok: boolean; problemas: string[] }

const CPF_CRU = /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b|\b\d{11}\b/
const ID_CLIENTE = /\bC-\d{4}\b/g

// Confere a saída (do modelo ou do template) antes de ir ao cliente: fatos obrigatórios presentes,
// nada proibido (recomendação, fingir ser pessoa), nenhum CPF cru e nenhum id de outro cliente.
export function validar(texto: string, plano: Pick<Plano, 'obrigatorios'>, persona: Persona, clienteId: string): Validacao {
  const problemas: string[] = []
  if (!texto.trim()) problemas.push('texto vazio')
  for (const o of plano.obrigatorios) if (!texto.includes(o)) problemas.push(`falta o fato obrigatório: ${o}`)
  for (const f of persona.frasesVetadas) if (f.test(texto)) problemas.push(`frase vetada: ${f.source}`)
  if (CPF_CRU.test(texto)) problemas.push('CPF sem máscara')
  for (const id of texto.match(ID_CLIENTE) ?? []) if (id !== clienteId) problemas.push(`id de outro cliente: ${id}`)
  return { ok: problemas.length === 0, problemas }
}
