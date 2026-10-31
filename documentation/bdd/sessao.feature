# language: pt
@transversal
Funcionalidade: Estado da sessão
  A sessão guarda contadores (passos, mensagens sem entendimento), a oferta de retenção
  já feita, o modo segurança, a vulnerabilidade e o contexto das últimas citações
  (operação e produto). Estados: normal, aguardando entendimento, modo segurança,
  prioridade humana, encerrada.

  Cenário: Modo segurança trava depois de um sinal de golpe
    Dado que um sinal de golpe foi detectado nesta sessão
    Quando o cliente envia qualquer outra mensagem
    Então a conversa continua em modo segurança
    E o encaminhamento à segurança se mantém até haver humano

  Cenário: Vulnerabilidade persiste
    Dado que um sinal de vulnerabilidade foi detectado nesta sessão
    Quando o cliente faz outra pergunta
    Então a prioridade humana continua ativa

  Cenário: Contador de passos
    Dado que a conversa está no quarto passo sem resolver
    Quando o cliente envia a quinta mensagem sem resolução
    Então a ação é encaminhar_humano

  Cenário: Contexto da última operação
    Dado que o cliente falou do resgate OP-10001 na mensagem anterior
    Quando o cliente pergunta "e quando cai?"
    Então a resposta usa a operação OP-10001
    E o cliente não precisa repetir qual resgate

  Cenário: Contexto do último produto
    Dado que o cliente perguntou sobre o fundo de renda fixa
    Quando o cliente pergunta "e o IR dele?"
    Então a resposta trata do fundo de renda fixa

  Cenário: Retenção oferecida uma só vez
    Dado que a retenção já foi oferecida
    Quando o cliente volta a pedir o encerramento
    Então nenhuma nova retenção é oferecida

  Cenário: Sessões são independentes
    Dado duas sessões abertas por clientes diferentes
    Quando uma delas entra em modo segurança
    Então a outra não é afetada

  Cenário: Encerramento da sessão
    Dado que o caso foi entregue a um humano e o cliente se despediu
    Quando a sessão é encerrada
    Então o histórico fica disponível ao atendente pelo protocolo
