# language: pt
@transversal @premissa
Funcionalidade: Painel do atendente
  O que o atendente (Jonas) faz depois da entrega: abrir a fila, ler o caso, responder
  sem repetir a demanda, passar adiante e fechar. A ordenação e o resumo estão em
  entrega-ao-humano.feature; aqui fica o uso do painel. Depende da decisão D10.

  Contexto:
    Dado que agora é 18/11/2026 às 10h
    E a sessão do atendente Jonas

  Cenário: A fila abre ordenada
    Dado casos de golpe, de pessoa idosa e de cliente comum
    Quando Jonas abre a fila
    Então vê golpe primeiro, depois idosos, depois os demais

  Cenário: Abrir o caso mostra o que o agente já fez
    Quando Jonas abre um caso
    Então vê resumo, sinais, risco, motivos da decisão e fontes
    E o CPF aparece mascarado

  Cenário: Assumir não repete a demanda
    Quando Jonas assume o caso
    Então o cliente não precisa contar de novo o motivo

  Cenário: Pedido de recomendação segue ao especialista
    Dado um caso que pede recomendação de investimento
    Quando Jonas trata o caso
    Então ele não recomenda produto
    E passa ao especialista com o protocolo

  Cenário: Suspeita de golpe segue à segurança
    Dado um caso com suspeita de golpe
    Quando Jonas abre o caso
    Então o caso já está com a segurança
    E o atendente comum não o resolve

  Cenário: Fechar guarda o histórico pelo protocolo
    Quando Jonas fecha o caso
    Então o histórico fica guardado sob o protocolo
    E o caso sai da fila

  Cenário: Fora do horário a fila não recebe o caso
    Dado que agora é 18/11/2026 às 23h
    E um cliente pede humano
    Quando Jonas abre a fila
    Então o caso ainda não aparece
    E ele entra na fila às 8h com o protocolo já gerado

  Cenário: Atendente só vê o painel quando há sessão
    Dado que não há sessão
    Quando alguém pede a fila de casos
    Então o app leva à tela de entrada
