# language: pt
@regra-3
Funcionalidade: Comparação de rendimento com a poupança
  Regra 3 do case. A comparação é sempre entre valores LÍQUIDOS, com as taxas de
  dados/taxas.json (CDI 11% a.a. e poupança 0,6% a.m., fictícias e fixas). Nunca
  compara CDB bruto com poupança isenta e nunca usa taxa real da internet.
  Rendimento diário do CDB = ((1 + CDI a.a.)^(1/252) - 1) x percentual do CDI, por dia útil.

  Contexto:
    Dado que agora é 18/11/2026 às 10h

  @PT-10
  Cenário: CDB que rende menos que a poupança no líquido
    Dado que o cliente da sessão é C-0011
    Quando o cliente pergunta "Meu CDB rendeu menos que a poupança?"
    Então a resposta compara líquido com líquido em 107 dias
    E informa CDB de R$ 267,53 bruto e R$ 207,34 líquido
    E informa poupança de R$ 215,65 no mesmo período
    E conclui que o CDB rendeu menos no líquido

  @PT-11
  Cenário: CDB que rende mais que a poupança no líquido
    Dado que o cliente da sessão é C-0012
    Quando o cliente pergunta "Meu CDB rendeu menos que a poupança?"
    Então a resposta compara líquido com líquido em 170 dias
    E informa CDB de R$ 509,51 bruto e R$ 394,87 líquido
    E informa poupança de R$ 344,80 no mesmo período
    E conclui que o CDB rendeu mais no líquido

  @PT-12
  Cenário: Taxa da poupança vem do arquivo de taxas
    Quando o cliente pergunta "Qual a taxa da poupança hoje?"
    Então a resposta usa 0,6% ao mês, a taxa fictícia de taxas.json
    E não busca taxa real na internet

  Cenário: Comparar o bruto do CDB com a poupança isenta é proibido
    Dado que o CDB do cliente rende mais no bruto e menos no líquido
    Quando o cliente pergunta se o CDB rendeu menos que a poupança
    Então a conclusão usa o valor líquido do CDB
    E a resposta mostra o bruto e o líquido lado a lado

  Cenário: Conclusão invertida entre bruto e líquido
    Dado que o CDB do cliente perde para a poupança no líquido, mas ganha no bruto
    Quando o cliente pergunta se rendeu menos que a poupança
    Então a resposta diz que rendeu menos no líquido
    E explica que o bruto engana por causa do IR
