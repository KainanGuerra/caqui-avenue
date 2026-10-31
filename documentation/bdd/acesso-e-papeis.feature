# language: pt
@transversal @premissa
Funcionalidade: Acesso simulado e papéis
  O app tem a visão do cliente e a visão do suporte. O login é simulado: uma tela lista
  usuários dos dados sintéticos, sem senha, e o servidor guarda a sessão. O papel da sessão
  filtra o que cada um enxerga, no servidor e não na tela. Depende da decisão de incluir a
  visão do suporte no primeiro corte (D10).

  Cenário: A tela de entrada lista usuários sintéticos
    Quando alguém abre o app sem sessão
    Então vê a lista de clientes e de atendentes dos dados sintéticos
    E não há campo de senha

  Cenário: Cliente entra no chat
    Quando alguém escolhe o cliente C-0001
    Então o servidor cria a sessão com o papel de cliente
    E a tela mostra o chat com os dados de C-0001

  Cenário: Atendente entra na fila
    Quando alguém escolhe o atendente Jonas
    Então o servidor cria a sessão com o papel de atendente
    E a tela mostra a fila de casos

  Cenário: Gerente entra no painel
    Quando alguém escolhe "Sou gerente" (Helena)
    Então a tela mostra o painel gerencial
    E o menu não tem a fila nem o chat

  Cenário: Cliente não acessa a fila
    Dado a sessão do cliente C-0001
    Quando ele pede a fila de casos
    Então o servidor recusa o acesso

  Cenário: Cliente não vê dado de outro cliente
    Dado a sessão do cliente C-0001
    Quando ele pede o caso ou a conversa de C-0002
    Então a resposta é a mesma de um caso que não existe

  Cenário: O navegador guarda só um identificador
    Quando a sessão é criada
    Então o cookie traz um id aleatório, sem dado do usuário
    E o cookie não é legível por script

  Cenário: Sair encerra a sessão
    Dado uma sessão ativa
    Quando o usuário sai
    Então a sessão deixa de existir no servidor
    E o app volta à tela de entrada

  Cenário: Cada entrada gera uma sessão nova
    Dado um usuário que sai e entra de novo
    Quando a nova sessão é criada
    Então o id é diferente do anterior
