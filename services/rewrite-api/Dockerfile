# ── Stage 1: build ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json ./
RUN npm install --frozen-lockfile
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ── Stage 2: runner ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev --frozen-lockfile
COPY --from=builder /app/dist ./dist
EXPOSE 3003
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
