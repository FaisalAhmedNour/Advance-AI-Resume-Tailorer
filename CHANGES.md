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
