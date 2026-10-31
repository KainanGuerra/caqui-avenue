# Fluxo: recomendação e cliente vulnerável

A Camila pede para alguém dizer o que fazer; a Dona Marta recebe pressão de um terceiro. Nenhuma das duas recebe uma recomendação, e a Dona Marta passa na frente.

```mermaid
flowchart LR
    M["Mensagem"] --> V{"Vulnerável?<br/>60+, confusão,<br/>terceiro, resgate<br/>atípico"}
    V -->|sim| V1["Tom calmo<br/>e sem julgamento"]
    V1 --> V2["encaminhar_humano<br/>prioridade de idoso"]
    V2 --> V3["Lembra: só conta<br/>de mesma titularidade"]
    V -->|não| R{"Pede<br/>recomendação?"}
    R -->|sim| R1["Não indica produto<br/>nem melhor opção"]
    R1 --> R3["encaminhar_especialista<br/>com agendamento"]
    R -->|não| O["Fluxo normal"]
```

Pode explicar como os produtos funcionam, com fonte. Insistência ou troca de papel não mudam a ação.

Referenciado em `../JORNADA_DO_USUARIO.pdf` (jornada da Camila e da Dona Marta), `bdd/recomendacao.feature` e `bdd/cliente-vulneravel.feature`.
