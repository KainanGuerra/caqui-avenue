import { CHAVE_TEMA, modoInicial } from '~/utils/theme'

// Escolhe a aparência antes da primeira tela (o app não renderiza no servidor), sem piscar a errada.
export default defineNuxtPlugin(() => {
  let salvo: string | null = null
  try { salvo = localStorage.getItem(CHAVE_TEMA) } catch { /* sem armazenamento: segue o aparelho */ }
  useAppTheme().aplicar(modoInicial(salvo, window.matchMedia('(prefers-color-scheme: dark)').matches))
})
