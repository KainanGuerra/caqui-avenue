# DECISIONS

Registro das decisões deste projeto, na ordem em que foram tomadas. Cada entrada tem: **Contexto**, **Alternativas consideradas**, **Escolha**, **Por quê** e **O que reabriria**. Entradas não são renumeradas; mudanças de rumo viram uma nova entrada que referencia a anterior.

---

## D1. Adotar o style-guide do desafio-tecnico como baseline

- **Contexto:** O Hands On pede spec antes de código e uma solução publicada no mesmo dia. Já tenho um conjunto de convenções escrito e usado no desafio-tecnico.
- **Alternativas consideradas:** (a) decidir convenções durante o dia; (b) escrever um guia novo para o case.
- **Escolha:** Copiar `documentation/style-guide/` do desafio-tecnico, sem reescrever, e mapear em `documentation/WORKING_STYLE.md` o que realmente pratico.
- **Por quê:** Um critério já declarado evita discutir estilo no meio de um dia curto.
- **O que reabriria:** Se o guia pedir infraestrutura (Kubernetes, vários serviços) que não cabe em um dia, registrar o corte aqui.

## D2. Escrever o BDD em pt-BR antes do código, mapeável a testes

- **Contexto:** O case tem 12 regras com armadilhas e 40 perguntas de teste. A sala mistura PO, design e devs, e o código ainda não existe.
- **Alternativas consideradas:** (a) ir direto ao código e testar depois; (b) BDD em inglês, como no retail/v2; (c) BDD já executável, com runner e passos.
- **Escolha:** Arquivos `.feature` em Gherkin pt-BR em `documentation/bdd/`, um por tema, com etiquetas `@regra-N` e `@PT-xx`, sem passos de tela e ainda sem runner.
- **Por quê:** Todos leem e validam o comportamento antes de construir; cada cenário liga a uma pergunta de teste e vira teste sem reescrita. Um runner agora seria trabalho antes de haver motor para ligar.
- **O que reabriria:** Se a solução tiver mais de uma interface ou se os passos ficarem repetitivos, avaliar um runner (por exemplo `vitest-cucumber`) e step definitions.

## D3. Diagramas em Mermaid como fonte única, PDF gerado

- **Contexto:** A sala precisa ver a jornada do usuário e a relação com o sistema; o repositório já usa Mermaid, um diagrama por arquivo.
- **Alternativas consideradas:** (a) desenhar os fluxos direto no PDF; (b) ferramenta de desenho externa; (c) Mermaid como fonte e PDF montado a partir dele.
- **Escolha:** Os `.md` de `documentation/diagrams/` guardam o Mermaid; `scripts/pdf/gerar_jornada.py` renderiza com `mermaid-cli` e monta `JORNADA_DO_USUARIO.pdf`, com a tabela de rastreabilidade lida das etiquetas do BDD.
- **Por quê:** Um único lugar para mudar cada fluxo, e o PDF nunca diverge do repositório.
- **O que reabriria:** Diagramas muito largos ficam com texto pequeno no PDF; se atrapalhar a leitura, dividir o diagrama em trechos, como foi feito na política de decisão.

## D4. Premissas de horário: 16h00 conta como "até 16h" e o humano atende de 08h00 a 19h59

- **Contexto:** O case diz "até 16h" para o corte e "das 8h às 20h" para o humano, sem dizer o que acontece nos instantes exatos.
- **Alternativas consideradas:** (a) 16h00 já passou do corte; (b) 16h00 ainda conta; humano até 20h00 inclusive.
- **Escolha:** 16h00 em ponto liquida no mesmo dia (`minutos <= 960`). O humano atende com `08:00 <= hora < 20:00`.
- **Por quê:** "até 16h" lido literalmente inclui as 16h; o horário de atendimento termina quando a hora chega a 20h. Ambos têm teste de borda (`settlement.spec.ts`, `business-hours.spec.ts`).
- **O que reabriria:** Se a Caqui definir outra regra para os instantes exatos, mudar uma constante e os dois testes.

## D5. Convenções de cálculo descobertas nos dados

