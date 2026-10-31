# BDD do agente de atendimento

Especificação do comportamento esperado, escrita **antes do código**, em Gherkin pt-BR (`# language: pt`). É o contrato que a SPEC, os testes e os diagramas compartilham. Ainda não há runner: cada cenário foi escrito para virar teste sem reescrita.

A fonte das regras é `../../caqui-invest/CASE.md` (pasta só de consulta) e os valores esperados vêm de `../../data/perguntas_teste.jsonl`, de `taxas.json` e de `calendario.json`. Nenhuma data ou alíquota é inventada: os cenários derivados do calendário dizem isso no cabeçalho do exemplo.

## Convenções

- **Etiquetas:** `@regra-N` liga o cenário à regra do case; `@PT-xx` liga à pergunta de teste de mesmo id; `@transversal` marca o que vale para todas as regras (sessão, política, entrega, redação); `@premissa` marca o que depende de uma decisão ainda aberta e precisa ser confirmado na SPEC antes de virar teste.
- **Ações** seguem o vocabulário do case: `responder`, `encaminhar_humano`, `encaminhar_especialista`, `seguranca_imediata`, `protocolo`, `recusar`.
- **Relógio e cliente** ficam no `Contexto` ou no `Dado` ("agora é 18/11/2026 às 10h", "o cliente da sessão é C-0001"). Não há passos de tela, salvo em `home.feature`, `atendimento.feature` e `paginas-do-cliente.feature`, que descrevem páginas do cliente: lá os passos de tela só exibem o que o servidor devolveu ou enviam a intenção ao servidor.
- **Falas do cliente** ficam literais, entre aspas, em português.
- Além dos cenários espelhados nas 40 perguntas, cada regra tem **variações adversariais** (paráfrase, caixa alta, acento faltando, insistência).

## Cobertura

| Arquivo | Funcionalidade | Regras | Perguntas de teste | Cenários |
|---|---|---|---|---:|
| [`acesso-e-papeis.feature`](acesso-e-papeis.feature) | Acesso simulado e papéis | transversal | sem PT (variações e regras transversais) | 9 |
| [`atendimento.feature`](atendimento.feature) | Página de Atendimento do cliente | 1, 4, 5, 9, 10, 12 | sem PT (variações e regras transversais) | 12 |
| [`cliente-vulneravel.feature`](cliente-vulneravel.feature) | Cliente vulnerável tem prioridade humana | 6 | PT-22, PT-23, PT-24 | 6 |
| [`comparacao-poupanca.feature`](comparacao-poupanca.feature) | Comparação de rendimento com a poupança | 3 | PT-10, PT-11, PT-12 | 5 |
| [`dados-pessoais.feature`](dados-pessoais.feature) | Dados pessoais protegidos | 10 | PT-32, PT-33 | 6 |
| [`entrega-ao-humano.feature`](entrega-ao-humano.feature) | Entrega ao humano sem repetição | transversal | sem PT (variações e regras transversais) | 14 |
| [`golpe.feature`](golpe.feature) | Suspeita de golpe interrompe o fluxo | 5 | PT-18, PT-19, PT-20, PT-21 | 5 |
| [`home.feature`](home.feature) | Home do cliente | 1, 4, 10 | sem PT (variações e regras transversais) | 14 |
| [`horario-de-atendimento.feature`](horario-de-atendimento.feature) | Horário de atendimento humano | 12 | PT-37, PT-38 | 5 |
| [`imposto-de-renda.feature`](imposto-de-renda.feature) | Imposto de renda regressivo na renda fixa | 2 | PT-06, PT-07, PT-08, PT-09 | 7 |
| [`instrucao-escondida.feature`](instrucao-escondida.feature) | Instrução escondida na conversa | 11 | PT-34, PT-35, PT-36 | 5 |
| [`liquidacao.feature`](liquidacao.feature) | Liquidação e prazos de resgate | 1 | PT-01, PT-02, PT-03, PT-04, PT-05 | 9 |
| [`nao-sabe.feature`](nao-sabe.feature) | Não sabe, diz que não sabe | 9 | PT-29, PT-30, PT-31, PT-39, PT-40 | 9 |
| [`paginas-do-cliente.feature`](paginas-do-cliente.feature) | Páginas do cliente e rodapé, com a conversa como última alternativa | 1, 4, 5, 9, 10, 12 | sem PT (variações e regras transversais) | 13 |
| [`painel-do-atendente.feature`](painel-do-atendente.feature) | Painel do atendente | transversal | sem PT (variações e regras transversais) | 8 |
| [`painel-do-gerente.feature`](painel-do-gerente.feature) | Painel do gerente | transversal | sem PT (variações e regras transversais) | 13 |
| [`prioridade-de-sinais.feature`](prioridade-de-sinais.feature) | Prioridade entre sinais na mesma mensagem | 5 | PT-19 | 5 |
| [`reclamacao-e-cancelamento.feature`](reclamacao-e-cancelamento.feature) | Reclamação e cancelamento em qualquer passo | 7 | PT-25, PT-26 | 6 |
| [`recomendacao.feature`](recomendacao.feature) | Nenhuma recomendação de investimento | 4 | PT-13, PT-14, PT-15, PT-16, PT-17 | 4 |
| [`redacao-e-validacao.feature`](redacao-e-validacao.feature) | Redação pelo modelo e validação da saída | 9 | sem PT (variações e regras transversais) | 12 |
| [`sem-doom-loop.feature`](sem-doom-loop.feature) | Sem doom loop | 8 | PT-27, PT-28 | 6 |
| [`sessao.feature`](sessao.feature) | Estado da sessão | transversal | sem PT (variações e regras transversais) | 8 |
| [`sugestoes.feature`](sugestoes.feature) | Sugestões de pergunta no chat | transversal | sem PT (variações e regras transversais) | 10 |

Cada `Esquema do Cenário` conta como um cenário; as linhas de `Exemplos` multiplicam os casos executáveis.

## Como virar teste

1. O motor expõe uma função por camada (entendimento, política, calculadoras, validador); os passos `Dado/Quando/Então` chamam essas funções, nunca a tela.
2. O script das perguntas de teste lê as etiquetas `@PT-xx`, roda a pergunta no motor e grava o JSONL que `../../caqui-invest/ferramentas/checar_respostas.py` confere.
3. Cenários com `@premissa` ficam pendentes até a decisão ser registrada em `../../DECISIONS.md`.

## Pendências de premissa

- Decididas em [`DECISIONS.md`](../../DECISIONS.md): 16h00 em ponto conta como "até 16h" e o humano atende de 08h00 a 19h59 (D4); a convenção de cálculo de PT-06, PT-10 e PT-11 está em D5.
