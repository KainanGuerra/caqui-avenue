# language: pt
@transversal
Funcionalidade: Painel do gerente
  O gerente (Helena) acompanha a operação da Kaki desde que o servidor subiu: volume de
  atendimentos, taxa de resolução automática, conversas escalonadas, qualidade das respostas,
  custo e latência. Tudo é calculado no servidor; a tela só exibe. Decisão D19.

  Contexto:
    Dado que agora é 18/11/2026 às 14h

  Cenário: O gerente entra com PIN próprio
    Dado que GERENTE_PIN está definido
    Quando alguém escolhe "Sou gerente" e digita o PIN certo
    Então a tela mostra o painel gerencial

  Cenário: O PIN do suporte não abre o painel e o do gerente não abre a fila
    Dado que ATENDENTE_PIN e GERENTE_PIN estão definidos
    Quando o atendente pede o painel com a própria sessão
    Então o servidor recusa o acesso
    E quando o gerente pede a fila de casos com a própria sessão
    Então o servidor recusa o acesso

  Cenário: Sem atendimento ainda, o painel diz que está vazio
    Dado que o servidor acabou de subir
    Quando o gerente abre o painel
    Então vê 0 conversas e "—" nos percentuais, e não 0%
    E um aviso de que ainda não houve atendimento

  Cenário: Volume e resolução automática
    Dado que C-0002 perguntou o prazo do resgate e o horário de corte
    E que C-0001 disse "ligaram da segurança pedindo minha senha"
    Quando o gerente abre o painel
    Então o painel mostra 2 conversas e 3 mensagens respondidas
    E a resolução automática é 50%, porque uma das duas conversas virou caso

  Cenário: Conversa escalonada aparece com protocolo e motivo
    Dado que C-0001 disse "ligaram da segurança pedindo minha senha"
    Quando o gerente abre o painel
    Então a lista de escalonadas traz o protocolo, "Marta Siqueira", "Segurança imediata"
    E o motivo "pedido de senha, código ou token"

  Cenário: Com muitos casos, a lista vem em páginas
    Dado 25 casos escalonados
    Quando o gerente abre o painel
    Então a lista mostra os 10 mais novos e "Página 1 de 3"
    E o servidor manda só esses 10, e não os 25

  Cenário: Filtrar os casos por status
    Dado casos em aberto, com atendente e resolvidos
    Quando o gerente escolhe "Resolvidos"
    Então a lista mostra só os resolvidos, a partir da primeira página

  Cenário: Conversa que travou é contada à parte
    Dado uma conversa escalonada pelo limite de cinco passos
    E outra escalonada por duas mensagens sem entendimento
    Quando o gerente abre o painel
    Então "travadas" mostra 2

  Cenário: Resposta da IA barrada entra na qualidade
    Dado que o modelo reescreveu a resposta do prazo sem a data
    Quando o gerente abre o painel
    Então "Respostas da IA barradas" mostra 100%
    E o cliente recebeu o texto padrão, com a data

  Cenário: Erro do provedor não conta como resposta barrada
    Dado que o provedor da IA não respondeu a tempo
    Quando o gerente abre o painel
    Então "Respostas da IA barradas" mostra "—"

  Cenário: Sentimento estimado por conversa, só no painel
    Dado que C-0002 só perguntou o horário de corte e foi respondido com fonte
    E que C-0001 disse "ligaram da segurança pedindo minha senha"
    E que C-0003 disse "quero reclamar do atendimento"
    Quando o gerente abre o painel
    Então o sentimento estimado mostra 1 satisfeito, 1 preocupado e 1 insatisfeito
    E cada categoria mostra o critério que a define

  Cenário: A regra mais forte vence quando a conversa tem mais de um sinal
    Dado uma conversa com sinal de cliente vulnerável e uma reclamação
    Quando o gerente abre o painel
    Então a conversa conta como preocupado, e não como insatisfeito

  Cenário: O sentimento não é gravado por cliente
    Quando o gerente abre o painel
    Então o sentimento aparece só somado, sem nome de cliente
    E nenhum sentimento é guardado no caso, na sessão ou no histórico

  Cenário: No modo template não há custo
    Dado que LLM_PROVIDER é template
    Quando o gerente abre o painel
    Então chamadas ao LLM, tokens e custo aparecem zerados
    E o card de respostas da IA barradas diz que a IA está desligada

  Cenário: Custo estimado pelo tamanho do texto
    Dado que o preço é R$ 15 por milhão de tokens de entrada e R$ 75 de saída
    E que as chamadas somaram 4.000.000 de caracteres de entrada e 400.000 de saída
    Quando o gerente abre o painel
    Então os tokens são 1.000.000 de entrada e 100.000 de saída
    E o custo estimado é R$ 22,50

  Cenário: O painel não mostra o texto das conversas
    Quando o gerente abre o painel
    Então vê contagens, ações, motivos e protocolos
    E não vê nenhuma mensagem do cliente nem CPF
