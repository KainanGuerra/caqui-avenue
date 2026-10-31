# Contexto do sistema

Quem fala com o agente de atendimento da Caqui, o que ele consulta e quem recebe os casos que ele não resolve.

```mermaid
flowchart LR
    cliente(["Cliente<br/>Marta, Rafael, Camila"])
    atendente(["Atendente<br/>Jonas"])
    seguranca(["Equipe de segurança<br/>24 horas"])
    especialista(["Especialista<br/>com agendamento"])

    subgraph sistema["Sistema de atendimento"]
        chat["Chat do cliente"]
        servidor["Servidor do agente<br/>entende, decide, redige"]
        painel["Painel do atendente"]
    end

    llm[("Provedor de LLM<br/>opcional")]
    dados[("Dados de apoio<br/>clientes, operações,<br/>calendário, taxas, base")]

    cliente -->|"escreve"| chat
    chat -->|"mensagem"| servidor
    servidor -->|"resposta com fonte"| chat
    servidor -.->|"só redige"| llm
    servidor -->|"consulta só o<br/>cliente da sessão"| dados
    servidor -->|"caso, resumo,<br/>protocolo"| painel
    painel --> atendente
    servidor ==>|"golpe: na hora"| seguranca
    servidor -->|"pedido de recomendação"| especialista
    atendente -->|"responde o caso"| cliente
```

Linhas pontilhadas são opcionais: sem LLM o servidor redige com templates. O cliente nunca vê dado de outro cliente.

Referenciado em `../JORNADA_DO_USUARIO.pdf` (contexto) e `bdd/entrega-ao-humano.feature`.
