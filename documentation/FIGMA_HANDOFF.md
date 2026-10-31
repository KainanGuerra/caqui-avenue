# Handoff do Figma para a Kaki

Arquivo: [Caqui Invest · Kit de UX de confiança](https://www.figma.com/design/tl9FFynv0PPlTdnLkGVPPb). Páginas: `00 Cover & Guidelines`, `01 Brand Foundations`, `02 Product Foundations`, `03 Components`, `04 Patterns & Templates`. O que está em `99 Arquivo` não vale.

Regras do agente: `.cursor/rules/design-system.mdc`. Tokens: `app/assets/css/main.css` e `app/app.config.ts`.

> Os valores nas telas do Figma são ilustrativos (Felipe, R$ 24.850,00). No código, os valores vêm da conta do cliente da sessão. O Figma define **estrutura, hierarquia e texto**; os números vêm do servidor.

## 1. Mapa de telas

| Tela no Figma | Nó | Arquivo | Estado hoje |
| --- | --- | --- | --- |
| Home · Mobile 390 | [50:3](https://www.figma.com/design/tl9FFynv0PPlTdnLkGVPPb/Caqui?node-id=50-3) | `app/pages/inicio.vue` | feita (D12): em andamento, visão geral, avisos, ações, alocação, próximos passos |
| Atendimento · 14h | [51:169](https://www.figma.com/design/tl9FFynv0PPlTdnLkGVPPb/Caqui?node-id=51-169) | `app/pages/conversa.vue` (topo) | chat direto, sem tela de entrada |
| Atendimento · 23h | [51:332](https://www.figma.com/design/tl9FFynv0PPlTdnLkGVPPb/Caqui?node-id=51-332) | idem, com `humanoDisponivel = false` | badge "Pessoa volta às 8h" |
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
- Mobile (< 768px): barra inferior com os destinos que existem hoje (Início e Conversa) em vez da gaveta. Carteira, Investir e Aprender **não** entram: não há telas para eles.

### Início (`inicio.vue`), nó 50:3 (feito, D12)
Ordem de cima para baixo; tudo vem pronto de `conta` (`GET /api/chat/:sessaoId/conta`):
1. **Saudação:** "Olá, {nome}" + "Veja como seu patrimônio mudou." (nunca "rendendo bem").
2. **Em andamento** (`EmAndamentoCard.vue`, fundo `bg-marfim-300`, layer 50:19, oculto no frame mas parte da tela): um card por item de `conta.emAndamento` (status `em_processamento`). Badge "Em processamento", "Seu resgate de {valor} cai hoje, {dd/mm}", etapas com estado feito/atual/próximo, fonte `KB-006 · {OP}` e "Ver detalhes do resgate" (abre a conversa com "Quando cai meu resgate?"). Sem a frase "não sumiu" (PT-03) e sem prometer aviso. Sem operação em andamento, o card não aparece.
3. **Visão geral** (`ResumoPatrimonio.vue`): `patrimonioCentavos`, "Ocultar valores" (estado só de tela, esconde todo valor da Home), "Atualizado em", Investido / Saldo disponível / Resultado desde a aplicação, e a nota de valores brutos com fonte. Sem seletor de período.
4. **Avisos** (`UAlert` warning) de `conta.avisos`; o alerta de protocolo aberto fica junto.
5. **O que você quer fazer?** (`AcaoRapida.vue`) 2 colunas: "Resgatar" (abre a conversa com "Quando cai meu resgate?") e "Falar com uma pessoa". Investir e Transferir ficam de fora: não existem neste corte.
6. **Alocação** (`AlocacaoBarra.vue`): barra empilhada e legenda com nome, % e valor de `conta.alocacao`.
7. **Próximos passos:** card educativo com o selo "Conteúdo educativo, não é recomendação" e o card de atendimento humano com a disponibilidade real.

`PosicaoCard` e `OperacaoLinha` saíram da Home; os componentes continuam no repositório.

### Conversa (`conversa.vue`, `ChatMensagem.vue`), nós 51:169 a 54:593
- **Cabeçalho:** "Atendimento Caqui", protocolo quando houver, e botão "Falar com uma pessoa" sempre visível no topo (sai do rodapé).
- **Autor identificado:** "Kaki · assistente com IA" (ícone `i-lucide-sparkles`), "{nome} · pessoa da Caqui", cliente à direita em `bg-primary text-inverted`.
- **Fonte:** `FonteChip` neutro com borda: "Fonte: KB-006". Sai o badge azul.
- **Status dentro da conversa:** se a mensagem tem fonte do tipo operação e a operação está em `conta.operacoes`, mostrar abaixo dela um card com status e data prevista (dado do servidor, sem cálculo).
- **Golpe** (`acao === 'seguranca_imediata'`): balão vira bloco `bg-error text-inverted` com título "Pare: isso é golpe", passos, botões "Falar com a segurança agora" e "Bloquear meu acesso", e "Sua pergunta ficou salva no protocolo {n}". `role="alert"`.
- **"Isso resolveu sua dúvida?"** depois da última resposta da Kaki: "Sim, resolveu" / "Não, falar com uma pessoa". O "não" envia "Quero falar com uma pessoa". Registrar o "sim" exige endpoint (ver seção 3).
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
- [ ] "Falar com uma pessoa" visível em `/inicio` e `/conversa`.
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
