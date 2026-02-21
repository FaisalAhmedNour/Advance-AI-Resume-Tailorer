# ── Stage 1: deps ─────────────────────────────────────────────────────────────
FROM node:20-slim AS deps

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace root manifests for dependency resolution
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY package.json ./

# Copy only THIS service's package.json
COPY services/parser-api/package.json ./services/parser-api/

RUN pnpm install --frozen-lockfile --filter parser-api

# ── Stage 2: runner ────────────────────────────────────────────────────────────
FROM node:20-slim AS runner

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/services/parser-api/node_modules ./services/parser-api/node_modules

COPY services/parser-api/src ./services/parser-api/src
COPY services/parser-api/package.json ./services/parser-api/

WORKDIR /app/services/parser-api

EXPOSE 3001
ENV PORT=3001
ENV NODE_ENV=production

CMD ["pnpm", "exec", "tsx", "src/index.ts"]
