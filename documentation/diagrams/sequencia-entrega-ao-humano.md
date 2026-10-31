# Sequência: entrega ao humano sem repetição

O cliente pede uma pessoa. O caso chega ao Jonas com resumo, motivos e protocolo, e ele não pergunta de novo o que já foi dito.

```mermaid
sequenceDiagram
    actor Cli as Cliente
    participant Chat as Chat
    participant Srv as Servidor
    participant Fila as Fila de casos
    participant Pn as Painel
    actor Jonas as Atendente (Jonas)

    Cli->>Chat: "Quero falar com uma pessoa"
    Chat->>Srv: mensagem
    Srv->>Srv: política: humano, relógio dentro do horário
    Srv->>Fila: caso com resumo, sinais, risco, prioridade, protocolo
    Srv-->>Chat: protocolo e tempo estimado de espera
    Chat-->>Cli: "Seu protocolo é P-0001. Você já está na fila"
    Fila-->>Pn: caso ordenado: golpe, idoso, demais
    Pn-->>Jonas: histórico, motivos da decisão, fontes, CPF mascarado
    Jonas->>Cli: assume sem pedir o motivo de novo
    Note over Fila,Pn: o resumo é montado pelo código, não por texto gerado
```

Fora do horário o caso fica registrado com protocolo e entra na fila às 8h.

Referenciado em `../JORNADA_DO_USUARIO.pdf` (jornada do Jonas) e `bdd/entrega-ao-humano.feature`.
