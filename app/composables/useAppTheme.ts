import { CHAVE_TEMA, cromoEscuro, esquemaDaPagina, proximoModo, type Modo } from '~/utils/theme'

// A página segue o modo de cor do Nuxt UI; o "misto" é claro com topo e menu escuros (ver o layout).
export function useAppTheme() {
  const modo = useState<Modo>('tema-modo', () => 'light')
  const cor = useColorMode()

  function aplicar(novo: Modo) {
    modo.value = novo
    cor.preference = esquemaDaPagina(novo)
    try { localStorage.setItem(CHAVE_TEMA, novo) } catch { /* vale só nesta visita */ }
  }

  return { modo, cromoEscuro: computed(() => cromoEscuro(modo.value)), aplicar, girar: () => aplicar(proximoModo(modo.value)) }
}
