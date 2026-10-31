# SPEC: Kaki, a porta de entrada confiável da Caqui Invest

**Grupo:** a definir
**URL pública:** ainda não publicada (decisão D6: só local por enquanto). Roda com `pnpm dev`; ver [README](README.md).

> A spec veio antes do código e foi atualizada com o que as medições mostraram. O contrato de comportamento está em [`documentation/bdd/`](documentation/bdd/README.md).

## 1. Qual parte do problema?

Os quatro motivos que têm resposta verificável e somam **69% dos contatos** (onde está meu dinheiro 27%, dúvida de produto 19%, rentabilidade e extrato 14%, impostos 9%; as 300 conversas de `conversas.csv` reproduzem essas proporções). Os motivos de risco (golpe, recomendação, cliente vulnerável, reclamação) **não são automatizados**: o agente os reconhece na hora e entrega à pessoa certa, com protocolo e resumo.

Nas 300 conversas históricas, 70 trazem uma não conformidade do atendimento atual: bot que repete a mesma resposta (21), ignora o corte das 16h e o fim de semana (16), não responde a pergunta (14), tenta reter mais de uma vez (7), não reconhece golpe (6), faz o cliente repetir a demanda (5). Cada uma dessas falhas virou cenário do BDD.

## 2. Qual alavanca?

As duas: **resolver sem humano** onde a resposta é calculável ou está na base, e **fazer o humano render mais** nos casos que sobram (resumo, motivos, fontes e protocolo prontos; o cliente não repete a demanda). Evitar o contato fica de fora do corte.

## 3. Quanto isso move?

| Premissa | Valor | De onde veio |
| --- | --- | --- |
| Horas de atendente hoje | 9.560 h/mês | CASE.md, tabela de motivos |
| Atendentes hoje e teto | 62 e 100 | CASE.md |
| Horas por atendente | 154,2 h/mês | 9.560 / 62 |
| Capacidade com 100 pessoas | 15.419 h/mês | 100 x 154,2 |
| Demanda com 5x clientes (linear) | 47.800 h/mês | 9.560 x 5 |
| Redução necessária | 67,7% | 1 - 15.419 / 47.800 |
| Horas dos 4 motivos automatizáveis | 5.744 h (60,1%) | 1.728 + 2.128 + 1.456 + 432 |
| Horas dos demais motivos | 3.816 h (39,9%) | 9.560 - 5.744 |

**Conta:** por mês-base (antes do 5x), o teto de 15.419 / 5 = 3.084 h. Se o agente resolve a fração `r` dos quatro motivos, sobram `5.744 x (1 - r)` h deles, e os demais motivos precisam caber no resto.

| Resolve sozinho (r) | Sobra dos 4 motivos | Os demais podem ocupar | Os demais precisam encolher |
| ---: | ---: | ---: | ---: |
| 70% | 1.723 h | 1.361 h | 64% |
| 80% | 1.149 h | 1.935 h | 49% |
| 90% | 574 h | 2.509 h | 34% |
| 100% | 0 h | 3.084 h | 19% |

**Leitura honesta:** resolver os quatro motivos sozinho **não fecha** a conta. Mesmo com `r` = 90%, os casos que sobram (golpe, recomendação, vulnerável, reclamação, acesso) precisam gastar 34% menos tempo de atendente. A aposta é que resumo e protocolo prontos, sem o cliente repetir a demanda, façam isso; esse número **não foi medido** e é a premissa mais frágil. Os valores de `r` também não foram medidos: o motor acerta as 40 perguntas de teste e os cenários do BDD, mas não há ainda medição com clientes reais.

Efeito adicional não contado acima: "onde está meu dinheiro" tem 44% de recontato em 7 dias nas conversas atuais; uma resposta com data e fonte tende a reduzir esse retorno.

## 4. Como a confiança aparece?

