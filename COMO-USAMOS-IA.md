## Como usamos IA

### Ferramentas

Claude Code (modelo Claude Sonnet 5.5) em todas as etapas: leitura do case e dos dados, spec, BDD, diagramas, código, testes e documentação. Chrome automatizado (extensão Claude in Chrome) para percorrer as duas telas. Nenhum modelo é chamado em tempo de execução por padrão: o modo `template` funciona sem LLM; os adaptadores Anthropic e compatível com OpenAI existem, mas não foram exercitados com um provedor real.

### Harness

- [`CLAUDE.md`](CLAUDE.md): regras duras e estilo de trabalho; [`documentation/WORKING_STYLE.md`](documentation/WORKING_STYLE.md) e [`documentation/style-guide/`](documentation/style-guide/README.md).
- BDD escrito antes do código, com etiquetas `@regra-N` e `@PT-xx` ligando cada cenário às perguntas de teste.
- Modo de planejamento do Claude Code: cada etapa foi planejada e aprovada antes de executar.
- Subagentes de exploração (somente leitura) para mapear o estilo de trabalho a partir de três projetos.
- Navegador automatizado para testar a visão do cliente e a do suporte.

### Verificado na mão

- As 40 respostas do `checar_respostas.py` foram **lidas uma a uma**, não só conferidas pelas pistas; a leitura achou dois defeitos que as pistas deixaram passar (a conta de 7,2% ao ano "composto" e um prazo de ações misturado a uma pergunta sobre criptoativos).
- A convenção de cálculo da poupança e do CDI foi descoberta por recontagem contra `posicoes.csv`, não suposta.
- Recall e precisão da detecção de sinais medidos nas 300 conversas (`pnpm avaliar-sinais`), com o vazamento de rótulo removido antes de medir.
- Logs inspecionados: sem CPF cru e sem texto de conversa.
- Interface percorrida no navegador: golpe, protocolo, painel, resposta do atendente.

### Onde a IA errou

Ver [`AI_LOG.md`](AI_LOG.md). O caso principal: a primeira versão da busca na base devolvia "O que é um CDB" para a pergunta "qual o horário de corte?", porque o termo comum "CDB" no título pesava mais que o termo raro "corte". Notamos pelo teste do PT-31; a correção foi ponderar pela raridade do termo (idf ao quadrado) e passou a exigir dois termos em comum nas perguntas livres.
