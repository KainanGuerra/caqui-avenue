# language: pt
@regra-1
Funcionalidade: Liquidação e prazos de resgate
  Regra 1 do case (caqui-invest/CASE.md). Corte às 16h em dia útil; depois das 16h,
  fim de semana ou feriado, o dia-base é o próximo dia útil. O calendário é
  dados/calendario.json (só feriados nacionais). A data é sempre CALCULADA: a coluna
  liquidacao_prevista de operacoes.csv vem vazia de propósito e nunca é a fonte.
  Fundo de renda fixa: cotização em D+1 e pagamento em D+2 úteis do dia-base.
  Multimercado: cotização 30 dias corridos após o dia-base (ajustada para dia útil)
  e pagamento 2 dias úteis depois. Tesouro Selic: D+1 útil. Fonte citada: KB-006.

  Contexto:
    Dado que o cliente está identificado na sessão
    E que o horário de atendimento é o do relógio informado em cada cenário

  @PT-01
  Cenário: Fundo de renda fixa pedido na sexta às 17h com feriado na segunda
    Dado que agora é 31/10/2026 às 10h
    Quando o cliente pergunta "Pedi o resgate do Caqui Renda Fixa na sexta, 30/10, às 17h. Quando o dinheiro cai?"
    Então o dia-base é 03/11/2026, porque o pedido passou das 16h e 02/11 é feriado
    E a cotização é em 04/11/2026
    E o pagamento é em 05/11/2026
    E a ação é responder
    E a resposta cita a fonte KB-006

  @PT-02
  Cenário: CDB de liquidez diária pedido antes do corte das 16h
    Dado que agora é 16/11/2026 às 16h10
    Quando o cliente pergunta "Resgatei o CDB de liquidez diária hoje às 15h58. Cai hoje?"
    Então a liquidação é em 16/11/2026
    E a ação é responder

  @PT-03
  Cenário: Pedido depois das 16h feito na véspera e ainda em processamento
    Dado que agora é 18/11/2026 às 09h
    E que o cliente da sessão é C-0001
    Quando o cliente pergunta "Pedi resgate do CDB 110 ontem às 19h40. Por que ainda não caiu?"
    Então o dia-base é 18/11/2026 e a liquidação acontece em 18/11/2026
    E a resposta diz que o status hoje é em processamento
    E a resposta não diz "sumiu" nem "perdido"

  @PT-04
  Cenário: Multimercado pedido na sexta às 17h20 com feriado na segunda
    Dado que agora é 18/11/2026 às 10h
    E que o cliente da sessão é C-0002
    Quando o cliente pergunta "Quando cai o resgate do multimercado que pedi em 30/10 às 17h20?"
    Então o dia-base é 03/11/2026
    E a cotização é 30 dias corridos depois, ajustada para dia útil
    E o pagamento é 2 dias úteis após a cotização, em 07/12/2026

  @PT-05
  Cenário: Pedido feito no sábado conta a partir do próximo dia útil
    Dado que agora é 14/11/2026 às 09h05
    Quando o cliente pergunta "Pedi resgate do CDB no sábado de manhã. Quando cai?"
    Então a liquidação é em 16/11/2026, o próximo dia útil

  Esquema do Cenário: Dia-base e prazos pelo calendário da Caqui
    Dado que agora é 18/11/2026 às 10h
    Quando o cliente pede <produto> em <pedido>
    Então o dia-base é <dia_base>
    E o pagamento é em <pagamento>

    Exemplos: derivados de dados/calendario.json (20/11/2026 é feriado nacional)
      | produto              | pedido                   | dia_base   | pagamento  |
      | CDB liquidez diária  | quinta 19/11/2026 às 17h | 23/11/2026 | 23/11/2026 |
      | CDB liquidez diária  | sexta 20/11/2026 às 10h  | 23/11/2026 | 23/11/2026 |
      | fundo renda fixa     | sexta 13/11/2026 às 15h  | 13/11/2026 | 17/11/2026 |
      | fundo renda fixa     | quinta 19/11/2026 às 17h | 23/11/2026 | 25/11/2026 |

  @premissa
  Cenário: Pedido às 16h00 em ponto
    # O case diz "até 16h". Premissa: 16h00 em ponto ainda é "até 16h" e liquida no mesmo dia.
    # Confirmar na SPEC antes de virar teste.
    Dado que agora é 16/11/2026 às 16h30
    Quando o cliente pergunta sobre um resgate de CDB pedido às 16h00 de hoje
    Então a liquidação é em 16/11/2026

  Cenário: Liquidação calculada mesmo quando a planilha vem vazia
    Dado que a operação do cliente tem liquidacao_prevista vazia
    Quando o cliente pergunta quando o resgate cai
    Então a data vem do cálculo do calendário e do corte das 16h
    E a resposta cita a operação do cliente como fonte

  Cenário: Corte antigo de 15h nunca é usado
    Dado que o artigo KB-007 (revisado em 2024) diz que o corte é 15h
    Quando o cliente pede um resgate de CDB às 15h30 de um dia útil
    Então o pedido é tratado como antes do corte das 16h
