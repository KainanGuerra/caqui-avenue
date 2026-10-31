# language: pt
@regra-2
Funcionalidade: Imposto de renda regressivo na renda fixa
  Regra 2 do case. IR só sobre o RENDIMENTO, nunca sobre o valor total do resgate.
  Prazo em dias corridos desde a aplicação: até 180 dias 22,5%; 181 a 360 dias 20%;
  361 a 720 dias 17,5%; acima de 720 dias 15%. LCI, LCA e poupança são isentas para
  pessoa física. IOF está fora do desafio. Fonte: KB-010 e dados/taxas.json.

  Contexto:
    Dado que o cliente da sessão é C-0002

  @PT-06
  Cenário: Dia 181 cai na faixa de 20%
    Dado que agora é 18/11/2026 às 10h
    Quando o cliente pergunta "Se eu resgatar hoje o CDB que apliquei em 21/05/2026, qual a alíquota de IR?"
    Então são 181 dias corridos e a alíquota é 20% sobre o rendimento
    E o rendimento bruto informado é R$ 810,03 e o IR é R$ 162,01

  @PT-07
  Cenário: Dia 180 ainda está na faixa de 22,5%
    Quando o cliente pergunta "E se eu tivesse resgatado esse mesmo CDB ontem, 17/11?"
    Então são 180 dias corridos e a alíquota é 22,5% sobre o rendimento

  @PT-08
  Cenário: Dia 361 cai na faixa de 17,5%
    Quando o cliente pergunta "Qual a alíquota se eu resgatar o fundo de renda fixa (aplicado em 24/11/2025) com a data de cálculo em 20/11/2026?"
    Então são 361 dias corridos e a alíquota é 17,5% sobre o rendimento

  @PT-09
  Cenário: IR não incide sobre o valor total do resgate
    Dado que agora é 18/11/2026 às 10h
    Quando o cliente pergunta "O IR do meu Tesouro Selic (aplicado em 27/11/2024) incide sobre o valor total do resgate?"
    Então a resposta diz que não incide, só sobre o rendimento
    E são 721 dias corridos e a alíquota é 15%

  Esquema do Cenário: Fronteiras entre as faixas, em dias corridos
    Quando o cliente resgata um produto tributável com <dias> dias corridos de aplicação
    Então a alíquota é <aliquota>

    Exemplos:
      | dias | aliquota |
      | 1    | 22,5%    |
      | 180  | 22,5%    |
      | 181  | 20%      |
      | 360  | 20%      |
      | 361  | 17,5%    |
      | 720  | 17,5%    |
      | 721  | 15%      |

  Esquema do Cenário: Produtos isentos para pessoa física
    Quando o cliente pergunta o IR de <produto> com qualquer prazo
    Então a resposta diz que é isento de IR para pessoa física
    E nenhuma alíquota é aplicada

    Exemplos:
      | produto             |
      | LCI                 |
      | LCA                 |
      | a poupança          |

  Cenário: A alíquota nunca é aplicada sobre o valor total
    Dado que o resgate tem principal R$ 10.000,00 e rendimento R$ 500,00 em 100 dias
    Quando o cliente pergunta quanto será descontado de IR
    Então o IR é calculado sobre R$ 500,00 e não sobre R$ 10.500,00
