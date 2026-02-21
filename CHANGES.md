# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2026-02-21
### Added
- Refactored repository into an `npm/pnpm workspaces` compliant microservice architecture.
- Scaffolded `parser-api`, `jd-analyzer-api`, `rewrite-api`, and `scoring-api` Node.js Express services with dedicated tests, controllers, types, and clients.
- Configured frontend Next.js App to utilize Pages Router (`index.tsx`, `results.tsx`) and separate UI components (`DiffViewer`, `ScoreCard`).
- Added robust local deployment orchestration using dedicated `Dockerfile` specifications per workspace and a unified `docker-compose.yml`.
- Added structural documentation: `architecture.md` (Mermaid diagram embedded) and `presentation-slides.md`.

## [1.0.0] - 2026-02-21
### Added
- Monorepo folder structure (`frontend`, `services`, `infra`, `docs`, `tests`).
- Next.js 15 App Router Frontend initialized with TypeScript.
- `resume-tailor` Node.js express API initialized with ES modules and TypeScript.
- robust `ai.client.ts` implementing concurrent queuing, rate limiting via p-queue equivalent custom, transparent retries, error sanitization, length validation.
- `express-rate-limit` guard deployed on `/api/v1/tailor`.
- Jest configuration implemented for unit testing the AI logic and mock integration tests, covering edge validations and transient retry flows.
- Documentation generated for root path and the `resume-tailor` microservice.

## [1.2.0] - 2026-02-21

### Added — Microservices

| Service | Port | Key files |
|---|---|---|
| `services/parser-api` | 3001 | `src/parser.service.ts`, `src/routes.ts` |
| `services/jd-analyzer-api` | 3002 | `src/ai.client.ts`, `src/schema.ts` |
| `services/rewrite-api` | 3003 | `src/ai.client.ts`, `src/rewrite.controller.ts` |
| `services/scoring-api` | 3005 | `src/scoring.service.ts` |
| `services/export-api` | 3006 | `src/pdf.service.ts`, `src/template.service.ts` |

### Added — Frontend

- `frontend/src/pages/index.tsx` — upload page with Demo Mode toggle, endpoint configurator, animated Stepper
- `frontend/src/pages/results.tsx` — Results page with ScoreCard, DiffViewer, PDF export
- `frontend/src/components/` — `ScoreCard.tsx`, `DiffViewer.tsx`, `KeywordHeatmap.tsx`, `Stepper.tsx`
- `frontend/src/lib/` — `types.ts` (shared TypeScript interfaces), `mockData.ts` (Demo Mode fixtures)

### Added — AI Prompt Templates

- `services/shared/prompt-templates.ts` — single source of truth for all Gemini system prompts
  - `REWRITE_SYSTEM_PROMPT` — 7-rule no-hallucination bullet rewriter (full) + compact short variant
  - `JD_SYSTEM_PROMPT` — structured JD extractor (full + short)
  - `EXPLAIN_SYSTEM_PROMPT` — ≤30-word rewrite rationale (full + short)
  - `PROMPT_VARIANT=short|full` env var switches all prompts at once
- `services/shared/README.md` — token-cost table and tweaking guide

### Added — Docker Infrastructure

- `services/*/Dockerfile` — per-service multi-stage Dockerfiles (2-stage Node.js; 3-stage for export-api with Playwright Chromium)
- `frontend/Dockerfile` — 3-stage Next.js build → slim production runner
- `docker-compose.yml` — `tailorer-net` bridge network, health checks, `depends_on: condition: service_healthy`
- `.dockerignore`
- `infra/.env.example` — all environment variables documented
- `infra/start-dev.sh` — build + start + status table + log tail

### Added — Sample Data & Evaluation

- `tests/sample_data/resumes/resume_01–05.txt` — 5 anonymized résumés (FinTech, Data, Frontend, DevOps, ML)
- `tests/sample_data/jds/jd_01–05.txt` — 5 matching job descriptions
- `scripts/evaluate.js` — end-to-end pipeline: parser→analyzer→rewrite→scoring; outputs `evaluation_results.csv`

### Added — HTML Resume Templates

- `services/export-api/templates/modern.html` — two-column navy sidebar, Inter font, blue accent
- `services/export-api/templates/classic.html` — single-column Georgia serif, ATS-safe

### Added — Documentation

| File | Contents |
|---|---|
| `README.md` | Quickstart, Mermaid architecture diagram, full API reference, evaluation results |
| `docs/presentation-slides.md` | 10-slide deck with speaker notes and demo appendix |
| `docs/demo-checklist.md` | T-30/T-20/T-10 pre-flight checklist + 3-minute verbatim demo script |
| `services/*/README.md` | Per-service cURL examples and endpoint reference |

---

### How to run all tests

```bash
# All services (Jest)
pnpm test

# Individual services
cd services/parser-api     && pnpm test
cd services/jd-analyzer-api && pnpm test
cd services/rewrite-api    && pnpm test
cd services/scoring-api    && pnpm test
cd services/export-api     && pnpm test   # launches real Playwright Chromium

# End-to-end evaluation pipeline (requires running services)
node scripts/evaluate.js
```

### How to start the full stack

```bash
# Docker (production-like, recommended for demos)
./infra/start-dev.sh

# Local dev (faster iteration)
cp infra/.env.example infra/.env   # then set GOOGLE_API_KEY
pnpm install
pnpm dev
```

