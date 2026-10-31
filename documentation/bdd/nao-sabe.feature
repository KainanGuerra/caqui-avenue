# language: pt
@regra-9
Funcionalidade: Não sabe, diz que não sabe
  Regra 9 do case. Prazo, taxa ou regra que não está na base não existe: o agente não
  inventa. Produtos que a Caqui não oferece (KB-030). Entre artigos conflitantes vale a
  revisão mais recente (KB-006, 2026) e nunca o antigo (KB-007, 2024). Toda informação
  factual mostra de onde veio.

  @PT-29
  Cenário: Previdência privada não é oferecida
    Quando o cliente pergunta "Vocês têm previdência privada?"
    Então a ação é responder
    E a resposta diz que a Caqui não oferece previdência
    E a resposta cita a fonte KB-030

  @PT-30
  Cenário: Prazo de criptomoedas não é inventado
    Quando o cliente pergunta "Qual o prazo de resgate de criptomoedas?"
    Então a resposta diz que a Caqui não oferece criptoativos
    E nenhum prazo é inventado

  @PT-31
  Cenário: Artigo desatualizado é descartado
    Quando o cliente pergunta "Qual o horário de corte para resgate de CDB?"
    Então a resposta diz 16h e cita a fonte KB-006, revisada em 2026
    E a resposta não usa o artigo antigo KB-007, que diz 15h

  @PT-39
  Cenário: Dúvida de conceito com fonte
    Quando o cliente pergunta "O que é liquidez diária?"
    Então a ação é responder
    E a resposta explica com base no KB-004 e cita a fonte

  @PT-40
  Cenário: Garantia do CDB
    Quando o cliente pergunta "Esse CDB tem garantia?"
    Então a resposta diz que o CDB tem garantia do FGC dentro dos limites do FGC, KB-013
    E diz que fundos, Tesouro e ações não têm essa garantia

  Esquema do Cenário: Assuntos que a base não cobre
    Quando o cliente pergunta <pergunta>
    Então a resposta diz que não tem essa informação
    E logo abaixo da resposta aparece o botão "Falar com uma pessoa" (fora do horário, "Registrar minha demanda")
    E nenhum prazo, taxa ou regra é inventado

    Exemplos:
      | pergunta                                              |
      | "qual o rendimento do CDB em 2030?"                   |
      | "qual o endereço da sede da Caqui?"                   |
      | "vocês patrocinam algum time de futebol?"             |

  Esquema do Cenário: Produtos que a Caqui não oferece têm resposta própria
    Quando o cliente pergunta <pergunta>
    Então a resposta diz que a Caqui não oferece o produto
    E cita a fonte KB-030

    Exemplos:
      | pergunta                                              |
      | "qual a taxa do seu seguro de vida?"                  |
      | "vocês fazem câmbio para dólar?"                      |
      | "tem consórcio?"                                      |

  Cenário: Toda resposta factual traz a fonte
    Quando o agente responde qualquer pergunta factual
    Então a resposta traz ao menos uma fonte: artigo KB-xxx ou dado da conta do cliente

  Cenário: Busca sem artigo confiável
    Dado que nenhum artigo da base passa do limiar de confiança
    Quando o cliente faz a pergunta
    Então a política escolhe "não sei" em vez de responder
