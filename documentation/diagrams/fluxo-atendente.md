# Fluxo: o atendente no painel

O que o Jonas faz do momento em que entra até fechar o caso. O resumo e os motivos vêm do código; ele não pergunta de novo o que o cliente já contou.

```mermaid
flowchart LR
    A["Entra como atendente"] --> B["Fila de casos<br/>golpe, idosos, demais"]
    B --> C["Abre o caso<br/>resumo, sinais, risco,<br/>motivos, fontes, CPF mascarado"]
    C --> D{"O que o caso pede?"}
    D -->|"responder"| E["Assume e responde<br/>sem repetir a demanda"]
    D -->|"pede recomendação"| F["Passa ao especialista<br/>com o protocolo"]
    D -->|"suspeita de golpe"| G["Passa à segurança<br/>com o protocolo"]
    D -->|"fora da alçada"| H["Pede apoio ao supervisor<br/>(premissa)"]
    E --> I["Fecha o caso<br/>histórico guardado pelo protocolo"]
    F --> I
    G --> I
    H --> E
```

Fora do horário o caso não aparece para o atendente: fica registrado com protocolo e entra na fila às 8h (ver `fluxo-horario.md`). Golpe é atendido pela segurança a qualquer hora. Reclamação mantém o prazo de até 7 dias corridos (KB-026).

Referenciado em `../JORNADA_DO_USUARIO.pdf` (fluxo do atendente) e `bdd/painel-do-atendente.feature`.