- **Contexto:** Os valores esperados de PT-10 e PT-11 dependiam de uma convenção que o case não explica.
- **Alternativas consideradas:** poupança por meses completos, por taxa anual equivalente em 365 dias, ou simples; CDI contando só dias úteis depois da aplicação.
- **Escolha:** Poupança = `valor x (1,006^(dias corridos / 30) - 1)`. Saldo do CDB vem de `posicoes.csv` (`saldo_bruto - valor aplicado`); a recontagem do CDI (`(1,11^(1/252) - 1) x pct` por dia útil) bate com o saldo quando os dias úteis são contados **da aplicação à referência, os dois extremos incluídos**. Antes de 01/10/2026 o `calendario.json` não cobre: usa-se dia de semana menos feriados nacionais fixos, sem Corpus Christi.
- **Por quê:** É a única combinação que reproduz ao centavo PT-06, PT-10 e PT-11 e os três saldos conferidos (`savings-compare.spec.ts`). A recontagem serve de teste, não de fonte da resposta ao cliente.
- **O que reabriria:** Posições com `saldo_bruto` que não batam na recontagem, ou um calendário que cubra antes de outubro.

## D6. Só local neste corte: sem URL pública

- **Contexto:** O case pede produto publicado; o grupo decidiu seguir só local por enquanto.
- **Alternativas consideradas:** Render ou Fly (processo único) e Vercel (estado em armazenamento externo).
- **Escolha:** Sem deploy. Sessões e fila em memória (processo único), painel de suporte já com PIN (`ATENDENTE_PIN`) para quando publicar.
- **Por quê:** Menos peças e nenhum dado fora da máquina. Fica registrado como corte do critério "URL pública" do case.
- **O que reabriria:** A decisão de publicar. Hospedagem de processo único serve; Vercel exigiria sessão e fila em um armazenamento compartilhado.

## D7. O código decide, o LLM só redige, e o entendimento com LLM só sobe alerta

- **Contexto:** As armadilhas do case são de cálculo e de roteamento, que não devem depender de um modelo acertar.
- **Alternativas consideradas:** (a) LLM decide a ação e as contas; (b) LLM só redige; (c) LLM redige e também entende, com poder de baixar alertas.
- **Escolha:** (b), com o nível 2 de entendimento (LLM) atrás de `UNDERSTANDING_LLM`, desligado por padrão, que só pode **adicionar** sinais, nunca remover. Qualquer texto do modelo passa por um validador (fatos obrigatórios, frases vetadas, CPF, id alheio); reprovado ou provedor fora do ar, entra o template com os mesmos fatos. O provedor é uma porta (`LlmPort`) com adaptadores Anthropic e compatível com OpenAI.
- **Por quê:** A ação e os fatos são idênticos com qualquer modelo ou sem modelo (`pipeline.spec.ts`). O artigo da base vem de uma busca léxica no código (`kb-search.ts`), não de um RAG vetorial, e o artigo marcado como antigo (KB-007, substituído pelo KB-006) nunca responde (`kb-search.spec.ts`). O texto do cliente vai ao modelo em bloco de dados, e o modelo não tem ferramenta de leitura de dados.
- **O que reabriria:** Medir, com um provedor real, quanto a redação do modelo melhora a leitura e quantas respostas o validador reprova.

## D8. Relógio: dia dos dados, hora real

- **Contexto:** Os dados têm "agora" em 18/11/2026 10h; um relógio real daria datas incoerentes com as posições.
- **Alternativas consideradas:** relógio real; ISO fixo; dia fixo com hora real.
- **Escolha:** `RELOGIO=dados` (padrão): data 18/11/2026 e hora real de São Paulo. Também `real` e um ISO fixo. A tela tem "simular horário" e a API aceita `momento` por mensagem.
- **Por quê:** As contas batem com os dados e a regra de horário funciona ao vivo.
- **O que reabriria:** Uso com dados reais, quando o relógio deve ser o real.

## D9. Detecção de sinais medida contra as 300 conversas, com um limite declarado

- **Contexto:** O léxico de golpe, recomendação, vulnerabilidade e injeção foi escrito olhando as 40 perguntas e 70 não conformidades; precisava de uma medição em dados que ele não escreveu.
- **Alternativas consideradas:** confiar nas 40 perguntas; medir em `conversas.csv`.
- **Escolha:** `pnpm avaliar-sinais`. Resultado: golpe 100% de recall e 100% de precisão; recomendação 100% e 100%; injeção 100% e 83%; vulnerável 42% e 45%. O léxico foi refinado depois de ver os erros, então os 100% são otimistas.
- **Limite:** Nas conversas rotuladas como vulnerável, a marca "(cliente idoso, confuso)" aparece **dentro da fala** como anotação do pacote de dados. Foi removida antes de medir, senão o recall seria inflado por vazamento do rótulo. As mesmas frases comuns ("meu resgate está em processamento desde a semana passada") aparecem rotuladas e não rotuladas: só pelo conteúdo não dá para separar. Por isso a idade de 60 anos ou mais vira **prioridade na fila**, não encaminhamento automático.
- **O que reabriria:** Amostra real rotulada por humanos.

