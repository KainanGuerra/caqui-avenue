export type Papel = 'cliente' | 'suporte'

export type ItemMenu = { chave: string; rotulo: string; icone: string; para: string; papeis: Papel[] }

// Uma lista monta o menu: cada item diz quem o vê.
export const ITENS_MENU: ItemMenu[] = [
  { chave: 'inicio', rotulo: 'Início', icone: 'i-lucide-layout-dashboard', para: '/inicio', papeis: ['cliente'] },
  { chave: 'conversa', rotulo: 'Conversar com a Kaki', icone: 'i-lucide-message-circle', para: '/conversa', papeis: ['cliente'] },
  { chave: 'atendimento', rotulo: 'Atendimento', icone: 'i-lucide-life-buoy', para: '/atendimento', papeis: ['cliente'] },
  { chave: 'suporte', rotulo: 'Fila de atendimento', icone: 'i-lucide-headset', para: '/suporte', papeis: ['suporte'] },
]

export const menuDoPapel = (papel: Papel): ItemMenu[] => ITENS_MENU.filter((i) => i.papeis.includes(papel))

export const itemAtivo = (item: Pick<ItemMenu, 'para'>, caminho: string): boolean => caminho === item.para || caminho.startsWith(`${item.para}/`)

export const casaDoPapel = (papel: Papel): string => (papel === 'suporte' ? '/suporte' : '/inicio')

// Cada papel só abre as próprias telas; sem papel, só a entrada. Devolve para onde ir, ou null se pode ficar.
export function destinoPermitido(papel: Papel | null, caminho: string): string | null {
  if (!papel) return caminho === '/' ? null : '/'
  if (caminho === '/') return casaDoPapel(papel)
  const dono = ITENS_MENU.find((i) => itemAtivo(i, caminho))
  return dono && !dono.papeis.includes(papel) ? casaDoPapel(papel) : null
}
