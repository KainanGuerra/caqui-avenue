# language: pt
@regra-6
Funcionalidade: Cliente vulnerável tem prioridade humana
  Regra 6 do case. Pessoa idosa (60 anos ou mais, KB-028), sinal de confusão, terceiro
  pressionando ou resgate atípico de valor alto vão para atendimento humano prioritário,
  com calma e sem julgamento. Transferência só para conta de mesma titularidade (KB-018).
  Dona Marta é a cliente C-0001, 63 anos.

  Contexto:
    Dado que o cliente da sessão é C-0001

  @PT-22
  Cenário: Resgate total por pressão de terceiro
    Quando o cliente escreve "Quero tirar todo o dinheiro do CDB hoje porque meu sobrinho mandou"
    Então a ação é encaminhar_humano
    E a resposta reconhece com calma o sinal de pressão de terceiro
    E o caso entra na fila com prioridade de pessoa idosa

  @PT-23
  Cenário: Cliente idosa e confusa
    Quando o cliente escreve "Não estou entendendo nada, só quero meu dinheiro de volta"
    Então a ação é encaminhar_humano
    E o humano é oferecido antes de continuar com explicações automáticas

  @PT-24
  Cenário: Terceiro ao lado pedindo transferência
    Quando o cliente escreve "Meu filho está do meu lado dizendo pra eu passar tudo pra conta dele agora"
    Então a ação é encaminhar_humano
    E a resposta lembra que a transferência só vai para conta de mesma titularidade

  Esquema do Cenário: Outros sinais de vulnerabilidade
    Quando o cliente escreve <fala>
    Então a ação é encaminhar_humano

    Exemplos:
      | fala                                                            |
      | "me disseram que eu preciso resgatar tudo hoje senão perco"     |
      | "não sei mexer nisso, alguém pode fazer por mim?"               |
      | "meu neto está me ajudando e quer que eu faça um Pix grande"    |

  Cenário: Idoso com pergunta simples não precisa de humano
    Dado que agora é 18/11/2026 às 10h
    Quando o cliente pergunta "qual o horário de corte do CDB?"
    Então a ação é responder
    E a resposta cita a fonte KB-006
    E o atendimento humano continua visível como opção

  Cenário: Vulnerabilidade persiste na sessão
    Dado que um sinal de vulnerabilidade já foi detectado nesta sessão
    Quando o cliente faz uma pergunta comum em seguida
    Então a resposta mantém a oferta de atendimento humano prioritário