## D10. O painel de suporte fecha o laço com o cliente

- **Contexto:** O case pede que quem recebe o caso veja histórico e protocolo e que o cliente nunca repita a demanda.
- **Escolha:** O caso é aberto pelo pipeline (uma vez por sessão, a gravidade só sobe); o painel ordena a fila (golpe, 60 anos ou mais, demais), mostra motivos, resumo montado pelo código e fontes; o atendente assume, responde e resolve. A fala do atendente entra no histórico da sessão e aparece no chat do cliente por polling; enquanto o caso está assumido, o agente fica em silêncio e as mensagens do cliente vão ao atendente. A espera estimada é **simulada** (3 min por caso à frente, no máximo 35, o pico do case).
- **Por quê:** Mostra a relação entre as duas visões de ponta a ponta e dá ao Jonas contexto sem chamar o supervisor.
- **O que reabriria:** Fila real e canal de voz; o tempo de espera deve vir de dados reais.

## D11. Sugestões de pergunta por perfil, conversa e digitação

- **Contexto:** Uma lista fixa de sugestões servia igual para a Dona Marta e para o Rafael, e não acompanhava a conversa.
- **Alternativas consideradas:** (a) lista fixa; (b) LLM gera as sugestões; (c) regras determinísticas com um conjunto de frases que o motor sabe responder.
- **Escolha:** (c). `server/domain/suggestions.ts` (puro) classifica o cliente (idoso, iniciante, experiente, padrão), personaliza com os produtos da conta, dá bônus pela última ação e intenções da conversa e, enquanto a pessoa digita, filtra e ordena pelo que combina (rota `GET /api/chat/:sessaoId/sugestoes?q=`, com pausa de 250 ms na tela). Sem atendente na conversa; com atendente, nenhuma sugestão.
- **Por quê:** Toda sugestão é uma frase que o motor responde com fonte. Um teste de integração envia cada sugestão possível de todos os 50 clientes e falha se alguma cair em "não entendi" ou "não tenho essa informação"; ele achou uma frase que não funcionava ("Como troco minha senha?").
- **O que reabriria:** Medir quais sugestões as pessoas realmente clicam; só então vale considerar geração por LLM.

## D12. Home montada pelo servidor: em andamento, alocação e avisos

- **Contexto:** A Home do Figma (nó 50:3) pede patrimônio, etapas do resgate em andamento, alocação por classe e alerta de feriado. A regra é que a tela não calcula nada.
- **Alternativas consideradas:** (a) a tela soma e compara datas a partir de `posicoes` e `operacoes`; (b) um endpoint novo por bloco; (c) a mesma `ContaVista` de `GET /api/chat/:sessaoId/conta` passa a trazer tudo pronto, montado por funções puras.
- **Escolha:** (c). `server/domain/account-view.ts` ganha `operacoesEmAndamento`, `alocarPorClasse` e `avisosDeFeriado`, e `montarConta` recebe o calendário e o "hoje" do mesmo relógio do chat (D8), injetados pelo container. Detalhes:
  - **Em andamento:** só status `em_processamento`. As datas saem de `calcularLiquidacao` (corte das 16h e dias úteis), nunca da coluna `liquidacao_prevista`. A etapa atual é a primeira de hoje em diante; se todas passaram e a operação segue em processamento, a última continua atual, para a tela não dar como concluído o que não está. Em aplicação, a KB-006 só garante a liquidação no dia-base de CDB e LCI com liquidez diária; nos demais produtos a Home mostra o dia-base e não inventa data.
  - **Alocação:** duas classes, sobre o saldo bruto, com percentuais inteiros que somam 100 (maior resto). Ações e o Caqui Multimercado FIF contam como renda variável, porque a cota pode cair (KB-014); o resto é renda fixa.
  - **Avisos:** feriados do calendário entre amanhã e o 5º dia útil, dizendo a partir de quando conta o pedido feito na véspera depois das 16h. Feriado em fim de semana não muda prazo e fica de fora.
  - **Tela:** só formata e escolhe a frase ("cai hoje" ou "cai em") para a data que chegou. "Ocultar valores" é estado só de interface. Sem seletor de período (não há histórico) e sem Investir e Transferir (não existem neste corte; revisto na D15).
