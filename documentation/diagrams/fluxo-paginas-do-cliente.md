# Fluxo: páginas do cliente e rodapé de abas

O cliente navega por Início, Carteira, Investir, Aprender e Atendimento (Figma 50:202). Cada página responde com dados do servidor ou registra o pedido ali mesmo; a conversa fica dentro do Atendimento, como última alternativa (D16).

```mermaid
flowchart TD
    A["Rodapé no celular<br/>ou menu no desktop"] --> B{"Aba"}
    B -->|"Carteira"| C["GET conta da sessão<br/>só dados do cliente"]
    C --> D["Para cada posição:<br/>calcularLiquidacao com o relógio,<br/>corte das 16h e dias úteis"]
    D --> E{"Prazo"}
    E -->|"liquida"| F["Se pedir agora, cai em tal dia<br/>fonte KB-006"]
    E -->|"em carência"| G["Resgate liberado em tal dia"]
    E -->|"sem liquidez diária"| H["Valor sai no vencimento"]
    B -->|"Investir"| I["GET investir<br/>produtos na ordem dos dados"]
    I --> J["Rentabilidade, resgate e imposto<br/>sem ranking, sem 'melhor'<br/>artigo do tipo abre na página"]
    J --> K["Pedir um especialista"]
    K --> L["POST pedidos<br/>encaminhar_especialista, KB-029<br/>protocolo na página"]
    B -->|"Aprender"| M["GET aprender<br/>artigos atuais por tema<br/>KB-007 nunca"]
    B -->|"Atendimento"| N["Ver fluxo-atendimento"]
    N --> O["Pergunte à Kaki<br/>abre a conversa"]
    L --> P["Mesmo caso e mesmo histórico<br/>da conversa: quem atende vê tudo"]
```

Referenciado em `../JORNADA_DO_USUARIO.pdf` (Páginas do cliente) e `bdd/paginas-do-cliente.feature`.
