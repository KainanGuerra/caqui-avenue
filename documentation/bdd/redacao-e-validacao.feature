# language: pt
@transversal
Funcionalidade: Redação pelo modelo e validação da saída
  O código decide a ação e calcula os fatos; o modelo de linguagem (qualquer provedor,
  ou nenhum) só redige. Um validador confere a saída; se falhar, entra o template
  determinístico. A persona é configuração versionada (nome, tom, saudação, frases
  vetadas). A ação nunca é escolhida pelo modelo.

  Cenário: Fatos obrigatórios aparecem no texto
    Dado que o plano de resposta exige a data 05/11/2026 e a fonte KB-006
    Quando o modelo redige a resposta
    Então o validador confirma que a data e a fonte aparecem no texto

  Cenário: Texto sem o fato obrigatório é reprovado
    Dado que o modelo devolve um texto sem a data obrigatória
    Quando o validador confere a saída
    Então a saída é reprovada
    E a resposta usa o template determinístico

  Cenário: Texto com conteúdo proibido é reprovado
    Dado que o modelo devolve uma frase que recomenda um produto
    Quando o validador confere a saída
    Então a saída é reprovada
    E a resposta usa o template determinístico

  Cenário: Texto com CPF completo é reprovado
    Dado que o modelo devolve um CPF sem máscara
    Quando o validador confere a saída
    Então a saída é reprovada

  Cenário: Queda do provedor não derruba o atendimento
    Dado que o provedor de modelo não responde dentro do tempo limite
    Quando o cliente faz uma pergunta
    Então a resposta vem do template com os mesmos fatos
    E a ação é a mesma que seria com o modelo

  Esquema do Cenário: A mesma decisão com qualquer provedor
    Dado que o provedor configurado é <provedor>
    Quando o cliente escreve "Quero encerrar minha conta"
    Então a ação é responder
    E os fatos e as fontes são os mesmos

    Exemplos:
      | provedor                  |
      | Anthropic                 |
      | compatível com OpenAI     |
      | template (sem modelo)     |

  Cenário: O modelo não escolhe a ação
    Dado que o modelo sugere encaminhar_especialista para uma pergunta de prazo
    Quando a política já decidiu responder
    Então a ação continua sendo responder

  Cenário: O modelo só pode subir o alerta
    Dado que o entendimento do modelo detecta um sinal de golpe que o léxico não viu
    Quando a política decide
    Então a ação sobe para seguranca_imediata
    E um sinal detectado pelo léxico nunca é removido pelo modelo

  Cenário: Persona configurada
    Dado que a persona define nome, tom e saudação
    Quando o agente cumprimenta o cliente
    Então a saudação usa a persona
    E a persona não altera nenhuma regra de negócio

  Cenário: Texto do cliente vai como dado ao modelo
    Quando o texto do cliente é enviado ao modelo
    Então ele vai em um bloco delimitado de dados, nunca como instrução de sistema

  @premissa
  Cenário: O prompt leva persona, fatos calculados e o artigo escolhido por id
    Dado que a calculadora devolveu a data e a fonte KB-006
    Quando o código monta o prompt
    Então ele leva a persona, os fatos calculados e o texto do artigo achado pela busca da base

  @premissa @regra-9
  Cenário: Artigo substituído nunca entra no prompt
    Dado que o KB-007 é a versão antiga do KB-006
    Quando o cliente pergunta o horário de corte do resgate
    Então o prompt usa o KB-006
    E o KB-007 não aparece no prompt nem na fonte citada
