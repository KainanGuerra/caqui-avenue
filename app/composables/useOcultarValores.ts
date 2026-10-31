import { reais } from '~/utils/moeda'

// Estado só de interface, compartilhado pelos cards da Home: esconder valores não muda nada no servidor.
export function useOcultarValores() {
  const oculto = useState('ocultar-valores', () => false)
  const valor = (centavos: number, formatar: (c: number) => string = reais) => (oculto.value ? 'R$ ••••' : formatar(centavos))
  return { oculto, valor }
}
