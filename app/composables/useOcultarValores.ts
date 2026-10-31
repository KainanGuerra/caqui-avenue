import { reais } from '~/utils/moeda'

// Estado só de interface, compartilhado pelos cards da Home: esconder valores não muda nada no servidor.
export function useOcultarValores() {
  const oculto = useState('ocultar-valores', () => false)
  // Espaço sem quebra, como o Intl faz com o valor visível: "R$" não fica sozinho no fim da linha.
  const valor = (centavos: number, formatar: (c: number) => string = reais) => (oculto.value ? 'R$\u00a0••••' : formatar(centavos))
  return { oculto, valor }
}
