# Prompts para o Cursor, em ordem

Um prompt por vez. Depois de cada um: `pnpm test`, `pnpm typecheck`, abrir a tela em 390px e 1440px e comparar com o nó do Figma. Se o Cursor tiver o MCP do Figma, cole o link do nó junto do prompt.

---

### 1. Tema

> Leia `CLAUDE.md`, `documentation/FIGMA_HANDOFF.md` e `.cursor/rules/design-system.mdc`. Os arquivos `app/assets/css/main.css` e `app/app.config.ts` já têm a identidade nova. Troque em `app/layouts`, `app/components` e `app/pages` toda cor fixa (`slate-*`, `emerald-*`, `white`, hex) pelos tokens do Nuxt UI (`bg-default`, `bg-muted`, `text-muted`, `border-default`, `bg-success`...). Não mude comportamento nem textos. Mostre o diff por arquivo e rode o grep do critério de aceite.

### 2. Layout e marca

> Figma: página 03 Components (Navigation) e nó 50:3. Ajuste `AppLogo.vue` para o wordmark "caquí" em Manrope 600 na cor primary. No `AppMenu`, item ativo com `bg-marfim-300` e `aria-current="page"`. Em telas < 768px, troque a gaveta por uma barra inferior com Início e Conversa (ícone + rótulo, alvo 44×44). Não crie destinos que não existem.

### 3. Servidor para o Início (antes da tela)

> Em `server/domain/account-view.ts`, inclua na conta `rendimentoBrutoCentavos` e, para cada operação em andamento, `etapas` e `motivoData` usando `settlement.ts` e `calendar.ts`. Funções puras, com teste que falha se a regra quebrar. Atualize `app/types.ts`. Não mude a tela ainda.

### 4. Início

> Figma: nó 50:3. Reescreva `app/pages/inicio.vue` na ordem da seção 2 do FIGMA_HANDOFF: saudação, `EmAndamentoCard` (novo), `ResumoPatrimonio` (novo, com "Ocultar valores" que esconde todos os valores, inclusive no texto acessível), ações, investimentos, últimas operações. Use só dados da API. Sem gráfico e sem seletor de período: não há série histórica.

### 5. Conversa

> Figma: nós 54:413, 54:490, 54:522, 54:593 e 51:169/51:332. Em `conversa.vue` e `ChatMensagem.vue`: autor identificado ("Kaki · assistente com IA"), `FonteChip` no lugar do badge azul, bloco de golpe com `role="alert"` e os dois botões, "Isso resolveu sua dúvida?" após a última resposta da Kaki, `TransferenciaCard` dentro da conversa (na fila / fora do horário), e "Falar com uma pessoa" no cabeçalho. Mantenha sugestões e controles da demonstração.

### 6. Suporte

> Figma: nó 55:568. Em `suporte.vue` e `CasoCard.vue`: três colunas no desktop (fila · conversa · contexto), filtros no topo da fila, badge de prioridade com texto, selecionado com `bg-marfim-300`, eventos de triagem como linhas de sistema na conversa, contexto com CPF mascarado, motivos, resumo e fontes. Sem "resposta sugerida" enquanto não existir endpoint.

### 7. Verificação

> Rode `pnpm test`, `pnpm typecheck` e `pnpm perguntas`. Liste os critérios de aceite do FIGMA_HANDOFF com ✅/❌ e o que falta. Confira com o teclado e com "Letra grande" ligado em 390px. Atualize BDD, diagramas e `DECISIONS.md` (D12) se algo mudou de comportamento. Não commite.
