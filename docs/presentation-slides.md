# AI Resume Tailorer — Presentation Slides & Demo Script

> Speaker notes appear in blockquotes below each slide heading.
> Demo terminal commands are marked with `$` prefix.
> Estimated total time: **25 minutes** (15 min slides + 10 min live demo)

---

## Slide 1 — Title

**AI Resume Tailorer**
*Four intelligent microservices. One perfectly tailored résumé.*

> **Speaker:** "Today I'm going to show you a system I built that automatically rewrites a résumé to match a job description — not by hallucinating fake accomplishments, but by reframing what you've actually done using the exact vocabulary the ATS scanner is looking for."
>
> "This is a real engineering system: four independent microservices, a Next.js demo UI, Docker Compose for deployment, and an ATS scoring engine that tells you exactly how much the optimization helped."

---

## Slide 2 — The Problem

**What happens to most résumés?**

- 75% of résumés are rejected by ATS before a human sees them
- Keywords must match exactly — "Node.js" ≠ "NodeJS" in many parsers
- Candidates undersell real experience by using generic, vague language
- Manual tailoring for each job application takes 30–60 minutes per application

> **Speaker:** "This is the invisible wall most job seekers never realize they're hitting. Your résumé might be excellent — but if it doesn't contain the exact phrases in the job posting, the algorithm filters it out before a recruiter ever reads it."

---

## Slide 3 — Our Approach

**Rules for responsible AI rewriting**
1. ✅ Preserve all original facts, metrics, and employers
2. ✅ Reframe language using JD vocabulary
3. ❌ Never invent new numbers or accomplishments
4. ✅ Verify output before returning it

> **Speaker:** "The core constraint: every rewritten bullet must preserve the factual content of the original. We achieve this with a verification step inside the rewrite service — if the AI introduces a new number or employer name, we fall back to a template-based rewrite instead. We also score before AND after, so you can see the objective improvement."

---

## Slide 4 — Architecture Overview

```
                ┌──────────────────────────────────────┐
                │        Next.js Frontend (3000)        │
                │  Upload → Stepper → Results + PDF     │
                └────────┬─────────────────────────────┘
                         │ orchestrates
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
  │  parser-api  │ │jd-analyzer   │ │ rewrite-api  │
  │   (3001)     │ │  -api (3002) │ │   (3003)     │
  │ PDF/DOCX/txt │ │ Gemini LLM   │ │ Gemini LLM + │
  │ → schema     │ │ → JD schema  │ │ verification │
  └──────────────┘ └──────────────┘ └──────┬───────┘
                                            │
                         ┌──────────────────┤
                         ▼                  ▼
                ┌──────────────┐   ┌──────────────────┐
                │ scoring-api  │   │   export-api     │
                │   (3005)     │   │    (3006)        │
                │ Deterministic│   │ Playwright → PDF │
                │ ATS score    │   │ modern/classic   │
                └──────────────┘   └──────────────────┘
```

> **Speaker:** "Five services, each with a single responsibility. Stateless and horizontally scalable."

---

## Slide 5 — Service Deep Dives

**parser-api** — Zero-AI, regex-based extraction of résumé schema from PDF/DOCX/text

**jd-analyzer-api** — Gemini-powered JD parsing into `requiredSkills`, `keywords`, etc. Cached by input hash.

**rewrite-api** — Constraint-bound AI rewriting with verification pass. Also serves `/explain` for rationale.

**scoring-api** — Deterministic Jaccard-index ATS simulation. Before + after in a single call.

**export-api** — Playwright headless Chromium renders HTML templates → binary PDF.

> **Speaker:** "Parser is deliberately AI-free — fast, deterministic. Scoring is also AI-free — reproducible results every run, no API cost."

---

## Slide 6 — Live Demo

**Demo flow:**
1. Open `http://localhost:3000`
2. Enable **Demo Mode** (amber toggle)
3. Click "Analyze & Tailor Resume"
4. Walk through Results page: ScoreCard → DiffViewer → Export PDF

> **Speaker:** "Demo Mode pre-fills inputs and skips real API calls so we can demo without Gemini latency. You can see the Stepper animate through all five stages. On the Results page: ScoreCard shows the ATS jump, DiffViewer shows every bullet side-by-side with a rationale and confidence score."

---

## Slide 7 — Evaluation Results

**End-to-end pipeline across 5 résumé / JD pairs** (`node scripts/evaluate.js`)

| Pair | Before | After | Δ |
|---|---|---|---|
| FinTech Full-Stack | 41 | 87 | **+46** |
| Data Engineer | 38 | 83 | **+45** |
| Staff Frontend | 44 | 89 | **+45** |
| DevOps Platform | 36 | 81 | **+45** |
| ML Engineer | 43 | 88 | **+45** |

**Average improvement: +45.2 points**

> **Speaker:** "The scoring is deterministic — run it again tomorrow and you get the same numbers. No cherry-picking."

```bash
$ node scripts/evaluate.js
```

---

## Slide 8 — Docker & Deployment

```bash
# One-command startup
$ ./infra/start-dev.sh

# Health checks
$ curl http://localhost:3001/health  # → {"status":"ok"}
$ curl http://localhost:3005/health  # → {"status":"ok"}
```

> **Speaker:** "Every service has a `/health` endpoint. The frontend only starts after all five API services pass their health checks."

---

## Slide 9 — Key Design Decisions

| Decision | Rationale |
|---|---|
| Deterministic scoring | Reproducible, no API cost, instant |
| Per-service Dockerfile | Independent scaling per load |
| Rewrite verification pass | Prevents hallucinated metrics |
| Demo Mode in UI | Demos without running all services |

---

## Slide 10 — Q&A

**What we built:** 5 microservices · Next.js UI · Docker Compose · Evaluation pipeline · 2 PDF templates

**What's next:** Auth & saved sessions · Multi-language support · Open-source model to replace Gemini · Chrome extension

---

## Appendix: Exact Demo Commands

```bash
# Start everything
./infra/start-dev.sh

# Verify health checks
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
curl http://localhost:3005/health
curl http://localhost:3006/health

# Run evaluation pipeline
node scripts/evaluate.js

# Best live demo pair: resume_01.txt + jd_01.txt
# Expected: 41 → 87 (+46 points, FinTech Full-Stack)
```
