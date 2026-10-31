import type { CasoResumo, ContaVista, Mensagem } from '~/types'

type Saida = { texto: string; comHumano: boolean; acao: string; protocolo: string | null }

// O polling é um só para o app todo (início e conversa compartilham o estado), por isso fora da função.
let timer: ReturnType<typeof setInterval> | undefined

// Estado do chat do cliente. O servidor é a fonte da verdade: depois de cada envio e a cada poucos
// segundos o histórico é relido, e é assim que a fala do atendente aparece na tela do cliente.
export function useChat() {
  const acesso = useAcesso()
  const mensagens = useState<Mensagem[]>('chat-mensagens', () => [])
  const caso = useState<CasoResumo | null>('chat-caso', () => null)
  const humanoDisponivel = useState('chat-humano', () => true)
  const enviando = useState('chat-enviando', () => false)
  const erro = useState('chat-erro', () => '')
  const sugestoes = useState<string[]>('chat-sugestoes', () => [])
  const sugestoesPorDigitacao = useState('chat-sugestoes-digitacao', () => false)
  const perfil = useState('chat-perfil', () => '')
  const conta = useState<ContaVista | null>('chat-conta', () => null)
  // Horário simulado ("HH:MM") para a demonstração; vazio usa o relógio do servidor.
  const horarioSimulado = useState('chat-horario', () => '')

  const momento = () => (horarioSimulado.value ? `2026-11-18T${horarioSimulado.value}-03:00` : undefined)

  // Sugestões dependem do tipo de cliente, da conversa e do que está sendo digitado; o servidor decide.
  let ultimaConsulta = 0
  async function carregarSugestoes(rascunho = '') {
    if (!acesso.sessaoId.value) return
    const minha = ++ultimaConsulta
    try {
      const r = await $fetch<{ perfil: string; sugestoes: string[]; porDigitacao: boolean }>(`/api/chat/${acesso.sessaoId.value}/sugestoes`, { query: { q: rascunho } })
      if (minha !== ultimaConsulta) return // chegou uma resposta mais nova
      sugestoes.value = r.sugestoes
      sugestoesPorDigitacao.value = r.porDigitacao
      perfil.value = r.perfil
    } catch { /* sem sugestões não atrapalha a conversa */ }
  }

  async function atualizar() {
    if (!acesso.sessaoId.value) return
    try {
      const r = await $fetch<{ mensagens: Mensagem[]; caso: CasoResumo | null; humanoDisponivel: boolean }>(`/api/chat/${acesso.sessaoId.value}`)
      mensagens.value = r.mensagens
      caso.value = r.caso
      humanoDisponivel.value = r.humanoDisponivel
    } catch (e) {
      // O servidor reiniciou e esqueceu a sessão: volta à entrada em vez de ficar com a tela parada.
      if ((e as { statusCode?: number }).statusCode === 404) { parar(); await acesso.sair() }
    }
  }

  async function carregarConta() {
    if (!acesso.sessaoId.value) return
    try { conta.value = await $fetch<ContaVista>(`/api/chat/${acesso.sessaoId.value}/conta`) } catch { /* o dashboard mostra o vazio */ }
  }

  function acompanhar() {
    if (timer || !acesso.sessaoId.value) return
    timer = setInterval(atualizar, 2500)
  }

  function parar() {
    clearInterval(timer)
    timer = undefined
  }

  async function iniciar(clienteId: string) {
    erro.value = ''
    const r = await $fetch<{ sessaoId: string; cliente: { id: string; nome: string; idade: number }; persona: { saudacao: string }; humanoDisponivel: boolean }>('/api/sessoes', { method: 'POST', body: { clienteId } })
    parar()
    mensagens.value = []
    caso.value = null
    sugestoes.value = []
    conta.value = null
    humanoDisponivel.value = r.humanoDisponivel
    acesso.entrarComoCliente({ sessaoId: r.sessaoId, cliente: r.cliente, saudacao: r.persona.saudacao })
    await Promise.all([carregarSugestoes(), carregarConta()])
    acompanhar()
  }

  // Devolve a resposta do servidor (com o protocolo, quando abriu caso) para quem enviou de fora da conversa; null se não enviou.
  async function enviar(texto: string): Promise<Saida | null> {
    const t = texto.trim()
    if (!t || !acesso.sessaoId.value || enviando.value) return null
    enviando.value = true
    erro.value = ''
    mensagens.value = [...mensagens.value, { papel: 'cliente', texto: t, em: '' }]
    try {
      return await $fetch<Saida>('/api/chat', { method: 'POST', body: { sessaoId: acesso.sessaoId.value, texto: t, momento: momento() } })
    } catch {
      erro.value = 'Não consegui enviar agora. Tente de novo em instantes.'
      return null
    } finally {
      await atualizar()
      await carregarSugestoes()
      enviando.value = false
    }
  }

  async function sair() {
    parar()
    mensagens.value = []
    caso.value = null
    conta.value = null
    await acesso.sair()
  }

  return {
    sessaoId: acesso.sessaoId, cliente: acesso.cliente, saudacao: acesso.saudacao, mensagens, caso, humanoDisponivel, enviando, erro, sugestoes,
    sugestoesPorDigitacao, perfil, conta, horarioSimulado, carregarSugestoes, carregarConta, atualizar, acompanhar, parar, iniciar, enviar, sair,
  }
}