- **Por quê:** A data do card é a mesma que a Kaki responde na conversa, porque as duas usam o mesmo cálculo e o mesmo relógio. Cada regra nova tem teste em `account-view.spec.ts` (Dona Marta OP-10005, fundo com cotização, operação atrasada, aplicação, alocação de Marta e Rafael, feriado de 20/11 e de 15/11 no domingo).
- **O que reabriria:** Uma terceira classe na alocação (por exemplo, multimercado à parte), prazo de aplicação em fundo publicado na base, ou histórico de saldo, que permitiria o seletor de período.

## D13. Página de Atendimento: estado pelo servidor, botões só enviam intenção

- **Contexto:** O Figma (nós 51:169 às 14h e 51:332 às 23h) mostra uma página com dois estados: pessoa disponível ou fora do horário. Ela tem perguntas frequentes com fonte, os casos da pessoa e atalhos para segurança e especialista. A tela não pode decidir horário, fonte nem protocolo.
- **Alternativas consideradas:** (a) a tela lê o relógio do navegador e guarda as perguntas frequentes com o código KB; (b) um endpoint por bloco; (c) um endpoint `GET /api/chat/:sessaoId/atendimento` montado por funções puras, e cada botão envia uma frase à conversa que já existe.
- **Escolha:** (c). `server/domain/support-view.ts` monta `{ humanoDisponivel, horario, retorno, faq, especialista, casos }` a partir de `pipeline.agora()`, da base e dos casos em memória. Detalhes:
  - **Horário:** `humanoDisponivel` e `descreverRetorno` (D4). O campo `horario` ("das 8h às 20h") sai de `descreverHorario`, das mesmas constantes, para o texto não divergir da regra. `retorno` é nulo quando há pessoa agora.
  - **Perguntas frequentes:** três fixas no domínio, cada uma com a fala do cliente e o assunto buscado na base. "Quando cai meu resgate?" não tem palavra em comum com a KB-006, então a fonte é achada pelo assunto ("prazos de resgate e de aplicação"); a busca já descarta a KB-007 antiga. O texto "Bruto e líquido: qual a diferença?" do Figma virou "Qual a diferença entre rentabilidade bruta e líquida?", porque a conversa não respondia o primeiro. Um teste envia cada pergunta ao pipeline e exige a mesma fonte que a página mostra (`server/application/page-chat-consistency.spec.ts`, D16).
  - **Especialista:** a fonte de "Quer saber onde investir?" também vem da busca (KB-029 existe nos dados); sem ela a linha fica sem código.
  - **Casos:** só os do cliente da sessão (regra 10), do mais novo ao mais antigo, com o motivo de `rotuloMotivo`. Resolvido aparece como "Respondido"; aberto ou assumido, como "Em andamento". Sem casos, a seção não aparece.
  - **Segurança:** o botão envia "Preciso falar com a segurança agora: acho que estou sofrendo um golpe.". Para essa frase virar `seguranca_imediata` (regra 5), entrou o sinal `GOLPE_RELATO`: relato em primeira pessoa ou pedido da segurança. A pergunta hipotética ("Como sei se uma ligação ou mensagem é golpe?") continua informativa. `pnpm avaliar-sinais` segue com golpe em 100% de recall e 100% de precisão (D9).
  - **Fora do horário:** "Registrar minha demanda" envia o pedido de pessoa sem sair da página; o pipeline abre o caso com `protocolo` e a página mostra o protocolo que veio na resposta, nunca antes. Para isso `useChat().enviar` passou a devolver a resposta do servidor.
  - **Fora do corte:** espera estimada (não há dado real; a do painel é simulada, D10), "Bloquear meu acesso", "Fazer uma reclamação" e "Encerrar minha conta". A Home passa a levar "Falar com uma pessoa" para esta página.
  - **Revisto na D16:** segurança, pessoa e especialista deixaram de enviar frases à conversa e são registrados na própria página; as perguntas frequentes abrem a resposta ali mesmo. A barra de abas entrou.
  - **Revisto na D17:** o card "Uma pessoa pode te atender agora" saiu; a pessoa ficou numa linha discreta no fim da página.
