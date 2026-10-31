# language: pt
@transversal
Funcionalidade: Prioridade entre sinais na mesma mensagem
  Uma mensagem pode trazer mais de um sinal (pergunta de prazo + sinal de golpe). O
  entendimento produz um CONJUNTO de sinais e a política escolhe a ação pela ordem fixa:
  1 golpe, 2 vulnerável, 3 pedido de dado alheio, 4 recomendação, 5 humano, cancelamento
  ou reclamação, 6 ambíguo repetido, 7 responder. Injeção de papel ("você agora é...")
  é neutralizada como texto e não decide a ação sozinha: a ação sai dos demais sinais
  (PT-36). A política é uma função pura: não lê texto nem rede, só sinais, sessão,
  relógio e cliente.

  @regra-5 @PT-19
  Cenário: Pergunta de prazo com sinal de golpe no meio
    Quando o cliente escreve "Qual o prazo do resgate? Ah, e me pediram pra instalar um app de suporte remoto, é normal?"
    Então os sinais detectados são pergunta de prazo e golpe
    E a ação é seguranca_imediata
    E a pergunta de prazo não é respondida primeiro

  Esquema do Cenário: O sinal de maior prioridade vence
    Quando a mensagem traz os sinais <sinais>
    Então a ação é <acao>
    E o motivo registrado é <motivo>

    Exemplos:
      | sinais                                | acao                    | motivo                  |
      | golpe e recomendação                  | seguranca_imediata      | GOLPE                   |
      | golpe e vulnerável                    | seguranca_imediata      | GOLPE                   |
      | vulnerável e recomendação             | encaminhar_humano       | VULNERAVEL              |
      | troca de papel e recomendação         | encaminhar_especialista | RECOMENDACAO            |
      | dado alheio e recomendação            | recusar                 | DADO_ALHEIO             |
      | recomendação e pedido de humano       | encaminhar_especialista | RECOMENDACAO            |
      | cancelamento e pergunta de prazo      | responder               | CANCELAMENTO            |

  Cenário: Injeção que pede dado alheio é recusada
    Quando a mensagem traz um pedido de dado de outro cliente
    Então a ação é recusar
    E o motivo registrado é DADO_ALHEIO

  Cenário: Cada decisão carrega os motivos
    Quando a política decide qualquer ação
    Então a decisão traz a lista de motivos
    E o painel do atendente mostra esses motivos

  Cenário: A política não depende do texto
    Dado os mesmos sinais, a mesma sessão, o mesmo relógio e o mesmo cliente
    Quando a política decide duas vezes
    Então a ação e os motivos são idênticos
