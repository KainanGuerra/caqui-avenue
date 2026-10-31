# Handoff do Figma para a Kaki

Arquivo: [Caqui Invest · Kit de UX de confiança](https://www.figma.com/design/tl9FFynv0PPlTdnLkGVPPb). Páginas: `00 Cover & Guidelines`, `01 Brand Foundations`, `02 Product Foundations`, `03 Components`, `04 Patterns & Templates`. O que está em `99 Arquivo` não vale.

Regras do agente: `.cursor/rules/design-system.mdc`. Tokens: `app/assets/css/main.css` e `app/app.config.ts`.

> Os valores nas telas do Figma são ilustrativos (Felipe, R$ 24.850,00). No código, os valores vêm da conta do cliente da sessão. O Figma define **estrutura, hierarquia e texto**; os números vêm do servidor.

## 1. Mapa de telas

| Tela no Figma | Nó | Arquivo | Estado hoje |
| --- | --- | --- | --- |
| Home · Mobile 390 | [50:3](https://www.figma.com/design/tl9FFynv0PPlTdnLkGVPPb/Caqui?node-id=50-3) | `app/pages/inicio.vue` | feita (D12): em andamento, visão geral, avisos, ações, alocação, próximos passos |
| Atendimento · 14h | [51:169](https://www.figma.com/design/tl9FFynv0PPlTdnLkGVPPb/Caqui?node-id=51-169) | `app/pages/atendimento.vue` | feita (D13): estado "uma pessoa pode te atender agora" |
| Atendimento · 23h | [51:332](https://www.figma.com/design/tl9FFynv0PPlTdnLkGVPPb/Caqui?node-id=51-332) | `app/pages/atendimento.vue`, com `humanoDisponivel = false` | feita (D13): "Atendimento volta {retorno}" e "Registrar minha demanda" |
| Rodapé de abas | [50:202](https://www.figma.com/design/tl9FFynv0PPlTdnLkGVPPb/Caqui?node-id=50-202) | `app/components/BottomNav.vue` | feito (D16): Início, Carteira, Investir, Aprender, Atendimento |
| Carteira, Investir, Aprender | sem nó próprio | `carteira.vue`, `investir.vue`, `aprender.vue` | feitas (D16) com os componentes e tokens da Home |
| Chat 1 · Fonte e status | [54:413](https://www.figma.com/design/tl9FFynv0PPlTdnLkGVPPb/Caqui?node-id=54-413) | `conversa.vue`, `ChatMensagem.vue` | fontes como badge azul |
| Chat 2 · Golpe | [54:490](https://www.figma.com/design/tl9FFynv0PPlTdnLkGVPPb/Caqui?node-id=54-490) | `ChatMensagem.vue` (`acao = seguranca_imediata`) | balão vermelho claro |
| Chat 3 · Não inventa / não recomenda | [54:522](https://www.figma.com/design/tl9FFynv0PPlTdnLkGVPPb/Caqui?node-id=54-522) | `ChatMensagem.vue` | igual às outras respostas |
| Chat 4 · Transferência | [54:593](https://www.figma.com/design/tl9FFynv0PPlTdnLkGVPPb/Caqui?node-id=54-593) | `conversa.vue` (alerta de protocolo) | `UAlert` no topo |
| Console · 1440 | [55:568](https://www.figma.com/design/tl9FFynv0PPlTdnLkGVPPb/Caqui?node-id=55-568) | `app/pages/suporte.vue`, `CasoCard.vue` | KPIs + fila + caso |
| Componentes | página `03 Components` | `app/components/` | ver tabela na regra do Cursor |

`Home · Mobile 391` (48:877) é uma cópia de trabalho: use a 50:3.

## 2. O que muda em cada tela

### Layout (`app/layouts/default.vue`, `AppLogo.vue`, `AppMenu.vue`)
- Trocar `bg-slate-*`, `border-slate-*`, `text-slate-*` e `bg-emerald-500` por tokens (`bg-default`, `border-default`, `text-muted`, `bg-success`).
- `AppLogo`: wordmark "caquí" em Manrope 600, cor `primary` (provisório até o vetor final).
- Item ativo do menu: fundo `bg-marfim-300`, texto `text-highlighted`, `aria-current="page"`.
- Mobile (< 768px), cliente: rodapé de abas do nó 50:202 (`BottomNav.vue`) no lugar da gaveta e da faixa informativa (D16). Aba ativa com pílula `bg-marfim-300`, rótulo 12px semibold `text-highlighted`; as outras em `text-muted`. A conversa marca a aba Atendimento. A largura de cada aba segue o rótulo, para "Atendimento" em negrito caber em 375px. O suporte continua com a gaveta.

### Início (`inicio.vue`), nó 50:3 (feito, D12)
Ordem de cima para baixo; tudo vem pronto de `conta` (`GET /api/chat/:sessaoId/conta`):
1. **Saudação:** "Olá, {nome}" + "Veja como seu patrimônio mudou." (nunca "rendendo bem").
2. **Em andamento** (`EmAndamentoCard.vue`, layer 50:19, oculto no frame mas parte da tela): um card por item de `conta.emAndamento` (status `em_processamento`). Começa recolhido, em superfície `bg-default` com o ícone em `bg-marfim-300` (D14): "Seu resgate de {valor} cai hoje, {dd/mm}" e "Etapa atual: {etapa}". Ao tocar, abre etapas com estado feito/atual/próximo, fonte `KB-006 · {OP}` e "Ver detalhes do resgate" (abre a Carteira, D16). Sem a frase "não sumiu" (PT-03) e sem prometer aviso. Sem operação em andamento, o card não aparece.
3. **Visão geral** (`ResumoPatrimonio.vue`): `patrimonioCentavos`, "Ocultar valores" (estado só de tela, esconde todo valor da Home), "Atualizado em", Investido / Saldo disponível / Resultado desde a aplicação, e a nota de valores brutos com fonte. Sem seletor de período.
4. **Avisos** (`UAlert` warning) de `conta.avisos`; o alerta de protocolo aberto fica junto.
5. **O que você quer fazer?** (`AcaoRapida.vue`) 2 colunas, 3 cards (D16), nenhum abre a conversa: "Investir" ("Conheça os produtos", abre `/investir`), "Resgatar" ("Veja quando o dinheiro cai", abre `/carteira`) e "Atendimento" na linha inteira (abre `/atendimento`, com o horário vindo do servidor). "Transferir" saiu: não há fluxo. O subtítulo do Figma "Escolha valor e produto" virou "Conheça os produtos": não há aplicação.
6. **Alocação** (`AlocacaoBarra.vue`): barra empilhada e legenda com nome, % e valor de `conta.alocacao`.
7. **Próximos passos:** card educativo com o selo "Conteúdo educativo, não é recomendação", que leva a Aprender. O card "Falar com uma pessoa" saiu (D16): a pessoa fica na aba Atendimento.

### Carteira (`carteira.vue`), sem nó (D16)
Em andamento, posições e operações de `GET /api/chat/:sessaoId/conta`. `PosicaoCard` mostra o prazo de resgate calculado no servidor ("Se pedir o resgate agora, o dinheiro cai hoje, 18/11", "Em carência: o resgate fica liberado em…" ou "Sem resgate antes do vencimento…") com a fonte KB-006. `OperacaoLinha` não mostra mais "previsto" (a coluna `liquidacao_prevista` contradiz a regra 1).

### Investir (`investir.vue`), sem nó (D16)
Selo educativo, card marfim "Quer saber onde investir?" com "Pedir um especialista" (registra o pedido e mostra o protocolo, KB-029) e os produtos de `GET /api/investir` na ordem dos dados: rentabilidade, resgate, imposto e "Como funciona (KB-xxx)", que abre o artigo ali mesmo.

### Aprender (`aprender.vue`), sem nó (D16)
Selo educativo e quatro temas de `GET /api/aprender`, cada um com `UAccordion` de artigos. `ArtigoLeitura.vue` mostra parágrafos, listas e tabelas sem `v-html`, com "Fonte: KB-xxx · revisado em dd/mm/aaaa".

### Atendimento (`atendimento.vue`), nós 51:169 e 51:332 (feito, D13)
Uma página, dois estados; tudo vem de `GET /api/chat/:sessaoId/atendimento`, com o estado pelo relógio do servidor. Os pedidos vão a `POST /api/chat/:sessaoId/pedidos` (D16) e a página mostra o texto e o protocolo que voltam.
1. **Título:** "Atendimento" + "Pergunte à Kaki ou encontre a resposta aqui. Você não precisa repetir o que já contou."
2. **Pergunte à Kaki:** campo com rótulo visível "Sua dúvida" (o Figma não tem; a regra de acessibilidade pede) e as três primeiras sugestões do chat. É o único caminho que começa uma conversa.
3. **Segurança 24h, sem fila** (`bg-error/10`): "Falar com a segurança agora" registra o pedido (`seguranca_imediata`) e mostra o protocolo e os passos da KB-020. Sem "Bloquear meu acesso".
4. **Especialista:** "Quer saber onde investir?" com a fonte da busca (KB-029) e "Pedir um especialista". O card "Uma pessoa pode te atender agora" do Figma saiu (D17).
5. **Minhas conversas:** só com casos; `UBadge` "Respondido" (success) ou "Em andamento" (neutral). Sem "Ver todas": não há tela de conversas antigas.
6. **Perguntas frequentes:** `UAccordion`; o toque abre o artigo da base na própria página.
7. **Linha discreta no fim (D17):** "Não encontrou o que precisava?" e o link sublinhado "Prefere falar com uma pessoa?", com o horário e o retorno em `text-xs text-muted`. Registra o pedido na página; no horário aparece "Abrir conversa" para acompanhar a resposta da pessoa. Sem espera estimada.

Fora do corte: "Fazer uma reclamação" e "Encerrar minha conta". Ícones do Figma são os Lucide equivalentes (`sparkles`, `send`, `shield-alert`, `calendar`, `chevron-right`, `circle-check`, `info`).

### Conversa (`conversa.vue`, `ChatMensagem.vue`), nós 54:413 a 54:593
- **Cabeçalho:** "Atendimento Caqui", protocolo quando houver, e o selo de horário da pessoa. Sem botão "Falar com uma pessoa" (D17).
- **Oferta de pessoa (D17):** botão "Falar com uma pessoa" (fora do horário, "Registrar minha demanda") logo abaixo da resposta em que a Kaki não sabe ou não entendeu pela segunda vez, quando a mensagem traz `oferecerHumano`. Nunca como sugestão.
- **Autor identificado:** "Kaki · assistente com IA" (ícone `i-lucide-sparkles`), "{nome} · pessoa da Caqui", cliente à direita em `bg-primary text-inverted`.
- **Fonte:** `FonteChip` neutro com borda: "Fonte: KB-006". Sai o badge azul.
- **Status dentro da conversa:** se a mensagem tem fonte do tipo operação e a operação está em `conta.operacoes`, mostrar abaixo dela um card com status e data prevista (dado do servidor, sem cálculo).
- **Golpe** (`acao === 'seguranca_imediata'`): balão vira bloco `bg-error text-inverted` com título "Pare: isso é golpe", passos, botões "Falar com a segurança agora" e "Bloquear meu acesso", e "Sua pergunta ficou salva no protocolo {n}". `role="alert"`.
- **"Isso resolveu sua dúvida?"** depois da última resposta da Kaki: "Sim, resolveu" / "Não resolveu". Exige endpoint (ver seção 3); se um "não" passar a oferecer a pessoa, entra na regra da D17 pelo servidor.
- **Transferência:** o `UAlert` de protocolo vira `TransferenciaCard` dentro da conversa, com protocolo, status e espera; fora do horário, "Atendimento volta às 8h" com protocolo.
- Manter: sugestões, "Kaki está escrevendo…", controles da demonstração.

### Suporte (`suporte.vue`, `CasoCard.vue`), nó 55:568
- Layout de três colunas no desktop: fila (360px) · conversa · contexto (380px). KPIs viram filtros no topo da fila ("Todos", "Golpe", "60+").
- `CasoCard`: badge de prioridade com texto (Segurança 24h / Prioridade 60+ / Recomendação / demais), nome, protocolo, motivo e espera. Selecionado com fundo `bg-marfim-300`.
- Coluna da conversa: histórico com eventos de triagem e escalonamento como linhas de sistema ("10:31 · Escalonado: pedido explícito do cliente").
- Coluna de contexto: cliente (CPF mascarado), motivos (`motivosTexto`), resumo (`resumo`), fontes, e o registro de resolução.
- "Resposta sugerida" do Figma: **só com endpoint** (seção 3). Sem ele, fica de fora.

## 3. Lacunas de dados (servidor primeiro, com teste)

A tela não calcula regra. Estas mudanças são no servidor:

| Para | Falta | Onde |
| --- | --- | --- |
| Em andamento: etapas e motivo da data | feito: `emAndamento[]` com `etapas[]` (o motivo vai no `detalhe` do pedido) | `server/domain/account-view.ts` usando `settlement.ts` |
| Rendimento bruto total | feito: `patrimonioCentavos`, `resultadoCentavos`, `resultadoPercentual` | `account-view.ts` |
| Alerta de calendário | feito: `avisos[]` (feriado nos próximos 5 dias úteis) | `account-view.ts`, puro, sobre o calendário |
| Espera na transferência para o cliente | `esperaEstimadaMin` em `CasoResumo` | `case-service.ts` |
| "Isso resolveu?" | `POST /api/chat/:sessaoId/avaliacao` | sessão |
| Resposta sugerida ao atendente | `GET /api/suporte/casos/:id/sugestao` (redator LLM com as mesmas fontes) | application + llm |

Se não der tempo, a tela mostra só o que já vem da API e o card correspondente não aparece. Não inventar valor.

## 4. Critérios de aceite

- [ ] Nenhum `slate-`, `emerald-`, `orange-` ou hex em `app/components` e `app/pages` (`grep -rnE "slate-|emerald-|orange-|#[0-9a-fA-F]{6}" app/components app/pages` vazio).
- [ ] Títulos em Manrope, resto em Inter.
- [ ] Contraste: nenhum texto em `text-dimmed` com informação; limite de campo visível.
- [ ] Atendimento a um toque em toda tela do cliente (aba no rodapé ou item do menu); pessoa só na linha discreta do `/atendimento` e na resposta da Kaki que não resolve (D17).
- [ ] Golpe toma a mensagem com `role="alert"`.
- [ ] Toda resposta factual da Kaki com `FonteChip`.
- [ ] Teclado: tab por todas as ações com foco visível.
- [ ] "Letra grande" ligado não quebra layout em 390px.
- [ ] `pnpm test` e `pnpm typecheck` verdes; BDD e diagramas atualizados se o comportamento mudou (CLAUDE.md).

## 5. Para o DECISIONS.md

```markdown
## D12. Identidade visual da Caqui (Design System v0.4) no lugar do tema laranja

- **Contexto:** A Kaki nasceu com laranja-caqui sobre slate. O grupo fechou uma identidade (Deep Moss, Ivory, Leafy, Osmanthus Orange; Manrope + Inter) com Design System no Figma.
- **Alternativas consideradas:** (a) manter o laranja como primária; (b) adotar a v0.4 como está; (c) adotar a v0.4 com as correções de contraste do Figma.
- **Escolha:** (c). Primária moss, laranja só como acento e "em andamento", neutros esverdeados, borda de campo e texto secundário que passam WCAG AA. Tokens em `app/assets/css/main.css` e `app/app.config.ts`.
- **Por quê:** Laranja com texto branco fica no limite de contraste e compete com alerta; a marca pede confiança e calma para quem vem da poupança. As correções evitam três falhas da v0.4 (borda de campo 1,25:1, foco laranja 2,5:1 sobre ivory, neutral.400 em texto).
- **O que reabriria:** Wordmark final, modo escuro desenhado e teste com pessoas 60+.
```
