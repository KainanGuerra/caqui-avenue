# Fluxo: Atendimento do cliente

Uma página, dois estados. O servidor monta tudo em `GET /api/chat/{sessaoId}/atendimento` com funções puras de `server/domain/support-view.ts`; o estado sai do relógio do servidor (`pipeline.agora()`), nunca do navegador. Cada botão só envia uma frase de `app/utils/pedidos.ts` à conversa que já existe, e o pipeline decide a ação.

```mermaid
flowchart TD
    A["Cliente abre Atendimento<br/>pelo menu ou pela Home"] --> B["Tela pede o atendimento<br/>da sessão"]
    B --> C["Servidor: relógio do servidor,<br/>base de conhecimento e casos<br/>só do cliente da sessão"]
    C --> D{"Há pessoa agora?<br/>8h às 20h"}
    D -->|sim| E["Ponto verde<br/>Uma pessoa pode te atender agora<br/>botão Falar com uma pessoa"]
    D -->|não| F["Ponto cinza<br/>Atendimento volta amanhã a partir das 8h<br/>botão Registrar minha demanda"]
    E --> G["Perguntas frequentes com a fonte<br/>que a busca achou: KB-006, nunca KB-007"]
    F --> G
    G --> H{"Tem casos?"}
    H -->|sim| I["Minhas conversas<br/>Respondido ou Em andamento"]
    H -->|não| J["Sem a seção"]
    I --> K{"O que a pessoa toca?"}
    J --> K
    K -->|"Falar com a segurança agora<br/>qualquer hora"| L["Conversa envia o relato de golpe<br/>seguranca_imediata, prioridade 0"]
    K -->|"Falar com uma pessoa"| M["Conversa envia o pedido<br/>encaminhar_humano"]
    K -->|"Registrar minha demanda"| N["Pedido vai ao pipeline sem sair da página<br/>ação protocolo"]
    N --> O["Protocolo aparece só agora,<br/>vindo da resposta do servidor"]
    K -->|"Quer saber onde investir?"| P["Conversa envia a pergunta<br/>encaminhar_especialista"]
    K -->|"Pergunta frequente,<br/>sugestão ou dúvida digitada"| Q["Conversa envia a pergunta<br/>resposta com a mesma fonte"]
```

O horário ("das 8h às 20h") e o retorno saem das mesmas constantes que decidem se há pessoa agora (D4, D13).

Referenciado em `../JORNADA_DO_USUARIO.pdf` (Atendimento do cliente) e `bdd/atendimento.feature`.
