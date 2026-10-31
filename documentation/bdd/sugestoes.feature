# language: pt
@transversal
Funcionalidade: Sugestões de pergunta no chat
  As sugestões mudam com o tipo de cliente, com a conversa e com o que a pessoa está digitando. O servidor as monta
  só com os dados da própria sessão. Toda sugestão precisa ter resposta: nenhuma leva a "não entendi" nem a "não tenho
  essa informação". Perfis: idoso (60 anos ou mais), iniciante (cliente da parceria, cliente novo ou sem posições),
  experiente (dois ou mais produtos) e padrão.

  Cenário: Cliente idoso recebe segurança em linguagem simples
    Dado que o cliente da sessão tem 63 anos
    Quando a tela abre as sugestões
    Então a primeira é "Como sei se uma ligação ou mensagem é golpe?"
    E nenhuma fala de alíquota de imposto

  Cenário: Pedir uma pessoa nunca é sugestão
    Dado qualquer perfil, qualquer momento da conversa e qualquer digitação, inclusive "pessoa" e "atendente"
    Quando a tela abre as sugestões
    Então nenhuma pede para falar com uma pessoa
    Mas escrever "Quero falar com uma pessoa" continua chamando uma pessoa

  Cenário: Cliente experiente recebe perguntas técnicas sobre os próprios produtos
    Dado que o cliente da sessão tem vários produtos
    Quando a tela abre as sugestões
    Então elas citam os produtos que ele tem, como "alíquota de IR se eu resgatar o CDB 100 hoje"
    E não incluem conceitos básicos como "O que é um CDB?"

  Cenário: Cliente iniciante recebe conceitos básicos
    Dado que o cliente é da parceria com o varejista ou não tem posições
    Quando a tela abre as sugestões
    Então elas incluem "O que é liquidez diária?" e "O que é um CDB?"

  Esquema do Cenário: As sugestões acompanham o que a pessoa digita
    Quando a pessoa digita <digitado>
    Então as sugestões passam a combinar com o texto, como <sugestao>
    E o rótulo muda para "Parecido com o que você digita"

    Exemplos:
      | digitado   | sugestao                                          |
      | "golp"     | "Como sei se uma ligação ou mensagem é golpe?"    |
      | "imposto"  | "Qual a alíquota de IR se eu resgatar"            |
      | "poup"     | "Qual a taxa da poupança hoje?"                   |
      | "encerr"   | "Quero encerrar minha conta"                      |
      | "reclam"   | "Quero fazer uma reclamação"                      |

  Cenário: Digitação sem correspondência volta às sugestões do perfil
    Quando a pessoa digita um texto que não combina com nenhuma sugestão
    Então as sugestões do perfil voltam

  Cenário: As sugestões seguem a conversa
    Quando o agente acabou de tratar um golpe
    Então a primeira sugestão é "Como bloqueio meu acesso?"
    Quando o agente acabou de falar do prazo de um produto
    Então a primeira sugestão é o IR desse mesmo produto
    Quando o agente encaminhou a um especialista
    Então há sugestão do prazo do protocolo e de um conceito geral

  Cenário: Só sugere o que o cliente tem e o que se aplica
    Quando o cliente não tem CDB na conta
    Então não sugere comparar o CDB com a poupança
    E nunca sugere calcular IR de LCI, LCA ou ações

  Cenário: Com atendente na conversa não há sugestões
    Dado que um atendente assumiu o caso
    Quando a tela pede as sugestões
    Então a lista vem vazia

  Cenário: Toda sugestão tem resposta
    Dado todas as sugestões possíveis para todos os clientes e todas as digitações de teste
    Quando cada uma é enviada ao agente
    Então nenhuma recebe "Não consegui entender" nem "não tenho na minha base"
