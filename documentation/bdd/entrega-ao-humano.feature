# language: pt
@transversal
Funcionalidade: Entrega ao humano sem repetição
  Regra geral 5 do case: o cliente nunca repete a demanda; quem recebe o caso vê o
  histórico e o protocolo (KB-025, KB-026). O resumo, os sinais, o risco e a prioridade
  são montados pelo CÓDIGO a partir de dados estruturados, não por texto gerado. Idoso
  passa na frente (KB-028). Persona de quem atende: Jonas, atendente há 2 meses.

  Cenário: Todo encaminhamento gera protocolo
    Quando qualquer encaminhamento a humano, especialista ou segurança acontece
    Então um protocolo é gerado
    E a resposta ao cliente mostra o protocolo e o prazo

  Cenário: O caso chega com histórico e resumo
    Dado que o cliente conversou por três mensagens antes de pedir humano
    Quando o atendente abre o caso no painel
    Então ele vê o resumo, os sinais, o risco e o histórico da conversa
    E o CPF aparece mascarado

  Cenário: O cliente não repete o motivo
    Quando o atendente assume o caso
    Então a primeira fala não pergunta de novo o que o cliente já contou

  Cenário: Pessoa idosa passa na frente da fila
    Dado dois casos na fila, o de um cliente de 63 anos e o de um cliente de 30 anos
    Quando o painel ordena a fila
    Então o caso do cliente de 63 anos aparece primeiro

  Cenário: Golpe passa na frente de tudo
    Dado um caso de golpe e um caso de pessoa idosa na fila
    Quando o painel ordena a fila
    Então o caso de golpe aparece primeiro

  Cenário: O resumo é montado pelo código
    Quando o pacote de entrega é criado
    Então o resumo vem dos sinais e dos fatos da conversa
    E nenhum texto gerado pelo modelo entra no resumo

  Cenário: Jonas responde com segurança
    Dado que o painel mostra os motivos da decisão e a fonte de cada fato
    Quando Jonas abre o caso
    Então ele não precisa chamar o supervisor para saber o que o agente já informou

  Cenário: Fora do horário o caso espera com protocolo
    Dado que agora é 18/11/2026 às 23h
    Quando o cliente pede humano
    Então o caso fica registrado com protocolo e prazo de retorno
    E aparece na fila às 8h

  Cenário: O atendente assume o caso e o agente fica em silêncio
    Dado que um caso está aberto para a sessão do cliente
    Quando o atendente assume o caso
    Então o status do caso passa a assumido e mostra o nome do atendente
    E as próximas mensagens do cliente vão para o atendente
    E o agente não responde a elas

  Cenário: A resposta do atendente chega ao chat do cliente
    Dado que o atendente assumiu o caso
    Quando o atendente envia uma resposta
    Então a fala aparece no histórico da sessão com a identificação de pessoa da Caqui
    E o cliente a vê no chat sem recarregar a tela

  Cenário: Resolver o caso devolve a conversa ao agente
    Dado que o caso foi resolvido pelo atendente
    Quando o cliente envia uma nova pergunta
    Então o agente volta a responder
    E o modo segurança da sessão, se existia, é liberado

  Cenário: Um caso por sessão, com gravidade que só sobe
    Dado que a sessão já tem um caso aberto
    Quando o cliente gera um novo encaminhamento
    Então o mesmo caso é atualizado e nenhum caso novo é criado
    E a prioridade e o risco só podem aumentar

  Cenário: O painel exige o PIN quando ele está configurado
    Dado que o PIN do painel está configurado
    Quando alguém abre a fila sem entrar com o PIN
    Então o acesso é negado
    E sem PIN configurado o painel abre com um aviso de uso local

  Cenário: A espera estimada é simulada e limitada
    Dado vários casos abertos na fila
    Quando o cliente recebe o tempo estimado de espera
    Então o valor cresce com os casos à frente e nunca passa de 35 minutos

