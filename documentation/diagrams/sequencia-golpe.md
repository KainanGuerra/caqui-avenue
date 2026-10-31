# Sequência: suspeita de golpe

O sinal de golpe interrompe tudo antes de qualquer outra resposta e atende a qualquer hora.

```mermaid
sequenceDiagram
    actor Cli as Cliente
    participant Chat as Chat
    participant Srv as Servidor
    participant Sess as Sessão
    participant Seg as Segurança
    participant Pn as Painel

    Cli->>Chat: "Qual o prazo? Ah, me pediram o código do SMS"
    Chat->>Srv: mensagem
    Srv->>Srv: sinais: pergunta de prazo e golpe
    Note over Srv: golpe tem prioridade 1
    Srv->>Sess: marca modo segurança
    Srv->>Seg: caso urgente com protocolo
    Seg-->>Pn: caso no topo da fila
    Srv-->>Chat: não passe código, bloqueio de acesso, segurança já avisada
    Chat-->>Cli: orientação, protocolo e botão de bloqueio
    Cli->>Chat: nova mensagem qualquer
    Chat->>Srv: mensagem
    Sess-->>Srv: modo segurança ativo
    Srv-->>Chat: mantém o encaminhamento à segurança
```

A pergunta original não é respondida antes. Fora do horário comercial o fluxo é o mesmo.

Referenciado em `../JORNADA_DO_USUARIO.pdf` (jornada de golpe) e `bdd/golpe.feature`.
