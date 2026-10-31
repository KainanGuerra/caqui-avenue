import { artigoAtual, type ArtigoLeitura } from './kb-reading'
import type { ArtigoKb } from './types'

export type TemaAprender = { titulo: string; artigos: ArtigoLeitura[] }

// Curadoria do que é conteúdo para aprender; artigos de operação (senha, cadastro, protocolo) ficam no Atendimento.
export const TEMAS_APRENDER: { titulo: string; ids: string[] }[] = [
  { titulo: 'Primeiros passos', ids: ['KB-001', 'KB-002', 'KB-003', 'KB-004'] },
  { titulo: 'Rendimento e imposto', ids: ['KB-009', 'KB-010', 'KB-012'] },
  { titulo: 'Produtos e garantias', ids: ['KB-005', 'KB-011', 'KB-013', 'KB-014', 'KB-015', 'KB-016'] },
  { titulo: 'Segurança', ids: ['KB-019', 'KB-020'] },
]

/** Artigos atuais por tema; id ausente ou antigo fica de fora em vez de virar página vazia. */
export function montarAprender(kb: ArtigoKb[]): TemaAprender[] {
  return TEMAS_APRENDER
    .map(({ titulo, ids }) => ({ titulo, artigos: ids.map((id) => artigoAtual(kb, id)).filter((a): a is ArtigoLeitura => a !== null) }))
    .filter((t) => t.artigos.length > 0)
}
