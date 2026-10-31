# language: pt
Funcionalidade: Páginas do cliente e rodapé, com a conversa como última alternativa
  O cliente navega por Início, Carteira, Investir, Aprender e Atendimento (Figma 50:202). Nenhum botão dessas páginas
  abre a conversa: cada um mostra a resposta da base, o prazo calculado pelo servidor ou registra o pedido ali mesmo,
  com protocolo. Só "Pergunte à Kaki", na página de Atendimento, abre a conversa. A tela só exibe e envia intenção.

  Contexto:
    Dado que agora é 18/11/2026 às 10h
    E o cliente da sessão é C-0001

  Cenário: Rodapé com as cinco abas no celular
    Dado que a tela tem 375px de largura
    Quando o cliente abre qualquer página dele
    Então o rodapé mostra "Início", "Carteira", "Investir", "Aprender" e "Atendimento"
    E a aba da página aberta fica marcada, com aria-current="page"
    E a conversa conta como parte de "Atendimento"
    E não há rolagem horizontal

  Cenário: A conversa continua protegida, mas sai do menu
    Quando a equipe de suporte tenta abrir /conversa, /carteira, /investir ou /aprender
    Então volta para a fila
    E o menu do cliente não tem "Conversar com a Kaki"

  @regra-1
  Cenário: Carteira mostra quando cai o resgate de cada posição
    Quando o cliente abre a Carteira
    Então cada posição diz quando o dinheiro cai se o resgate for pedido agora
    E a data vem do corte das 16h e dos dias úteis, com fonte KB-006
    E uma posição em carência diz quando a carência acaba
    E uma posição sem liquidez diária diz que o valor sai no vencimento
    E nenhuma data vem da coluna liquidacao_prevista

  @regra-1
  Cenário: Pedido depois das 16h conta a partir do próximo dia útil
    Dado que agora é 18/11/2026 às 17h
    Quando o cliente abre a Carteira
    Então o CDB com liquidez diária diz que cai no próximo dia útil

  @regra-10
  Cenário: Carteira só com dados do cliente da sessão
    Quando o cliente abre a Carteira
    Então só aparecem posições e operações de C-0001
    E nenhum CPF vai para a tela

  @regra-4
  Cenário: Investir explica os produtos e não recomenda
    Quando o cliente abre Investir
    Então os produtos aparecem na ordem dos dados, com rentabilidade, liquidez e imposto
    E cada um abre o artigo da base que o explica, com a fonte
    E a página traz o selo "Conteúdo educativo, não é recomendação"
    E nenhum produto é chamado de melhor

  @regra-4
  Cenário: Pedir um especialista sem sair da página
    Quando o cliente toca em "Pedir um especialista"
    Então o caso é aberto com a ação encaminhar_especialista e fonte KB-029
    E a página mostra o protocolo que veio na resposta do servidor
    E a conversa não abre

  @regra-9
  Cenário: Aprender mostra os artigos atuais da base
    Quando o cliente abre Aprender
    Então os artigos aparecem por tema, cada um com o código e a data de revisão
    E a KB-007, que é a versão antiga, nunca aparece

  @regra-5
  Esquema do Cenário: Segurança sem sair da página, a qualquer hora
    Dado que agora é 18/11/2026 às <hora>
    Quando o cliente toca em "Falar com a segurança agora" na página de Atendimento
    Então o caso é aberto com a ação seguranca_imediata e prioridade de golpe
    E a página mostra o protocolo e os passos da KB-020
    E a conversa não abre

    Exemplos:
      | hora  |
      | 14h00 |
      | 23h00 |

  @regra-12
  Esquema do Cenário: A linha discreta do fim do Atendimento registra o pedido de pessoa na página
    Dado que agora é 18/11/2026 às <hora>
    Quando o cliente toca em "Prefere falar com uma pessoa?", no fim da página, depois das perguntas frequentes
    Então o caso é aberto com a ação <acao>
    E a página mostra o protocolo que veio na resposta do servidor

    Exemplos:
      | hora  | acao              |
      | 14h00 | encaminhar_humano |
      | 23h00 | protocolo         |

  @regra-9
  Cenário: Pergunta frequente abre a resposta da base ali mesmo
    Quando o cliente toca em "Quando cai meu resgate?"
    Então o artigo KB-006 abre na própria página
    E a conversa não abre

  Cenário: A conversa é a última alternativa
    Quando o cliente escreve no campo "Pergunte à Kaki" e envia
    Então a conversa abre e envia a dúvida
    E esse é o único caminho para começar uma conversa
    E com um protocolo em andamento, "Abrir conversa" leva à conversa para acompanhar a resposta da pessoa

  Cenário: Pedido feito pela página aparece no histórico da conversa
    Dado que o cliente pediu um especialista pela página de Investir
    Quando ele abre a conversa depois
    Então o pedido e o protocolo já estão no histórico
    E quem atende vê o caso sem o cliente repetir
