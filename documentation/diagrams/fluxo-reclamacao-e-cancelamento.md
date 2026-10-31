# Fluxo: reclamação e cancelamento

Reclamar ou encerrar a conta está disponível em qualquer passo, com no máximo uma tentativa de retenção.

```mermaid
flowchart LR
    A["Pedido em<br/>qualquer passo"] --> B{"Reclamação<br/>ou encerrar?"}
    B -->|reclamação| C["Protocolo e prazo<br/>de até 7 dias corridos"]
    B -->|encerrar| E{"Retenção já<br/>oferecida?"}
    E -->|não| F["Oferece encerrar e<br/>uma retenção"]
    F --> G{"Insiste?"}
    G -->|não| Z2["Segue o<br/>atendimento"]
    G -->|sim| H
    E -->|sim| H["Passos: resgatar<br/>e transferir o saldo"]
    H --> J{"Sem liquidez<br/>diária?"}
    J -->|sim| K["Continua até<br/>o vencimento"]
    J -->|não| L["Encerra após<br/>o resgate"]
```

O cliente não repete o motivo: ele já vai no resumo do caso.

Referenciado em `../JORNADA_DO_USUARIO.pdf` (reclamação e cancelamento) e `bdd/reclamacao-e-cancelamento.feature`.
