import { artigoAtual, type ArtigoLeitura } from './kb-reading'
import { melhorArtigo } from './kb-search'
import { PERGUNTA_ESPECIALISTA, type PerguntaComFonte } from './support-view'
import type { ArtigoKb, ProdutoTaxa } from './types'

export type ProdutoVista = {
  codigo: string
  nome: string
  rentabilidade: string
  liquidez: string
  imposto: string
  /** Artigo da base que explica o tipo de produto; null se não estiver na base. */
  kbId: string | null
}

export type InvestirVista = { produtos: ProdutoVista[]; artigos: ArtigoLeitura[]; especialista: PerguntaComFonte }

const ARTIGO_DO_TIPO: Record<string, string> = { CDB: 'KB-003', LCI: 'KB-011', LCA: 'KB-011', FUNDO: 'KB-014', TESOURO: 'KB-015', ACOES: 'KB-016' }

const pctCdi = (pct: number) => `${Math.round(pct * 100)}% do CDI`

export function rentabilidadeDe(p: ProdutoTaxa): string {
  if (p.pctCdi === null) return 'Varia com o mercado'
  return p.tipo === 'FUNDO' ? `Referência de ${pctCdi(p.pctCdi)}; a cota pode variar` : pctCdi(p.pctCdi)
}

// Sai dos mesmos campos que `calcularLiquidacao` usa, para a descrição não divergir do prazo calculado.
export function liquidezDe(p: ProdutoTaxa): string {
  if (p.tipo === 'FUNDO' && p.cotizacaoDu !== null && p.pagamentoDu !== null) return `Cotização em D+${p.cotizacaoDu} e pagamento em D+${p.pagamentoDu}, em dias úteis`
  if (p.tipo === 'FUNDO' && p.cotizacaoCorridos !== null && p.pagamentoDuAposCotizacao !== null) {
    return `Cotização ${p.cotizacaoCorridos} dias corridos após o pedido e pagamento ${p.pagamentoDuAposCotizacao} dias úteis depois`
  }
  if (p.tipo === 'TESOURO') return 'Liquidação em D+1 útil'
  if (p.tipo === 'ACOES') return 'Liquidação em D+2 úteis'
  if (p.liquidez === 'no_vencimento') return 'Resgate só no vencimento'
  if (p.carenciaDias > 0) return `Liquidez diária depois de ${p.carenciaDias} dias de carência`
  return 'Liquidez diária'
}

// Ordem dos dados, sem ranking: ordenar por rentabilidade já seria indicar um produto (regra 4).
export function montarInvestir(produtos: ProdutoTaxa[], kb: ArtigoKb[]): InvestirVista {
  const vistas = produtos.map<ProdutoVista>((p) => {
    const id = ARTIGO_DO_TIPO[p.tipo]
    return {
      codigo: p.codigo, nome: p.nome, rentabilidade: rentabilidadeDe(p), liquidez: liquidezDe(p),
      imposto: p.tributavel ? 'Imposto de renda sobre o rendimento' : 'Isento de imposto de renda para pessoa física',
      kbId: id && artigoAtual(kb, id) ? id : null,
    }
  })
  const ids = [...new Set(vistas.map((v) => v.kbId).filter((id): id is string => id !== null))]
  return {
    produtos: vistas,
    artigos: ids.map((id) => artigoAtual(kb, id)!),
    especialista: { pergunta: PERGUNTA_ESPECIALISTA, kbId: melhorArtigo(kb, PERGUNTA_ESPECIALISTA)?.artigo.id ?? null },
  }
}
