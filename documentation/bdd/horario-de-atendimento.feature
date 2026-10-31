# language: pt
@regra-12
Funcionalidade: Horário de atendimento humano
  Regra 12 do case e SAC. Humano das 8h às 20h, sete dias por semana (KB-025). Fora
  disso o agente registra protocolo e informa o prazo de retorno; não promete humano
  agora e não esconde que não há ninguém. A segurança atende a qualquer hora. O relógio
  é injetável: nos testes e na demo o horário é informado, em produção é o de
  America/Sao_Paulo.

  @PT-37
  Cenário: Pedido de humano às 14h
    Dado que agora é 18/11/2026 às 14h
    Quando o cliente escreve "Quero falar com uma pessoa"
    Então a ação é encaminhar_humano
    E a resposta oferece humano com o tempo de espera

  @PT-38
  Cenário: Pedido de humano às 23h
    Dado que agora é 18/11/2026 às 23h
    Quando o cliente escreve "Quero falar com uma pessoa"
    Então a ação é protocolo
    E a resposta diz que o atendimento por pessoa volta às 8h
    E registra um protocolo e informa o prazo de retorno
    E não promete humano agora

  Esquema do Cenário: Limites do horário humano em qualquer dia da semana
    Dado que agora é <momento>
    Quando o cliente pede para falar com uma pessoa
    Então a ação é <acao>

    # Premissa a confirmar na SPEC: 08h00 inclusive e 20h00 exclusive.
    Exemplos:
      | momento                          | acao             |
      | 18/11/2026 às 07h59 (quarta)     | protocolo        |
      | 18/11/2026 às 08h00 (quarta)     | encaminhar_humano |
      | 18/11/2026 às 19h59 (quarta)     | encaminhar_humano |
      | 18/11/2026 às 20h00 (quarta)     | protocolo        |
      | 14/11/2026 às 10h00 (sábado)     | encaminhar_humano |
      | 15/11/2026 às 10h00 (domingo, feriado) | encaminhar_humano |

  Cenário: Segurança atende fora do horário
    Dado que agora é 18/11/2026 às 23h
    Quando o cliente relata um sinal de golpe
    Então a ação é seguranca_imediata
    E o encaminhamento à segurança é imediato

  Cenário: Pergunta resolvida pelo agente não depende do horário
    Dado que agora é 18/11/2026 às 23h
    Quando o cliente pergunta "qual o horário de corte do CDB?"
    Então a ação é responder
