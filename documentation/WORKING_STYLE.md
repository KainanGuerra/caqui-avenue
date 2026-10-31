# Estilo de trabalho

Mapa de como eu trabalho, tirado de três projetos: **desafio-tecnico** (o mais recente e o principal), **retail/v2** e **carga-cupom**. Cada ponto cita onde foi observado. As fontes ficam em `~/Documentos/fiap/projetos/desafio-tecnico` (DT), `~/Documentos/rihappy/retail/v2` (R2) e `~/Documentos/rihappy/wms/carga-cupom` (CC). O guia escrito é o [`style-guide/`](style-guide/README.md).

## Backend

- **Camadas como pastas**, sem framework mágico: Domain → Application → Infrastructure → Endpoints. DT: `repositories/orders-api/src/modules/<modulo>/{controllers,services,repository,dto,clients,domain}`. R2: `retail-orders/src/modules/orders/{controllers/v1,services,repository,entity,dto}`. CC: `internal/<area>/<dominio>/{entities,handlers,repositories,services}`.
- **Composition root explícito e injeção por construtor.** DT: `app.module.ts` e `orders.module.ts`, gateways como tokens (`CATALOG_GATEWAY`, `IDENTITY_GATEWAY`) atrás de interface. R2: `OrderSource` atrás de interface. CC: tudo montado à mão no `main.go`.
- **Regras puras em `domain/`**: entra dado, sai dado, sem I/O. DT: `order-rules.ts`, `order-status.ts`. Mudou a regra, mudam o teste e a documentação juntos.
- **Controllers finos**; o serviço decide, o repositório não tem regra.
- **Dinheiro em centavos inteiros** (DT, R2). Desconto em pontos-base no DT.
- **Validação na borda**: Zod com o pipe nativo do Nest no DT; class-validator no R2. Variáveis de ambiente validadas no boot, `.env.example` commitado.
- **Erros**: exceções do Nest no DT e no R2; valores de retorno em Go no CC. Índice único no banco é o guarda real contra corrida (DT: `UPDATE ... WHERE status = ...`).
- **Comunicação**: gRPC síncrono e RabbitMQ para eventos, consumidores idempotentes, fila com nome explícito e `.dlq` (DT).
- **Seguro por padrão**: escrita e workers desligados (`NUPAY_SCHEDULER_ENABLED=false` no CC; `all writes off` no compose real do R2); o dev nunca toca produção (o compose do CC sobrescreve `MONGO_URI`); segredo só por ambiente.
- **Testes** ao lado do código (`*.spec.ts`), fakes escritos à mão (DT: `FakeOrdersRepository`), títulos em frase, casos de borda. Teste de repositório contra Postgres real via `TEST_DATABASE_URL`. **Mutation check manual**: quebro o código de propósito para ver o teste falhar (DT, `TESTING.md`). CC: testes de tabela só da lógica pura.
- **Logs**: JSON estruturado com `traceId` (R2, `15-logs-e-rastreamento.md`).

## Frontend

- **DT:** Nuxt 4 (SSR desligado), Nuxt UI, Pinia, TanStack Query, PWA. **R2:** React 19, Vite, Mantine, TanStack Query, react-router.
- **Estado do usuário separado do estado de servidor.** DT: Pinia guarda só o que o vendedor digitou (`stores/order.ts`); TanStack Query guarda o que vem do servidor (`useCalculation`, `useProductSearch`), com `keepPreviousData`.
- **A tela nunca calcula regra de negócio**; só exibe e envia intenção (DT, D4).
- **BFF fino** (DT): `server/api/**` com um handler por rota, valida com Zod, repassa com o cabeçalho de autenticação interna; sessão em cookie opaco com Redis.
- **Chaves de query centralizadas** (R2: `queries/keys.ts`, `qk.orders.list(...)`); um arquivo de API por serviço (`api/*.api.ts`).
- **Nomes**: componentes PascalCase, composables/hooks `useX`. **Textos de UI em pt-BR, código e commits em inglês.**
- **Testes**: unitários em utils, stores e schemas (`test/*.spec.ts`); não há teste de componente nem e2e no DT.