- **Por quê:** O estado, as fontes e o protocolo têm uma única origem (o servidor), e cada botão passa pela mesma política da conversa.
- **O que reabriria:** Espera estimada com dados reais de fila.

## D14. Card "Em andamento" recolhido por padrão

- **Contexto:** Na Home (D12), o card de resgate em processamento ocupava a primeira dobra inteira, com fundo marfim, badge, etapas e fonte. Ele empurrava o patrimônio para baixo e pesava mais que a própria visão geral.
- **Alternativas consideradas:** (a) manter o card aberto, como no Figma; (b) tirar as etapas da Home e deixar só a conversa; (c) recolher por padrão e abrir ao tocar.
- **Escolha:** (c), com `UCollapsible`. Recolhido, o card mostra a frase com a data ("Seu resgate de R$ 40.000,00 cai hoje, 18/11") e a etapa atual; aberto, mostra as etapas, a fonte e "Ver detalhes do resgate". A superfície passa a ser `bg-default` com borda; o marfim fica só no ícone.
- **Por quê:** A Dona Marta quer certeza a cada passo, e a resposta a "quando cai" e "onde está" continua visível sem tocar. O detalhe fica a um toque, com `aria-expanded` e o estado dito em texto, não só pela cor. Os dados e a frase continuam vindo do servidor; só a apresentação mudou.
- **O que reabriria:** Teste com pessoas 60+ mostrando que o card recolhido passa despercebido. Nesse caso, ele abre por padrão quando a liquidação for hoje.

## D15. Ações da Home: Investir, Resgatar, Transferir e Atendimento, todas pela conversa

> Substituída pela D16: nenhuma ação leva mais à conversa, e "Transferir" saiu.

- **Contexto:** A D12 deixou só "Resgatar" e "Falar com uma pessoa" porque não há fluxo de aplicação nem de transferência. A Camila (41, herdou e nunca investiu) "vai pedir recomendação" e procura onde começar; o Figma tem os quatro cards.
- **Alternativas consideradas:** (a) manter dois cards; (b) cards que abrem telas de aplicação e transferência, que não existem; (c) quatro cards em que os novos enviam uma frase à conversa e o pipeline decide.
- **Escolha:** (c). "Investir" envia "Quero começar a investir. Onde devo investir?" e vira `encaminhar_especialista` (regra 4, KB-029, com protocolo). "Transferir" envia "Como transfiro meu saldo para minha conta em outro banco?" e responde pela KB-018 (mesma titularidade, Pix). "Falar com uma pessoa" vira "Atendimento" e abre a página da D13. O subtítulo traz o horário de `GET /api/chat/:sessaoId`, que ganhou o campo `horario` (de `descreverHorario`, D4).
- **Por quê:** Nenhum card promete o que não existe. O subtítulo "Escolha valor e produto" do Figma virou "Fale com um especialista", e o caminho da Camila termina em quem pode orientar. `pedidos.spec.ts` passa as duas frases pelo pipeline e falha se a ação ou a fonte mudar. "Falar com uma pessoa" continua visível no card de "Próximos passos".
- **Limite encontrado:** "Como faço uma transferência?" digitado na conversa cai em "não tenho essa informação", porque a busca não liga "transferência" à KB-018 sem outras palavras ("saldo", "conta", "banco"). O card usa uma frase que funciona; a busca não foi mexida aqui.
- **O que reabriria:** Fluxo real de aplicação ou de transferência, que tiraria os cards da conversa. Também um ajuste na busca para perguntas curtas de transferência, com teste em `kb-search.spec.ts`. Também o "simular horário" da conversa refletido aqui (hoje a página usa só o relógio do servidor, D8) e uma tela para reabrir conversas antigas pelo protocolo.

## D16. A conversa é a última alternativa: rodapé de abas, páginas que respondem e pedidos registrados na página

