# Fluxo: Home do cliente

O que a Home mostra e de onde cada bloco vem. O servidor monta tudo em `GET /api/chat/{sessaoId}/conta` com funções puras de `server/domain/account-view.ts`; a tela só exibe e envia intenção para a conversa.

```mermaid
flowchart TD
    A["Cliente entra<br/>e abre a Home"] --> B["Tela pede a conta<br/>da sessão"]
    B --> C["Servidor: dados só do<br/>cliente da sessão"]
    C --> D["Relógio e calendário<br/>dão o hoje e os dias úteis"]
    D --> E{"Há operação<br/>em processamento?"}
    E -->|sim| F["Etapas pelo corte das 16h<br/>e pelos dias úteis<br/>fonte KB-006 e id da operação"]
    E -->|não| G["Sem card Em andamento"]
    F --> H["Patrimônio = saldo bruto<br/>+ saldo em conta<br/>resultado desde a aplicação"]
    G --> H
    H --> I{"Feriado nos próximos<br/>5 dias úteis?"}
    I -->|sim| J["Aviso com o dia que<br/>passa a contar"]
    I -->|não| K["Sem aviso"]
    J --> L["Alocação por classe<br/>percentuais somam 100"]
    K --> L
    L --> M["Tela exibe na ordem:<br/>saudação, em andamento, visão geral,<br/>avisos, ações, alocação, próximos passos"]
    M --> N{"O que a pessoa toca?"}
    N -->|"Resgatar ou<br/>Ver detalhes do resgate"| O["Conversa envia<br/>Quando cai meu resgate?"]
    N -->|"Falar com uma pessoa"| P["Abre a página de Atendimento<br/>ver fluxo-atendimento"]
    N -->|"Ocultar valores"| Q["Só a tela muda<br/>nada vai ao servidor"]
```

A data de cada etapa é a mesma que a Kaki responde na conversa: as duas saem de `calcularLiquidacao` com o mesmo relógio (D8, D12).

Referenciado em `../JORNADA_DO_USUARIO.pdf` (Home do cliente) e `bdd/home.feature`.
