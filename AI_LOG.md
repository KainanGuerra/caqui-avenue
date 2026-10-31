# AI_LOG

Momentos em que a IA errou ou quase errou, como foram notados e o que mudou.

1. **Busca na base errou o artigo do corte.** "Qual o horário de corte para resgate de CDB?" devolvia KB-003. Notado pelo teste do KB-006 contra o KB-007. Mudança: ponderação pela raridade do termo e mínimo de dois termos em comum nas perguntas livres (`kb-search.ts`). Um segundo efeito apareceu no PT-27: "não é isso de novo" casava com "aparelho novo" (KB-021); o mínimo de dois termos resolveu.
2. **Conta errada que passou nas pistas.** O texto de PT-12 dizia "7,2% ao ano, composto", mas 0,6% ao mês composto dá 7,44%. As pistas do checador não pegaram; a leitura das 40 respostas pegou. Corrigido para usar a fórmula composta.
3. **Resposta de ações misturada com criptoativos.** PT-30 trouxe o prazo de uma operação de ações da conta, porque a intenção "prazo" também casou. Mudança: pergunta sobre produto que a Caqui não oferece responde só isso (`planoInexistente`).
4. **Pista contra o próprio texto.** Os cinco casos de recomendação falharam porque a resposta dizia "não indico a melhor opção para você": a pista proíbe a frase mesmo negada. Reescrito sem a expressão.
5. **Vazamento de rótulo nos dados.** A primeira medição de "vulnerável" subia por conta de um texto "(cliente idoso, confuso)" colado nas falas. Não é fala do cliente; foi removido antes de medir e o resultado honesto é 42% de recall (D9).
6. **Hipótese de cálculo desmentida.** Supus que o CDB seria recontado por dias úteis depois da aplicação; só reproduz o saldo se os dois extremos forem contados (D5). Descoberto por recontagem, não por palpite.
7. **Erro de processo.** Dois comandos de encerrar o servidor (`pkill -f`) casaram com o próprio comando e mataram a sessão do shell, perdendo a escrita de arquivos do mesmo comando. Passou a usar a porta (`fuser -k`).

## Mapa de autoria

| Parte | Quem decidiu | Quem escreveu | Quem verificou |
| --- | --- | --- | --- |
| Escopo, tese e decisões de produto | Autor, por prompts | IA | Autor |
| BDD e diagramas | Autor aprovou o formato | IA | Parser Gherkin; renderização dos diagramas |
| Calculadoras e política | IA propôs, autor aprovou o plano | IA | Testes, recontagem contra os dados |
| Léxico de sinais | IA | IA | Medição em 300 conversas (otimista, ver D9) |
| Interface | IA | IA | Percurso no navegador |

O autor ainda não leu o código linha a linha; o plano e as decisões foram lidos e aprovados.
