// Frases que os botões enviam à conversa. O pipeline decide a ação a partir delas; o teste ao lado garante que cada uma
// leva à ação esperada (pessoa, segurança, prazo), para um ajuste de texto não desligar a regra sem ninguém ver.
export const PEDIDOS = {
  pessoa: 'Quero falar com uma pessoa',
  seguranca: 'Preciso falar com a segurança agora: acho que estou sofrendo um golpe.',
  resgate: 'Quando cai meu resgate?',
} as const