- **Fonte em toda resposta factual**: chip com o artigo (KB-xxx) ou o dado da conta; artigo desatualizado (KB-007, corte de 15h) nunca responde.
- **Saída para uma pessoa sem disputar atenção** (D17): linha discreta "Prefere falar com uma pessoa?" no fim do Atendimento, e o botão "Falar com uma pessoa" dentro da resposta em que a Kaki não sabe ou não entendeu pela segunda vez; das 8h às 20h com tempo estimado, fora disso com protocolo e prazo de retorno; segurança a qualquer hora.
- **Protocolo à vista** e a frase "você não precisa repetir nada: quem atende vê esta conversa".
- **Golpe interrompe tudo** antes de responder a pergunta original.
- **CPF só mascarado** e nenhum dado de outro cliente: o motor só carrega a conta da sessão.
- **Quando não sabe, diz que não sabe**, sem inventar prazo.
- **Para quem atende** (o Jonas): fila ordenada (golpe, 60 anos ou mais, demais), motivos da decisão, resumo montado pelo código e fontes citadas.

## 5. O que fica de fora?

URL pública (decisão D6), autenticação real, banco de dados (sessões e fila ficam em memória), voz e WhatsApp, IOF, feriados estaduais e municipais, ações que movam dinheiro. O atendente humano é simulado pelo painel. Entendimento com LLM existe atrás de flag, desligado por padrão, e **não foi exercitado com um provedor real** neste corte.

## 6. Como viabilizar esta solução?

1. **Medir `r` e o tempo dos casos que sobram** com uma amostra real de conversas (com consentimento e dados protegidos), no modo sombra: o agente sugere e a pessoa decide.
2. **Trocar os adaptadores de dados** (clientes, posições, operações, calendário) pelas APIs reais da Caqui; o domínio não muda.
3. **Estado em armazenamento compartilhado** (sessões e fila) e autenticação do painel por SSO, para rodar em mais de uma instância.
4. **Revisão de conformidade** do jurídico sobre o texto das respostas, a retenção única e o prazo de 7 dias, antes de qualquer cliente real.
5. **Revisar o léxico de golpe e recomendação** com os casos novos que o atendimento real produzir; hoje a medição vem de 300 conversas sintéticas.

## 7. Regras do case que a solução trata

| # | Regra | Trata? | Como vira teste | Se não trata, por quê |
| --- | --- | --- | --- | --- |
| 1 | Liquidação | Sim | `server/domain/settlement.spec.ts`, `liquidacao.feature`, PT-01 a PT-05 | |
| 2 | IR regressivo | Sim | `income-tax.spec.ts`, `imposto-de-renda.feature`, PT-06 a PT-09 | |
| 3 | Comparação com a poupança | Sim | `savings-compare.spec.ts`, PT-10 a PT-12 | |
| 4 | Sem recomendação | Sim | `signals.spec.ts`, `pipeline.spec.ts`, PT-13 a PT-17 | |
| 5 | Golpe | Sim | `signals.spec.ts`, `pipeline.spec.ts`, PT-18 a PT-21 | |
| 6 | Cliente vulnerável | Sim, com limite | `signals.spec.ts`, PT-22 a PT-24; ver a medição em D9 | Detecção por conteúdo acerta 42% das conversas rotuladas: o rótulo depende de uma anotação que não é fala do cliente |
| 7 | Reclamação e cancelamento | Sim | `pipeline.spec.ts`, PT-25 e PT-26 | |
| 8 | Sem doom loop | Sim | `policy.spec.ts`, `pipeline.spec.ts`, PT-27 e PT-28 | |
| 9 | Não sabe, diz que não sabe | Sim | `kb-search.spec.ts`, PT-29 a PT-31, PT-39, PT-40 | |
| 10 | Dados pessoais | Sim | `pipeline.spec.ts` (histórico e log sem CPF cru), PT-32 e PT-33 | |
| 11 | Instrução escondida | Sim | `signals.spec.ts`, `pipeline.spec.ts`, PT-34 a PT-36 | |
| 12 | Horário | Sim | `business-hours.spec.ts`, PT-37 e PT-38 | |

Itens "para qualquer caminho": todos se aplicam (a solução conversa com o cliente). O item 6 (só dados sintéticos) vale sempre.

## Decisões

Registradas em [`DECISIONS.md`](DECISIONS.md).
