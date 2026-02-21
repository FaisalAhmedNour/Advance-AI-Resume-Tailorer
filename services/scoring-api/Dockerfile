# ── Stage 1: deps ─────────────────────────────────────────────────────────────
FROM node:20-slim AS deps

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY services/scoring-api/package.json ./services/scoring-api/

RUN pnpm install --frozen-lockfile --filter scoring-api

# ── Stage 2: runner ────────────────────────────────────────────────────────────
FROM node:20-slim AS runner

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/services/scoring-api/node_modules ./services/scoring-api/node_modules

COPY services/scoring-api/src ./services/scoring-api/src
COPY services/scoring-api/package.json ./services/scoring-api/

WORKDIR /app/services/scoring-api

EXPOSE 3005
ENV PORT=3005
ENV NODE_ENV=production

CMD ["pnpm", "exec", "tsx", "src/index.ts"]