- **Contexto:** Na D15 as ações da Home abriam a conversa com uma frase pronta. A orientação passou a ser outra: nenhuma ação leva ao chat, que fica como último recurso. O Figma (nó 50:202) traz um rodapé com Início, Carteira, Investir, Aprender e Atendimento, e o card "Falar com uma pessoa" da Home sai.
- **Alternativas consideradas:** (a) manter as frases e só trocar o destino dos cards; (b) abas que levam a telas vazias ou "em breve"; (c) páginas simples com dados reais, e os pedidos de pessoa, especialista e segurança registrados na própria página, pela mesma regra da conversa.
- **Escolha:** (c). Detalhes:
  - **Navegação:** `ITENS_MENU` ganhou Carteira, Investir e Aprender e perdeu "Conversar com a Kaki". O campo `tambem` põe `/conversa` sob Atendimento: a aba fica marcada na conversa e a proteção por papel continua (o suporte não abre `/conversa`). No celular o cliente vê `BottomNav.vue` no lugar da gaveta e da faixa informativa; no desktop o menu lateral mostra os mesmos itens. O selo de caso aberto passou para Atendimento.
  - **Carteira:** posições e operações da conta. Cada posição traz `resgate: PrazoResgate` de `prazoDeResgate`, que chama `calcularLiquidacao` com o relógio do servidor: cai em tal dia, em carência até tal dia ou só no vencimento, sempre com a KB-006. A coluna `liquidacao_prevista` saiu da tela (a linha da operação mostrava "previsto"), porque contradizia a regra 1.
  - **Investir:** `montarInvestir` lista os produtos de `taxas.json` na ordem dos dados, sem ranking (ordenar por rentabilidade já seria indicar), com rentabilidade, resgate e imposto escritos a partir dos mesmos campos do cálculo de prazo. Cada produto abre o artigo que explica o tipo (KB-003, 011, 014, 015, 016). Não há aplicação: "Pedir um especialista" registra o pedido (regra 4, KB-029).
  - **Aprender:** `montarAprender` agrupa artigos atuais da base em quatro temas fixos; a KB-007 nunca sai, nem pedida pelo id. O artigo chega em blocos (`kb-reading.ts`: parágrafo, lista, tabela), e a tela não usa `v-html`.
  - **Pedidos na página:** `POST /api/chat/:sessaoId/pedidos` com `tipo` (pessoa, especialista, segurança) e `pagina` (Atendimento, Investir), validados por Zod. `decisaoDoPedido` (puro) escolhe a ação pelo relógio: segurança é `seguranca_imediata` a qualquer hora; pessoa é `encaminhar_humano` no horário e `protocolo` fora dele (D4). `PedidoService` abre ou atualiza o mesmo caso da sessão (`CaseService`) e grava a fala e a resposta no histórico, para quem abrir a conversa ver o pedido e o protocolo. A segurança devolve os passos da KB-020.
  - **Atendimento:** as perguntas frequentes abrem o artigo da base ali mesmo. Segurança, pessoa e especialista registram o pedido e mostram o texto com o protocolo que veio do servidor. "Pergunte à Kaki" é o único botão que começa uma conversa; "Abrir conversa" só aparece para acompanhar um pedido de pessoa já aceito.
  - **Home:** três ações (Investir para `/investir`, Resgatar para `/carteira` e Atendimento), "Ver detalhes do resgate" para `/carteira`, e o card educativo leva a Aprender. "Transferir" saiu, porque não há fluxo. `app/utils/pedidos.ts` foi apagado.
- **Por quê:** O cliente acha a resposta onde ela está (o prazo na Carteira, o artigo na página) e não depende do entendimento do chat para o básico. Os pedidos continuam passando pela mesma política: `page-chat-consistency.spec.ts` exige que a página e a conversa deem a mesma ação para pessoa (14h e 23h), segurança e especialista, e que cada pergunta frequente tenha na conversa a mesma fonte que abre na página. O texto do pedido é montado no servidor com nomes de página conhecidos, nunca com texto livre do navegador.
- **O que reabriria:** Fluxos reais de aplicação, resgate ou transferência, que dariam botões de ação à Carteira e ao Investir. Uma aba própria para a conversa, se uso real mostrar que o cliente não a encontra dentro do Atendimento. Agendamento com data e hora do especialista, que hoje é só o encaminhamento com protocolo.
- **Revisto na D17:** o pedido de pessoa saiu do card do Atendimento e virou uma linha discreta no fim da página.

## D17. A pessoa aparece quando não há mais alternativa

