# language: pt
@regra-8
Funcionalidade: Sem doom loop
  Regra 8 do case. No máximo cinco passos até resolver ou entregar a um humano. Depois
  de duas respostas sem entender o cliente, o agente oferece humano. Pedido direto de
  humano é atendido na hora, sem menu intermediário (KB-025). Nunca repete a mesma
  resposta com outras palavras.

  @PT-27
  Cenário: Três mensagens ambíguas seguidas
    Quando o cliente escreve "asdf"
    E depois escreve "não é isso"
    E depois escreve "não é isso de novo"
    Então a ação na terceira mensagem é encaminhar_humano
    E o humano foi oferecido depois da segunda resposta sem entender

  @PT-28
  Cenário: Pedido direto de humano durante o horário
    Dado que agora é 18/11/2026 às 14h
    Quando o cliente escreve "Quero falar com uma pessoa"
    Então a ação é encaminhar_humano
    E a resposta informa o tempo estimado de espera
    E não há menu intermediário

  Cenário: Quinto passo sem resolver entrega ao humano
    Dado que a conversa chegou ao quinto passo sem resolver
    Quando o cliente envia mais uma mensagem
    Então a ação é encaminhar_humano

  Cenário: Resposta repetida com outras palavras é proibida
    Dado que o agente já respondeu "não entendi" uma vez
    Quando o cliente envia outra mensagem que o agente não entende
    Então a segunda resposta oferece humano em vez de repetir o pedido de reformulação
    E só nessa resposta aparece o botão "Falar com uma pessoa" (fora do horário, "Registrar minha demanda")
    E a primeira resposta sem entender não mostra o botão

  Esquema do Cenário: Formas de pedir humano
    Dado que agora é 18/11/2026 às 14h
    Quando o cliente escreve <fala>
    Então a ação é encaminhar_humano

    Exemplos:
      | fala                          |
      | "atendente"                   |
      | "quero falar com um humano"   |
      | "me passa pra alguém de verdade" |
      | "QUERO UMA PESSOA"            |

  Cenário: O contador zera quando o agente entende
    Dado que a primeira mensagem do cliente não foi entendida
    Quando o cliente pergunta "qual o horário de corte do CDB?"
    Então o agente responde com a fonte KB-006
    E o contador de mensagens sem entendimento volta a zero
