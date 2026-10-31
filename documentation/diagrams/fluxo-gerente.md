# Fluxo: painel do gerente

De onde vem cada número do painel. Tudo sai do que o pipeline e o adaptador de IA registram em memória desde que o servidor subiu. As contas são funções puras de `server/domain/management-metrics.ts`; a tela só exibe (D19).

```mermaid
flowchart TD
    A["Gerente entra<br/>Sou gerente + GERENTE_PIN"] --> B["GET /api/gerente/painel<br/>página e status dos casos<br/>a cada 5 s"]
    B --> C["ManagementService"]
    P["Pipeline: cada resposta<br/>ação, motivos, redação,<br/>fonte, não entendeu, ms"] --> E["Registros em memória<br/>zeram ao reiniciar"]
    L["Adaptador de IA medido<br/>caracteres, ms, sucesso"] --> E
    K["Casos abertos<br/>pela política"] --> E
    C --> E
    E --> G["resumirAoVivo"]
    G --> H["Volume, resolução automática,<br/>escalonadas, qualidade,<br/>custo e latência"]
    G --> S["Sentimento estimado por conversa<br/>regra mais forte vence<br/>só o total, nada gravado"]
    S --> I
    G --> J["Casos: 10 por página,<br/>mais novo primeiro,<br/>filtro por status"]
    H --> I["Tela exibe cartões,<br/>barras e a lista paginada"]
    J --> I
```

O painel nunca recebe o texto da conversa nem o CPF: só contagens, ações, motivos e protocolos. Custo é estimativa (cerca de 4 caracteres por token, preço do `.env`).

Referenciado em `bdd/painel-do-gerente.feature`.
