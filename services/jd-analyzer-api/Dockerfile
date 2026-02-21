# ── Stage 1: deps ─────────────────────────────────────────────────────────────
FROM node:20-slim AS deps

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY services/jd-analyzer-api/package.json ./services/jd-analyzer-api/

RUN pnpm install --frozen-lockfile --filter jd-analyzer-api

# ── Stage 2: runner ────────────────────────────────────────────────────────────
FROM node:20-slim AS runner

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/services/jd-analyzer-api/node_modules ./services/jd-analyzer-api/node_modules

COPY services/jd-analyzer-api/src ./services/jd-analyzer-api/src
COPY services/jd-analyzer-api/package.json ./services/jd-analyzer-api/

WORKDIR /app/services/jd-analyzer-api

EXPOSE 3002
ENV PORT=3002
ENV NODE_ENV=production

CMD ["pnpm", "exec", "tsx", "src/index.ts"]
