# Estados da sessão

O que a sessão guarda entre mensagens. O modo segurança trava até haver humano; a vulnerabilidade persiste.

```mermaid
stateDiagram-v2
    [*] --> Normal
    state Ativa {
        direction LR
        Normal --> Aguardando: não entendida
        Aguardando --> Normal: entendeu
        Aguardando --> PrioridadeHumana: 2ª não entendida
        Normal --> PrioridadeHumana: vulnerável ou 5º passo
    }
    Ativa --> ModoSeguranca: sinal de golpe
    ModoSeguranca --> ModoSeguranca: qualquer mensagem
    Ativa --> Encerrada: resolvido ou humano assume
    ModoSeguranca --> Encerrada: segurança assume
    Encerrada --> [*]
```

Contadores: passos (máximo 5), mensagens sem entendimento (2 levam a humano), retenção já oferecida e última operação ou produto citados.

Referenciado em `../JORNADA_DO_USUARIO.pdf` (ciclo da sessão) e `bdd/sessao.feature`.
