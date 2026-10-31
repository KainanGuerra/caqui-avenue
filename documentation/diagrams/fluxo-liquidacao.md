# Fluxo: liquidação de resgate

Como a data de pagamento é calculada pelo calendário da Caqui. Nunca é lida da planilha de operações.

```mermaid
flowchart LR
    A["Pedido de resgate:<br/>produto, data e hora"] --> B{"Dia útil e<br/>até 16h?"}
    B -->|sim| C["Dia-base: o próprio dia"]
    B -->|não| D["Dia-base: próximo dia útil<br/>fim de semana e feriado não contam"]
    C --> P{"Produto"}
    D --> P
    P -->|"CDB, LCI diária"| P1["Liquida no dia-base"]
    P -->|"Fundo renda fixa"| P2["Cotização D+1 útil<br/>pagamento D+2 úteis"]
    P -->|"Fundo multimercado"| P3["Cotização 30 dias corridos<br/>ajustada para dia útil<br/>pagamento 2 dias úteis depois"]
    P -->|"Tesouro Selic"| P4["Liquidação D+1 útil"]
    P1 --> R["Resposta com datas e fonte KB-006"]
    P2 --> R
    P3 --> R
    P4 --> R
```

Exemplo do case: pedido na sexta 30/10 às 17h, feriado na segunda 02/11, fundo de renda fixa: dia-base 03/11, cotização 04/11, pagamento 05/11.

Referenciado em `../JORNADA_DO_USUARIO.pdf` (liquidação e IR) e `bdd/liquidacao.feature`.
