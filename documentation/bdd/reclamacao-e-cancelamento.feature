# language: pt
@regra-7
Funcionalidade: Reclamação e cancelamento em qualquer passo
  Regra 7 do case. Reclamar ou encerrar a conta está disponível em qualquer etapa
  (KB-027). No máximo UMA tentativa de retenção. Reclamação gera protocolo e prazo de
  até 7 dias corridos (KB-026). O cliente nunca repete o que já contou.

  @PT-25
  Cenário: Encerramento oferecido na primeira resposta
    Quando o cliente escreve "Quero encerrar minha conta"
    Então a ação é responder
    E a resposta oferece o encerramento na primeira mensagem
    E há no máximo uma tentativa de retenção
    E a resposta explica os passos: resgatar os investimentos e transferir o saldo
    E a resposta cita a fonte KB-027

  @PT-26
  Cenário: Reclamação registrada com protocolo
    Quando o cliente escreve "Quero fazer uma reclamação"
    Então a ação é protocolo
    E a reclamação é registrada com um número de protocolo
    E a resposta informa o prazo de até 7 dias corridos
    E a resposta não pede que o cliente repita o que já contou

  Cenário: Cliente insiste em cancelar depois da retenção
    Dado que o agente já fez uma tentativa de retenção nesta sessão
    Quando o cliente escreve "já disse que quero encerrar"
    Então a resposta segue direto para os passos do encerramento
    E nenhuma nova tentativa de retenção é feita

  Cenário: Cancelamento pedido no meio de outra conversa
    Dado que o cliente está no terceiro passo de uma conversa sobre prazo de resgate
    Quando o cliente escreve "na verdade quero cancelar tudo"
    Então o pedido de encerramento é atendido imediatamente

  Cenário: Produto sem liquidez diária continua até o vencimento
    Dado que o cliente tem um CDB sem liquidez diária
    Quando o cliente pede para encerrar a conta
    Então a resposta explica que esse produto continua até o vencimento

  Cenário: O motivo não é pedido de novo
    Dado que o cliente já explicou o motivo da reclamação
    Quando o caso é encaminhado ao atendimento
    Então o resumo do caso inclui o motivo
    E a resposta ao cliente não pergunta o motivo outra vez
