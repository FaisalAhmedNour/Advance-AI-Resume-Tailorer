# ── Stage 1: deps ─────────────────────────────────────────────────────────────
FROM node:20-slim AS deps

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY services/rewrite-api/package.json ./services/rewrite-api/

RUN pnpm install --frozen-lockfile --filter rewrite-api

# ── Stage 2: runner ────────────────────────────────────────────────────────────
FROM node:20-slim AS runner

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/services/rewrite-api/node_modules ./services/rewrite-api/node_modules

COPY services/rewrite-api/src ./services/rewrite-api/src
COPY services/rewrite-api/package.json ./services/rewrite-api/

WORKDIR /app/services/rewrite-api

EXPOSE 3003
ENV PORT=3003
ENV NODE_ENV=production

# Both /rewrite and /explain routes are served from this container
CMD ["pnpm", "exec", "tsx", "src/index.ts"]
