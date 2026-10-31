# Fluxo: login simulado e papéis

O app tem duas visões, a do cliente (chat) e a do suporte (fila de casos). Não há senha: a tela de entrada lista usuários dos dados sintéticos e o servidor guarda a sessão, como no desafio-tecnico. O papel da sessão decide a visão e filtra tudo no servidor.

```mermaid
flowchart LR
    A["Tela de entrada<br/>lista de usuários sintéticos"] --> B{"Quem entra?"}
    B -->|"cliente<br/>(clientes.json)"| C["Servidor cria a sessão<br/>cookie HttpOnly com id opaco"]
    B -->|"atendente<br/>(Jonas)"| C
    C --> D{"Papel da sessão"}
    D -->|cliente| E["Chat<br/>só a própria conversa<br/>e os próprios dados"]
    D -->|atendente| F["Fila de casos<br/>golpe, idosos, demais"]
    E --> G["Sair apaga a sessão<br/>e volta à tela de entrada"]
    F --> G
```

Segurança e especialista atendem pelos mesmos casos da fila; a distinção entre eles é do caso, não de uma tela própria (premissa a confirmar na SPEC).

Referenciado em `../JORNADA_DO_USUARIO.pdf` (login e papéis) e `bdd/acesso-e-papeis.feature`.
