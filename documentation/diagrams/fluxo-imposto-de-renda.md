# Fluxo: imposto de renda na renda fixa

O imposto incide só sobre o rendimento, pela faixa dos dias corridos desde a aplicação.

```mermaid
flowchart LR
    A["Resgate: produto, valor e<br/>data da aplicação"] --> B{"Produto isento?<br/>LCI, LCA, poupança"}
    B -->|sim| B1["Isento de IR<br/>para pessoa física"]
    B -->|não| C["Conta os dias corridos<br/>da aplicação até a data de cálculo"]
    C --> D{"Dias corridos"}
    D -->|"até 180"| D1["22,5%"]
    D -->|"181 a 360"| D2["20%"]
    D -->|"361 a 720"| D3["17,5%"]
    D -->|"acima de 720"| D4["15%"]
    D1 --> E["IR = alíquota x rendimento"]
    D2 --> E
    D3 --> E
    D4 --> E
    E --> F["Resposta: alíquota, rendimento, IR<br/>e a fonte KB-010"]
    B1 --> F
```

A alíquota nunca incide sobre o valor total do resgate.

Referenciado em `../JORNADA_DO_USUARIO.pdf` (liquidação e IR) e `bdd/imposto-de-renda.feature`.
