# language: pt
Funcionalidade: Home do cliente
  A Home mostra o que a conta tem e o que está em andamento, sem que a tela calcule regra. O servidor devolve em
  GET /api/chat/{sessaoId}/conta o patrimônio, as etapas de cada operação em processamento, a alocação por classe e os
  avisos de feriado; a tela só exibe e envia intenção. As datas vêm do calendário e do corte das 16h, nunca da coluna
  liquidacao_prevista da planilha. O Figma (nó 50:3) define layout; nenhum número dele entra no código.

  Contexto:
    Dado que agora é 18/11/2026 às 10h

  @regra-1
  Cenário: Dona Marta vê o resgate em andamento com as etapas
    Dado que o cliente da sessão é C-0001
    E a operação OP-10005 é um resgate de R$ 40.000,00 do CDB Liquidez Diária 110 pedido em 17/11/2026 às 19h40
    Quando a Home pede a conta
    Então o card "Em andamento" diz "Seu resgate de R$ 40.000,00 cai hoje, 18/11"
    E as etapas são "Pedido recebido · 17/11, 19h40" concluída, "Liquidação · 18/11" em andamento e "No saldo disponível · 18/11" próxima
    E o pedido explica "Depois das 16h00: conta a partir do próximo dia útil"
    E a fonte é "KB-006 · OP-10005"

  @regra-1
  Cenário: Fundo mostra a cotização e a data vem do cálculo, não da planilha
    Dado que o cliente da sessão é C-0007
    E a operação OP-10001 é um resgate do Caqui Renda Fixa FIF pedido em 13/11/2026 às 17h05, sem data prevista na planilha
    Quando a Home pede a conta
    Então as etapas são pedido em 13/11, cotização em 17/11, liquidação em 18/11 e saldo disponível em 18/11
    E a liquidação prevista é 18/11/2026

  @regra-1
  Cenário: Operação atrasada não aparece como concluída
    Dado que o cliente da sessão é C-0041
    E a operação OP-10014 segue em processamento depois da data calculada
    Quando a Home pede a conta
    Então a última etapa continua em andamento
    E o título diz que estava prevista para a data calculada e segue em processamento

  @regra-1
  Cenário: Aplicação em fundo não ganha data inventada
    Dado que o cliente da sessão é C-0026
    E a operação OP-10027 é uma aplicação no Caqui Renda Fixa FIF em processamento
    Quando a Home pede a conta
    Então as etapas são só "Pedido recebido" e "Dia-base do pedido"
    E não há data prevista de liquidação, porque a KB-006 não traz o prazo de aplicação em fundo

  Cenário: Sem operação em processamento, o card não aparece
    Dado que o cliente da sessão é C-0002
    Quando a Home pede a conta
    Então não há card "Em andamento"

  Cenário: Visão geral vem pronta do servidor
    Dado que o cliente da sessão é C-0001
    Quando a Home pede a conta
    Então o patrimônio é o saldo bruto das posições mais o saldo em conta
    E o resultado desde a aplicação é o saldo bruto menos o aplicado, com o percentual sobre o aplicado
    E não há seletor de período, porque não há histórico de saldo

  Cenário: Ocultar valores é só da tela
    Quando a pessoa toca em "Ocultar valores"
    Então todo valor em reais da Home vira "R$ ••••"
    E o botão passa a dizer "Mostrar valores"
    E nada é enviado ao servidor

  @regra-1
  Esquema do Cenário: Avisos de feriado nos próximos 5 dias úteis
    Dado que hoje é <hoje>
    Quando a Home pede a conta
    Então os avisos são <avisos>

    # Derivado de caqui-invest/dados/calendario.json: 15/11/2026 é domingo e 20/11/2026 é sexta.
    Exemplos:
      | hoje       | avisos                                                                                                              |
      | 18/11/2026 | "20/11 é feriado (Dia da Consciência Negra)": "Pedidos de quinta, 19/11, depois das 16h00 contam a partir de segunda, 23/11." |
      | 13/11/2026 | só o de 20/11; o feriado de 15/11 cai no domingo e não muda prazo                                                   |
      | 24/11/2026 | nenhum                                                                                                              |

  Esquema do Cenário: Alocação por classe soma 100
    Dado que o cliente da sessão é <cliente>
    Quando a Home pede a conta
    Então a alocação é <alocacao>

    Exemplos:
      | cliente | alocacao                                    |
      | C-0001  | 100% renda fixa                             |
      | C-0002  | 83% renda fixa e 17% renda variável (ações) |

  Cenário: Multimercado conta como renda variável
    Dado uma posição no Caqui Multimercado FIF
    Então ela entra em renda variável, porque o valor da cota pode cair (KB-014)

  Cenário: Ações rápidas são só as que existem
    Quando a pessoa abre a Home
    Então as ações são "Resgatar" e "Falar com uma pessoa"
    E não há "Investir" nem "Transferir"
    Quando a pessoa toca em "Resgatar"
    Então a conversa abre e envia "Quando cai meu resgate?"
    Quando a pessoa toca em "Falar com uma pessoa"
    Então abre a página de Atendimento, que decide entre falar agora e registrar a demanda

  @regra-4
  Cenário: Conteúdo educativo não é recomendação
    Quando a pessoa vê "Próximos passos"
    Então o card de liquidez traz o selo "Conteúdo educativo, não é recomendação"
    E não indica produto nem percentual

  @regra-12
  Esquema do Cenário: Atendimento humano com a disponibilidade real
    Dado que agora é 18/11/2026 às <hora>
    Quando a pessoa vê "Próximos passos"
    Então o card "Falar com uma pessoa" diz <texto>
    E tocar nele abre a página de Atendimento

    Exemplos:
      | hora  | texto                                                          |
      | 14h00 | "Uma pessoa da Caqui está disponível agora."                   |
      | 23h00 | "Fora do horário: a pessoa volta às 8h. Golpe e segurança, 24h." |

  @regra-10
  Cenário: A Home só traz dados do cliente da sessão
    Dado que o cliente da sessão é C-0002
    Quando a Home pede a conta
    Então nenhuma posição ou operação de outro cliente aparece
    E nenhum campo de CPF vai para a tela
