# Kaki: atendimento da Caqui Invest

Agente de atendimento para o Hands On com IA (31/10/2026): **o código decide, o LLM só redige.** Duas visões ligadas pelo mesmo caso: o chat do cliente e o painel do suporte. Tudo é fictício; o case, os dados e o checador estão em `caqui-invest/` (só consulta).

- **Visão do cliente** (`/`): escolhe um cliente simulado e conversa com a Kaki. Fonte em cada resposta factual, botão "Falar com uma pessoa" sempre visível, protocolo à vista, letra grande, simulador de horário.
- **Visão do suporte** (`/atendente`): fila ordenada (golpe, 60 anos ou mais, demais), motivos da decisão, resumo, fontes, conversa; assumir, responder e resolver. A resposta aparece no chat do cliente.

Spec: [SPEC.md](SPEC.md) · Decisões: [DECISIONS.md](DECISIONS.md) · BDD: [documentation/bdd](documentation/bdd/README.md) · Jornada: [documentation/JORNADA_DO_USUARIO.pdf](documentation/JORNADA_DO_USUARIO.pdf)

## Como rodar (local)

Requer Node 24 e pnpm via corepack.

```bash
corepack pnpm install
cp .env.example .env     # opcional: os padrões funcionam sem LLM
corepack pnpm dev        # http://localhost:3000
```

Sem LLM, as respostas vêm dos templates (modo `template`). Para usar um modelo, defina `LLM_PROVIDER` (`anthropic` ou `openai`, esta compatível com qualquer servidor de chat completions), `LLM_API_KEY` e `LLM_MODEL`; `UNDERSTANDING_LLM=true` liga o entendimento com LLM, que só pode subir alertas. A chave nunca vai para o repositório (`.env` é ignorado). Defina `ATENDENTE_PIN` para proteger o painel.

## Rodar com Docker Compose

```bash
docker compose up --build        # http://localhost:3000
```

Sem `.env` o agente sobe no modo template e com o painel de suporte aberto. As variáveis do `.env.example` (`LLM_*`, `ATENDENTE_PIN`, `RELOGIO`, `PORT`) são lidas pelo compose. Os dados do case entram como volume somente leitura (`./caqui-invest/dados`), nunca dentro da imagem; o container roda como usuário não root, com o sistema de arquivos em modo leitura e `healthcheck` em `/api/saude`. Parar: `docker compose down`.

### Com hot reload

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build   # http://localhost:3000
```

`app/`, `server/` e a configuração do Nuxt são montados do host: salvar um arquivo recarrega o servidor (mudança em `server/`) e atualiza a tela sem recarregar a página (mudança em `app/`, via HMR). As dependências ficam na imagem; depois de mudar o `package.json`, rode de novo com `--build`. Se o hot reload não perceber mudanças (Docker Desktop, WSL), defina `CHOKIDAR_USEPOLLING=true` no `.env`. As sessões e a fila em memória zeram quando o servidor reinicia por causa de uma mudança em `server/`.

## Conferir

```bash
corepack pnpm test            # testes de unidade e de ponta a ponta do pipeline
corepack pnpm typecheck
corepack pnpm perguntas       # grava respostas.jsonl com as 40 perguntas de teste
python3 caqui-invest/ferramentas/checar_respostas.py respostas.jsonl
corepack pnpm avaliar-sinais  # recall e precisão da detecção em conversas.csv
```

## Estrutura

```
server/domain/          regras puras: calendário, liquidação, IR, poupança, horário, sinais, política, base de conhecimento
server/application/     pipeline, plano de resposta, validador, casos
server/infrastructure/  dados, relógio, log, stores em memória, adaptadores de LLM
server/api/             rotas (cliente e suporte)
app/                    telas Vue (cliente e suporte)
documentation/          BDD, diagramas, style-guide, PDFs
scripts/                perguntas de teste, avaliação de sinais, geração do PDF
```

## Limites

Sem URL pública (D6), sessões e fila em memória, atendente humano simulado, entendimento com LLM não exercitado com provedor real. A espera estimada é simulada.

## Como usamos IA

Ver [COMO-USAMOS-IA.md](COMO-USAMOS-IA.md) e [AI_LOG.md](AI_LOG.md).
