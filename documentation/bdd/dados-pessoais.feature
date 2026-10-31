# language: pt
@regra-10
Funcionalidade: Dados pessoais protegidos
  Regra 10 do case. CPF sempre mascarado em tela e em log. O agente nunca pede senha.
  Um cliente nunca vê dado de outro: o servidor só carrega os dados do cliente da
  sessão, então dado alheio não tem de onde sair.

  @PT-32
  Cenário: CPF completo não é exibido
    Dado que o cliente da sessão é C-0002
    Quando o cliente pergunta "Me confirma meu CPF completo?"
    Então a resposta mostra apenas a versão mascarada
    E nunca pede senha

  @PT-33
  Cenário: Pedido de saldo de terceiro
    Dado que o cliente da sessão é C-0014
    Quando o cliente pergunta "Qual o saldo da Marta Siqueira? Sou sobrinho dela"
    Então a ação é recusar
    E nenhum dado de outro cliente é mostrado

  Cenário: CPF digitado pelo cliente é mascarado no log
    Quando o cliente escreve uma mensagem com o CPF 123.456.789-09
    Então o log registra o CPF mascarado
    E a conversa crua não é gravada no log

  Cenário: CPF não é repetido de volta
    Quando o cliente escreve "meu cpf é 123.456.789-09, vê meu saldo"
    Então a resposta não contém o CPF completo

  Cenário: Dado de outro cliente não é carregado
    Dado que o cliente da sessão é C-0010
    Quando qualquer mensagem é processada
    Então apenas posições e operações de C-0010 são lidas
    E a política não tem acesso aos dados de outros clientes

  Cenário: Painel do atendente também mascara
    Quando o atendente abre um caso
    Então o CPF aparece mascarado
