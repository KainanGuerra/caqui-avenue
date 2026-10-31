# Imagem do agente Kaki (Nuxt/Nitro). Os dados do case NÃO entram na imagem: o compose os monta somente leitura.
# Estágio 1: dependências. Só os manifestos entram aqui, para o cache sobreviver a mudanças de código.
FROM node:24-alpine AS deps
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# --ignore-scripts: o binário do esbuild vem como dependência opcional; o "nuxt prepare" roda no estágio de build.
RUN pnpm install --frozen-lockfile --ignore-scripts

# Desenvolvimento com hot reload (docker-compose.dev.yml): dependências na imagem, código montado do host.
FROM node:24-alpine AS dev
RUN corepack enable && mkdir /app && chown node:node /app
USER node
WORKDIR /app
ENV HOME=/home/node HOST=0.0.0.0 PORT=3000 DADOS_DIR=/dados
COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts
EXPOSE 3000
CMD ["pnpm", "exec", "nuxt", "dev", "--host", "0.0.0.0", "--port", "3000"]

# Estágio 2: build. O Nitro empacota as dependências do servidor em .output.
FROM deps AS build
COPY nuxt.config.ts tsconfig.json ./
COPY app ./app
COPY server ./server
RUN pnpm exec nuxt build

# Estágio 3: execução, sem node_modules nem código-fonte, como usuário não root.
FROM node:24-alpine AS runtime
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000 DADOS_DIR=/dados
WORKDIR /app
COPY --from=build /app/.output ./.output
# Dados fictícios na imagem: hospedagem sem volume (Render) precisa deles aqui. O compose os monta por cima, somente leitura.
COPY data /dados
USER node
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 CMD wget -qO- http://127.0.0.1:3000/api/saude || exit 1
CMD ["node", ".output/server/index.mjs"]
