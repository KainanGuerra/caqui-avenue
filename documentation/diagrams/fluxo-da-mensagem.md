# Fluxo de uma mensagem: a política de decisão

Depois de mascarar o texto e extrair os sinais, a política escolhe a ação pela ordem fixa abaixo, em dois trechos. É uma função pura sobre sinais, sessão, relógio e cliente: não lê texto nem rede.

Trecho 1: sinais de risco.

```mermaid
flowchart LR
    A["Mensagem<br/>mascarada"] --> C{"Golpe?"}
    C -->|sim| C1["seguranca_imediata<br/>modo segurança travado"]
    C -->|não| D{"Cliente<br/>vulnerável?"}
    D -->|sim| D1["encaminhar_humano<br/>com prioridade"]
    D -->|não| E{"Pede dado de<br/>outro cliente?"}
    E -->|sim| E1["recusar"]
    E -->|não| F["segue para o trecho 2"]
```

Trecho 2: pedidos do cliente.

```mermaid
flowchart LR
    F["Vem do<br/>trecho 1"] --> G{"Pede<br/>recomendação?"}
    G -->|sim| G1["encaminhar_especialista"]
    G -->|não| H{"Humano, cancelar<br/>ou reclamar?"}
    H -->|sim| H1["humano, protocolo<br/>ou encerramento"]
    H -->|não| I{"Não entendeu<br/>a mensagem?"}
    I -->|sim| I1["reformular e, na<br/>2ª vez, humano"]
    I -->|não| J["responder<br/>plano, redação e validação"]
```

Cada ação gera protocolo e, quando vai a uma pessoa, entrega o caso com resumo. Injeção de papel ("você agora é...") é neutralizada como texto e não decide a ação sozinha.

Referenciado em `../JORNADA_DO_USUARIO.pdf` (anatomia de uma mensagem) e `bdd/prioridade-de-sinais.feature`.
