import type { Papel } from '~/utils/navegacao'

type Identidade = { id: string; nome: string; idade: number }
const CHAVE = 'kaki.acesso'

// Quem está dentro: o papel, e para o cliente a sessão do chat. É estado do navegador só para a
// tela saber o que mostrar; o servidor continua dono da sessão e do que cada papel pode ler.
export function useAcesso() {
  const papel = useState<Papel | null>('acesso-papel', () => null)
  const atendente = useState('acesso-atendente', () => 'Jonas')
  const sessaoId = useState<string | null>('acesso-sessao', () => null)
  const cliente = useState<Identidade | null>('acesso-cliente', () => null)
  const saudacao = useState('acesso-saudacao', () => '')

  function guardar() {
    try {
      if (!papel.value) sessionStorage.removeItem(CHAVE)
      else sessionStorage.setItem(CHAVE, JSON.stringify({ papel: papel.value, atendente: atendente.value, sessaoId: sessaoId.value, cliente: cliente.value, saudacao: saudacao.value }))
    } catch { /* sem armazenamento: recarregar volta à entrada */ }
  }

  // Lê o que a aba já tinha antes da primeira tela (plugins/acesso.client.ts).
  function restaurar() {
    try {
      const bruto = sessionStorage.getItem(CHAVE)
      if (!bruto) return
      const d = JSON.parse(bruto) as { papel: Papel; atendente: string; sessaoId: string | null; cliente: Identidade | null; saudacao: string }
      if (d.papel === 'cliente' && !(d.sessaoId && d.cliente)) return
      papel.value = d.papel
      atendente.value = d.atendente
      sessaoId.value = d.sessaoId
      cliente.value = d.cliente
      saudacao.value = d.saudacao
    } catch { /* guardado corrompido: começa da entrada */ }
  }

  function entrarComoCliente(dados: { sessaoId: string; cliente: Identidade; saudacao: string }) {
    papel.value = 'cliente'
    sessaoId.value = dados.sessaoId
    cliente.value = dados.cliente
    saudacao.value = dados.saudacao
    guardar()
  }

  // Suporte e gerente são da equipe: guardam só o nome (em `atendente`), sem sessão de cliente.
  function entrarComoEquipe(quem: 'suporte' | 'gerente', nome: string) {
    papel.value = quem
    atendente.value = nome.trim() || (quem === 'gerente' ? 'Gerente' : 'Atendente')
    sessaoId.value = null
    cliente.value = null
    guardar()
  }
  const entrarComoSuporte = (nome: string) => entrarComoEquipe('suporte', nome)
  const entrarComoGerente = (nome: string) => entrarComoEquipe('gerente', nome)

  async function sair() {
    papel.value = null
    sessaoId.value = null
    cliente.value = null
    saudacao.value = ''
    guardar()
    await navigateTo('/')
  }

  const nome = computed(() => (papel.value === 'cliente' ? (cliente.value?.nome ?? '') : papel.value ? atendente.value : ''))
  return { papel, atendente, sessaoId, cliente, saudacao, nome, restaurar, guardar, entrarComoCliente, entrarComoSuporte, entrarComoGerente, sair }
}
