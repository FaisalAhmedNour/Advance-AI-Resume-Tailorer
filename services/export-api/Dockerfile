# ── Stage 1: deps ─────────────────────────────────────────────────────────────
FROM node:20-slim AS deps

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY services/export-api/package.json ./services/export-api/

RUN pnpm install --frozen-lockfile --filter export-api --ignore-scripts

# ── Stage 2: browser install ───────────────────────────────────────────────────
# Playwright requires system-level Chromium dependencies on Debian/Ubuntu.
# We install them here in a dedicated stage to keep layers cacheable.
FROM node:20-slim AS browser-deps

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# System dependencies required by Playwright/Chromium
RUN apt-get update && apt-get install -y --no-install-recommends \
    libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 \
    libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 \
    libxfixes3 libxrandr2 libgbm1 libasound2 \
    libpango-1.0-0 libcairo2 libx11-xcb1 \
    fonts-liberation wget ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/services/export-api/node_modules ./services/export-api/node_modules

# Install Playwright Chromium browser binary
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
RUN ./node_modules/.bin/playwright install chromium

# ── Stage 3: runner ────────────────────────────────────────────────────────────
FROM node:20-slim AS runner

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy system libs from browser-deps stage
RUN apt-get update && apt-get install -y --no-install-recommends \
    libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 \
    libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 \
    libxfixes3 libxrandr2 libgbm1 libasound2 \
    libpango-1.0-0 libcairo2 libx11-xcb1 \
    fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/services/export-api/node_modules ./services/export-api/node_modules

# Copy Playwright browser binary
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
COPY --from=browser-deps /ms-playwright /ms-playwright

COPY services/export-api/src ./services/export-api/src
COPY services/export-api/templates ./services/export-api/templates
COPY services/export-api/package.json ./services/export-api/

WORKDIR /app/services/export-api

EXPOSE 3006
ENV PORT=3006
ENV NODE_ENV=production

CMD ["pnpm", "exec", "tsx", "src/index.ts"]