## Documentação e decisões

- Pasta `documentation/` organizada por intenção de leitura; arquivos `UPPER_SNAKE.md`; diagramas Mermaid, um por arquivo, com a última linha "Referenciado em ... §N"; links relativos (DT, `CLAUDE.md`).
- Na raiz: `README.md`, `DECISIONS.md`, `ASSUMPTIONS.md`, `AI_LOG.md`, `CLAUDE.md`.
- **DECISIONS.md** cronológico e só de acréscimo: Contexto, Alternativas, Escolha, Por quê, O que faria diferente / reabriria. Correção vira entrada nova que cita a antiga. **ASSUMPTIONS.md** registra cada ambiguidade e a interpretação adotada.
- **Mudou o comportamento, muda o documento no mesmo commit.** Nunca escrevo o total de decisões como número.
- **Plano e perguntas em aberto antes do código** (CC: `docs/plan/04-open-questions.md`; DT: D1 escrita antes de qualquer código). Pendências e riscos ficam numa tabela honesta (R2: `14-pendencias-e-riscos.md`).
- Comentários dizem o porquê e citam a decisão.

## Git

- Conventional Commits com escopo, em inglês e minúsculos: `feat(orders): ...`, `fix(requests): ...`, `docs(sac): ...` (R2, DT).
- Commits pequenos, com o documento junto. Branches `feat/*`, `fix/*`, `docs/*`.
- DT: última linha do commit `IA: nenhuma|parcial|majoritária`; sem `Co-Authored-By`. Hook global em `~/.githooks` bloqueia segredo.

## Devops

- Dockerfile multi-stage em `node:24-alpine`, dependências antes do código, `USER node` (DT); Go com alvo `dev` (air) e imagem final distroless (CC).
- Compose com `${VAR:?mensagem}` e dependências com healthcheck; segundo arquivo para dev (DT, R2).
- CI único no DT (`.github/workflows/ci.yml`: lint, typecheck, test, build, publish no GHCR). Bitbucket Pipelines por repositório no R2.
- pnpm via corepack com scripts de instalação negados (DT); oxlint e prettier (aspas simples, vírgula final).
- README com tabela de serviços, como rodar e uma seção de "pegadinhas" (sintoma, causa, correção), como no CC.

## Como trabalho com IA

- Eu decido a arquitetura e dirijo por prompts; a IA desenvolve, testa e verifica as regras (DT, `CLAUDE.md`).
- Uma pergunta por vez, sem jargão; quero código que eu consiga explicar e defender.
- Todo teste precisa falhar quando o código quebra.
- Sou honesto sobre o que li e o que não li; `AI_LOG.md` guarda os momentos em que a IA errou e o mapa de autoria.

## Prática versus guia

O guia foi gerado por IA a partir dos meus projetos antigos (DT, `AI_LOG.md`), então parte dele é aspiração. Divergências observadas, para decidir o que levar ao caqui-invest:

| Guia diz | Prática |
|---|---|
| Sem pacote compartilhado em runtime | DT usa um pacote `contracts` instalado com `file:../contracts` (D18, D24, D26) |
| Um repositório por serviço | DT é monorepo com um CI e um compose (D60) |
| JWT e `PermissionsGuard` | DT usa BFF com sessão e autenticação interna (D11, D16, D28, D30); R2 usa JWT e permissões `recurso:ação` |
| Envelope `{success, data}`, `traceId`, `/version`, `x-request-id` | R2 tem envelope e `traceId`; no `orders-api` do DT não encontrei esses itens (não conferi os outros serviços) |
| Testcontainers | DT usa Postgres real via variável de ambiente |
| Imagem final enxuta | DT roda em `node:24-alpine`; só o CC usa distroless |
| Documentação em pares `.en-US`/`.pt-BR` | DT é só pt-BR |

Limites desta leitura: li o `orders-api` e o `web` do DT e o `retail-orders` e o `retail-web` do R2 como amostras; não li cada serviço nem cada decisão.
