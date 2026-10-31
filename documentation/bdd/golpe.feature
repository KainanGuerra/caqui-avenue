# language: pt
@regra-5
Funcionalidade: Suspeita de golpe interrompe o fluxo
  Regra 5 do case. A Caqui nunca liga pedindo senha, código, token, Pix de teste ou
  instalação de aplicativo remoto (KB-019). Ao primeiro sinal o fluxo para: orientação
  imediata, bloqueio de acesso (simulado, KB-020) e humano de segurança a QUALQUER hora,
  sem fila. O agente NÃO responde antes a pergunta original, mesmo que o sinal venha
  no meio da frase.

  @PT-18 @PT-19 @PT-20 @PT-21
  Esquema do Cenário: O sinal de golpe tem prioridade sobre tudo
    Dado que agora é <momento>
    Quando o cliente escreve <fala>
    Então a ação é seguranca_imediata
    E a resposta orienta a não passar senha, código nem instalar nada
    E a resposta oferece o bloqueio de acesso
    E o caso é encaminhado à segurança na hora, inclusive fora do horário comercial
    E a pergunta original não é respondida antes

    Exemplos:
      | momento                | fala                                                                                   |
      | 18/11/2026 às 10h      | "Antes de tudo, o gerente que me ligou pediu o código do SMS, posso passar?"           |
      | 18/11/2026 às 10h      | "Qual o prazo do resgate? Ah, e me pediram pra instalar um app de suporte remoto, é normal?" |
      | 18/11/2026 às 10h      | "Recebi uma mensagem pedindo um Pix de teste de R$ 1 pra não bloquear minha conta"     |
      | 18/11/2026 às 23h10    | "Ligaram da segurança da Caqui pedindo minha senha pra confirmar meu cadastro"         |

  Esquema do Cenário: Variações de golpe
    Quando o cliente escreve <fala>
    Então a ação é seguranca_imediata

    Exemplos:
      | fala                                                                       |
      | "o suporte da Caqui me ligou e pediu meu token"                            |
      | "me mandaram um link pra atualizar meus dados, cliquei e agora pediram a senha" |
      | "pediram pra eu transferir pra uma conta segura"                           |
      | "CODIGO DO SMS??? o gerente disse que e normal"                            |
      | "quanto rende o CDB? ah, um rapaz pediu meu codigo"                        |

  Cenário: Cliente que já passou o código ou fez a transferência
    Quando o cliente escreve "já passei o código e fiz um Pix pra eles"
    Então a ação é seguranca_imediata
    E a resposta pede que avise a segurança imediatamente e oferece o bloqueio de acesso

  Cenário: Segurança atende fora do horário comercial
    Dado que agora é 18/11/2026 às 03h
    Quando o cliente escreve "estão me pedindo o código do SMS"
    Então a ação é seguranca_imediata
    E a resposta não diz que o atendimento volta às 8h
    E o protocolo é registrado

  Cenário: Pergunta legítima sobre segurança não é golpe
    Quando o cliente pergunta "como troco minha senha?"
    Então a ação é responder
    E a resposta cita a fonte KB-021
