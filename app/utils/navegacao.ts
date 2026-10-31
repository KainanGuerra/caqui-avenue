export type Papel = 'cliente' | 'suporte'

/** `tambem`: páginas que não estão no menu mas pertencem ao item (marcam a aba e seguem a mesma proteção). */
export type ItemMenu = { chave: string; rotulo: string; icone: string; para: string; papeis: Papel[]; tambem?: string[] }

// Uma lista monta o menu e o rodapé: cada item diz quem o vê. A conversa não tem aba: chega-se a ela pelo Atendimento,
// porque o chat é a última alternativa, depois das páginas e da base.
export const ITENS_MENU: ItemMenu[] = [
  { chave: 'inicio', rotulo: 'Início', icone: 'i-lucide-house', para: '/inicio', papeis: ['cliente'] },
  { chave: 'carteira', rotulo: 'Carteira', icone: 'i-lucide-chart-pie', para: '/carteira', papeis: ['cliente'] },
  { chave: 'investir', rotulo: 'Investir', icone: 'i-lucide-trending-up', para: '/investir', papeis: ['cliente'] },
  { chave: 'aprender', rotulo: 'Aprender', icone: 'i-lucide-book-open', para: '/aprender', papeis: ['cliente'] },
  { chave: 'atendimento', rotulo: 'Atendimento', icone: 'i-lucide-message-circle', para: '/atendimento', papeis: ['cliente'], tambem: ['/conversa'] },
  { chave: 'suporte', rotulo: 'Fila de atendimento', icone: 'i-lucide-headset', para: '/suporte', papeis: ['suporte'] },
]

export const menuDoPapel = (papel: Papel): ItemMenu[] => ITENS_MENU.filter((i) => i.papeis.includes(papel))

const dentroDe = (base: string, caminho: string) => caminho === base || caminho.startsWith(`${base}/`)

export const itemAtivo = (item: Pick<ItemMenu, 'para' | 'tambem'>, caminho: string): boolean =>
  [item.para, ...(item.tambem ?? [])].some((base) => dentroDe(base, caminho))

export const casaDoPapel = (papel: Papel): string => (papel === 'suporte' ? '/suporte' : '/inicio')

// Cada papel só abre as próprias telas; sem papel, só a entrada. Devolve para onde ir, ou null se pode ficar.
export function destinoPermitido(papel: Papel | null, caminho: string): string | null {
  if (!papel) return caminho === '/' ? null : '/'
  if (caminho === '/') return casaDoPapel(papel)
  const dono = ITENS_MENU.find((i) => itemAtivo(i, caminho))
  return dono && !dono.papeis.includes(papel) ? casaDoPapel(papel) : null
}
