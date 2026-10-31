# Fluxo: horário de atendimento

Humano das 8h às 20h, todos os dias. Fora disso, protocolo e prazo de retorno. A segurança atende a qualquer hora.

```mermaid
flowchart LR
    A["Pedido de humano"] --> S{"É suspeita<br/>de golpe?"}
    S -->|sim| S1["Segurança imediata<br/>a qualquer hora"]
    S -->|não| H{"Entre 8h e 20h?<br/>relógio de São Paulo"}
    H -->|sim| H1["encaminhar_humano<br/>com tempo estimado de espera"]
    H -->|não| H2["protocolo"]
    H2 --> H3["Informa que o atendimento por<br/>pessoa volta às 8h e o prazo de retorno"]
    H3 --> H4["Caso entra na fila às 8h<br/>com histórico"]
    H1 --> H5["Cliente entra na fila<br/>sem menu intermediário"]
```

O relógio é injetável: em testes e na demonstração o horário é informado.

Referenciado em `../JORNADA_DO_USUARIO.pdf` (horário de atendimento) e `bdd/horario-de-atendimento.feature`.
