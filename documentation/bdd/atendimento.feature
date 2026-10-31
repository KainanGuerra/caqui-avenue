# language: pt
Funcionalidade: Página de Atendimento do cliente
  Uma página com dois estados (Figma 51:169 às 14h e 51:332 às 23h). O servidor devolve em
  GET /api/chat/{sessaoId}/atendimento se há pessoa agora, o horário, o retorno, as perguntas frequentes com a fonte
  resolvida pela busca na base e os casos da pessoa. O estado sai do relógio do servidor, nunca do navegador. A tela só
  exibe e envia intenção para a conversa que já existe; nenhum protocolo, data ou código KB vem do Figma.

  Contexto:
    Dado que o cliente da sessão é C-0001

  @regra-1 @regra-12
  Cenário: A pessoa é a última linha da página, discreta
    Dado que agora é 18/11/2026 às 14h
    Quando a página de Atendimento abre
    Então não há card nem botão de destaque para falar com uma pessoa
    E depois das perguntas frequentes há "Não encontrou o que precisava?" com o link "Prefere falar com uma pessoa?"
    E abaixo diz que pessoas atendem das 8h às 20h e que quem atender já vê o que a pessoa contou
    E não há espera estimada

  @regra-12
  Cenário: Às 23h a linha discreta avisa o retorno
    Dado que agora é 18/11/2026 às 23h
    Quando a página de Atendimento abre
    Então a linha diz que pessoas atendem das 8h às 20h e que o retorno é amanhã a partir das 8h
    E nenhum protocolo aparece

  @regra-12
  Cenário: O protocolo só aparece depois de registrar a demanda
    Dado que agora é 18/11/2026 às 23h
    Quando a pessoa toca em "Prefere falar com uma pessoa?"
    Então o pedido de pessoa é registrado pela página, sem abrir a conversa, e a ação é protocolo
    E a página mostra o protocolo que veio na resposta do servidor e o retorno a partir das 8h
    E o caso passa a aparecer em "Minhas conversas"

  @regra-12
  Esquema do Cenário: Limites do horário vêm do relógio do servidor
    Dado que agora é <momento>
    Quando a página de Atendimento abre
    Então há pessoa agora: <disponivel>

    # Premissa D4: 08h00 inclusive e 20h00 exclusive.
    Exemplos:
      | momento               | disponivel |
      | 18/11/2026 às 07h59   | não        |
      | 18/11/2026 às 08h00   | sim        |
      | 18/11/2026 às 19h59   | sim        |
      | 18/11/2026 às 20h00   | não        |

  @regra-5
  Esquema do Cenário: Segurança 24h, sem fila, a qualquer hora
    Dado que agora é 18/11/2026 às <hora>
    Quando a pessoa toca em "Falar com a segurança agora"
    Então o pedido é registrado pela página, sem abrir a conversa
    E a ação é seguranca_imediata, com prioridade de golpe na fila
    E a página mostra o protocolo e os passos da KB-020

    Exemplos:
      | hora  |
      | 14h00 |
      | 23h00 |

  @regra-5
  Cenário: Relato direto de golpe interrompe o fluxo
    Quando o cliente escreve "fui vítima de golpe, o que eu faço?"
    Então a ação é seguranca_imediata
    Mas "Como sei se uma ligação ou mensagem é golpe?" continua uma pergunta que o agente responde com fonte

  @regra-4
  Cenário: Onde investir vai ao especialista
    Quando a pessoa toca em "Quer saber onde investir?"
    Então o pedido de especialista é registrado pela página, sem abrir a conversa
    E a ação é encaminhar_especialista, e a página mostra o protocolo
    E a linha mostra a fonte que a busca na base achou para a pergunta (KB-029 nos dados)

  @regra-9
  Cenário: Perguntas frequentes com a fonte da base atual
    Quando a página de Atendimento abre
    Então há três perguntas frequentes, cada uma com "Fonte: {artigo}" resolvida pela busca na base
    E "Quando cai meu resgate?" mostra a fonte KB-006
    E nenhuma mostra a KB-007, que é a versão antiga
    Quando a pessoa toca em uma pergunta
    Então o artigo da base abre na própria página, com a mesma fonte
    E a conversa não abre

  Cenário: Pergunte à Kaki é o único caminho para a conversa
    Quando a pessoa escreve uma dúvida no campo e envia
    Então a conversa abre e envia a dúvida
    E as sugestões do card são as mesmas do chat, montadas pelo servidor para o perfil

  Cenário: Minhas conversas só aparece com casos
    Dado que a pessoa ainda não tem casos
    Quando a página de Atendimento abre
    Então "Minhas conversas" não aparece
    Quando a pessoa tem um caso resolvido e um aberto
    Então os dois aparecem com protocolo, motivo e data
    E o resolvido tem o selo "Respondido" e o aberto "Em andamento"

  @regra-10
  Cenário: Só os casos da própria pessoa
    Dado que há casos de outros clientes na fila
    Quando a página de Atendimento abre
    Então só aparecem os casos de C-0001

  Cenário: O que fica de fora neste corte
    Quando a página de Atendimento abre
    Então não há "Bloquear meu acesso", "Fazer uma reclamação" nem "Encerrar minha conta"
