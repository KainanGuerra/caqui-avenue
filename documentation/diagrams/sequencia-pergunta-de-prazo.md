# Sequência: pergunta de prazo de resgate

O Rafael pergunta quando o resgate cai. O código calcula, o modelo só escreve, o validador confere.

```mermaid
sequenceDiagram
    actor R as Rafael
    participant S as Servidor
    participant C as Calculadora<br/>e base
    participant L as LLM
    participant V as Validador

    R->>S: "Pedi o resgate na sexta às 17h. Quando cai?"
    S->>C: produto, dia e hora do pedido
    C-->>S: dia-base, cotização, pagamento e fonte KB-006
    S->>S: busca o artigo na KB (nunca o desatualizado)
    S->>L: persona, fatos verificados e texto do artigo
    L-->>S: texto da resposta
    S->>V: texto e fatos obrigatórios
    V-->>S: aprovado, ou reprovado e usa template
    S-->>R: "Cai em 05/11/2026" com a fonte
```

Sem sinal de risco, a ação é responder. Se o LLM estiver fora do ar, o template entrega os mesmos fatos.

Referenciado em `../JORNADA_DO_USUARIO.pdf` (jornada do Rafael) e `bdd/liquidacao.feature`.
