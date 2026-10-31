# Fluxo: login simulado e papéis

O app tem três visões: a do cliente (chat), a do suporte (fila de casos) e a do gerente (painel gerencial, D19). Não há senha: a tela de entrada lista usuários dos dados sintéticos e o servidor guarda a sessão, como no desafio-tecnico. O papel da sessão decide a visão e filtra tudo no servidor.

```mermaid
flowchart LR
    A["Tela de entrada<br/>lista de usuários sintéticos"] --> B{"Quem entra?"}
    B -->|"cliente<br/>(clientes.json)"| C["Servidor cria a sessão<br/>cookie HttpOnly com id opaco"]
    B -->|"atendente<br/>(Jonas)"| C
    B -->|"gerente<br/>(Helena, PIN próprio)"| C
    C --> D{"Papel da sessão"}
    D -->|cliente| E["Chat<br/>só a própria conversa<br/>e os próprios dados"]
    D -->|atendente| F["Fila de casos<br/>golpe, idosos, demais"]
    D -->|gerente| H["Painel gerencial<br/>volume, resolução, escalonadas,<br/>qualidade, custo e latência"]
    E --> G["Sair apaga a sessão<br/>e volta à tela de entrada"]
    F --> G
    H --> G
```

Segurança e especialista atendem pelos mesmos casos da fila; a distinção entre eles é do caso, não de uma tela própria (premissa a confirmar na SPEC).

Referenciado em `../JORNADA_DO_USUARIO.pdf` (login e papéis) e `bdd/acesso-e-papeis.feature`.
