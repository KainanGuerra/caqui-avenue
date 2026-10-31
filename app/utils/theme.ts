// Três aparências: clara, escura e mista (topo e menu escuros sobre a página clara).
export const MODOS = ['light', 'mixed', 'dark'] as const
export type Modo = (typeof MODOS)[number]

export const CHAVE_TEMA = 'kaki.tema'

export const ehModo = (v: unknown): v is Modo => MODOS.includes(v as Modo)

// O botão do topo gira claro → misto → escuro → claro.
export const proximoModo = (modo: Modo): Modo => MODOS[(MODOS.indexOf(modo) + 1) % MODOS.length]!

// Só o modo escuro escurece a página; o misto mantém o corpo claro.
export const esquemaDaPagina = (modo: Modo): 'light' | 'dark' => (modo === 'dark' ? 'dark' : 'light')

// Topo e menu ficam escuros em tudo que não seja o claro.
export const cromoEscuro = (modo: Modo): boolean => modo !== 'light'

// Escolha salva, se válida; senão a preferência do aparelho.
export const modoInicial = (salvo: string | null, prefereEscuro: boolean): Modo => (ehModo(salvo) ? salvo : prefereEscuro ? 'dark' : 'light')
