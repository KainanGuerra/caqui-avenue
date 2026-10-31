# Fluxo: Atendimento do cliente

Uma página, dois estados. O servidor monta tudo em `GET /api/chat/{sessaoId}/atendimento` com funções puras de `server/domain/support-view.ts`; o estado sai do relógio do servidor (`pipeline.agora()`), nunca do navegador. Os pedidos vão a `POST /api/chat/{sessaoId}/pedidos`, que decide a ação pela mesma regra da conversa e devolve o protocolo (D16). Só "Pergunte à Kaki" abre a conversa.

```mermaid
flowchart TD
    A["Cliente abre Atendimento<br/>pela aba, pelo menu ou pela Home"] --> B["Tela pede o atendimento<br/>da sessão"]
    B --> C["Servidor: relógio do servidor,<br/>base de conhecimento e casos<br/>só do cliente da sessão"]
    C --> H{"Tem casos?"}
    H -->|sim| I["Minhas conversas<br/>Respondido ou Em andamento"]
    H -->|não| J["Sem a seção"]
    I --> G["Perguntas frequentes com o artigo<br/>que a busca achou: KB-006, nunca KB-007"]
    J --> G
    G --> D{"Linha final, discreta:<br/>há pessoa agora? 8h às 20h"}
    D -->|sim| E["Quem atender já vê<br/>o que você contou"]
    D -->|não| F["Retorno amanhã<br/>a partir das 8h"]
    E --> K{"O que a pessoa toca?"}
    F --> K
    K -->|"Falar com a segurança agora<br/>qualquer hora"| L["Pedido na página<br/>seguranca_imediata, prioridade 0<br/>protocolo e passos da KB-020"]
    K -->|"Prefere falar com uma pessoa?<br/>linha discreta no fim (D17)"| M["Pedido na página<br/>encaminhar_humano no horário,<br/>protocolo fora dele"]
    K -->|"Pedir um especialista"| P["Pedido na página<br/>encaminhar_especialista, KB-029"]
    L --> O["Página mostra o texto e o protocolo<br/>vindos do servidor; caso e histórico<br/>são os mesmos da conversa"]
    M --> O
    P --> O
    K -->|"Pergunta frequente"| R["Artigo abre na própria página"]
    K -->|"Pergunte à Kaki:<br/>sugestão ou dúvida digitada"| Q["Única entrada na conversa<br/>resposta com fonte"]
    Q --> S{"A Kaki resolveu?"}
    S -->|sim| T["Sem botão de pessoa"]
    S -->|"não sabe ou não entendeu<br/>pela segunda vez"| U["Botão Falar com uma pessoa<br/>dentro da resposta (D17)"]
    S -->|"terceira sem entender<br/>ou quinto passo"| V["Política escala sozinha<br/>encaminhar_humano ou protocolo"]
```

O horário ("das 8h às 20h") e o retorno saem das mesmas constantes que decidem se há pessoa agora (D4, D13).

Referenciado em `../JORNADA_DO_USUARIO.pdf` (Atendimento do cliente) e `bdd/atendimento.feature`.