- **Contexto:** Depois da D16, falar com uma pessoa ainda tinha três atalhos fixos: a sugestão "Quero falar com uma pessoa" no chat, o card "Uma pessoa pode te atender agora" no Atendimento e o botão no cabeçalho da conversa. A orientação é que a sugestão de uma pessoa venha só quando o cliente não tiver mais alternativa. Ao mesmo tempo, a regra 1 do case pede a saída para humano visível em qualquer passo, das 8h às 20h, e a política já escala sozinha quando a Kaki não resolve (regra 8).
- **Alternativas consideradas:** (a) tirar todos os atalhos e deixar só a escalada automática da política; (b) manter os três atalhos com menos destaque; (c) tirar os três atalhos, oferecer a pessoa como botão dentro da resposta em que a Kaki diz que não resolve, e deixar uma linha discreta no fim do Atendimento.
- **Escolha:** (c). Detalhes:
  - **Sugestões:** a candidata "Quero falar com uma pessoa" saiu de `suggestions.ts`. Um teste percorre perfis, últimas ações e digitações ("pessoa", "atendente", "humano") e falha se alguma sugestão pedir uma pessoa. Escrever o pedido continua valendo: os sinais de pedido de humano (KB-025) não mudaram.
  - **Oferta na resposta:** `Plano` ganhou `oferecerHumano`, marcado em `planoNaoSei` (fora da base) e em `planoNaoEntendi` quando a política já oferece humano (segunda resposta sem entender). O pipeline copia a marca para a `Mensagem` do agente só quando a ação é `responder`; encaminhamento e protocolo já chamaram a pessoa. A conversa mostra "Falar com uma pessoa" (fora do horário, "Registrar minha demanda") abaixo dessa resposta, só se ela for a última e não houver caso aberto. O botão envia a mesma frase que o cliente escreveria, e a política decide como sempre.
  - **Cinco passos e terceira mensagem sem entender:** continuam escalando sozinhos pela política, sem botão.
  - **Atendimento:** o card da pessoa saiu e o especialista virou uma seção própria. Depois das perguntas frequentes fica "Não encontrou o que precisava? Prefere falar com uma pessoa?", com o horário e o retorno em letra pequena. O pedido segue pela D16 (`POST /api/chat/:sessaoId/pedidos`).
  - **Conversa:** o botão do cabeçalho saiu; o selo "Pessoa disponível agora" ou "Pessoa volta às 8h" fica, como informação.
  - **Textos:** a saudação perdeu "Se preferir falar com uma pessoa, é só pedir."; o subtítulo do Atendimento perdeu "ou fale com uma pessoa". O cancelamento continua dizendo, em texto, que uma pessoa pode ajudar, porque ali a saída humana faz parte da regra 7.
- **Por quê:** O cliente tenta primeiro o que resolve sozinho, e a pessoa aparece no momento em que a Kaki admite que não resolve, sem ele ter de procurar. A linha discreta mantém a regra 1 e o Decreto do SAC (saída para humano sem depender do robô) sem disputar atenção com as respostas. O que decide oferecer a pessoa é o servidor; a tela só exibe a marca.
- **O que reabriria:** Uso real mostrando que clientes vulneráveis não acham a linha discreta. Nesse caso, ela sobe para perto do "Pergunte à Kaki" quando o perfil for 60+. Também uma regra de negócio que peça a oferta em outros momentos (por exemplo, depois de uma resposta marcada como "não resolveu").

## D18. Dados fictícios dentro do repositório

- **Contexto:** Os dados do case ficavam só em `caqui-invest/dados`, que é outro repositório (ignorado aqui). Quem clonava este projeto precisava clonar o outro e colocá-lo na pasta certa, ou a tela e os testes não subiam.
- **Alternativas consideradas:** (a) continuar exigindo o `caqui-invest/` ao lado; (b) submódulo git; (c) copiar `caqui-invest/dados` para `data/` na raiz e versionar.
- **Escolha:** (c). `DADOS_DIR` passa a ter `./data` como padrão (env, testes, `eval-signals`, compose). Os dados continuam somente leitura e fora da imagem (`.dockerignore`): o compose os monta em `/dados`. O case (`CASE.md`) e o checador seguem em `caqui-invest/`, só para consulta.
- **Por quê:** Um clone só basta para rodar e testar. Os dados são sintéticos e pequenos, então versioná-los não expõe nada nem pesa. O submódulo exigiria acesso e um passo a mais para cada pessoa do grupo.
- **O que reabriria:** Uma nova versão dos dados no `caqui-invest`: a cópia precisa ser atualizada à mão (`rm -rf data && cp -R ../caqui-invest/dados ./data`), e os testes dizem se algo mudou.
