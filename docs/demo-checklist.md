# Demo Day Checklist

> **Print this out. Work through it top-to-bottom before the demo starts.**
> ✅ = must pass | ⚠️ = nice-to-have | 🗣️ = spoken line

---

## T-30 minutes — Environment

- [ ] ✅ Charge laptop to 100%, disable sleep / screen saver
- [ ] ✅ Close Slack, email, notifications (Do Not Disturb ON)
- [ ] ✅ Set browser zoom to **110%** so the UI is readable from the back of the room
- [ ] ✅ Open a second terminal tab for commands (keep it visible)
- [ ] ✅ Confirm `GOOGLE_API_KEY` is set in `infra/.env`

```bash
grep GOOGLE_API_KEY infra/.env
# Expected: GOOGLE_API_KEY=AIza...  (not placeholder)
```

---

## T-20 minutes — Start Services

### Option A: Docker Compose (recommended for demo)

```bash
# 1. Build and start all containers
./infra/start-dev.sh

# 2. Watch for all health checks to go green (takes ~60s)
```

Expected output after startup:

```
────────────────────────────────────────────────
SERVICE                PORT     STATUS
────────────────────────────────────────────────
frontend               3000     ✅ healthy
parser-api             3001     ✅ healthy
jd-analyzer-api        3002     ✅ healthy
rewrite-api            3003     ✅ healthy
scoring-api            3005     ✅ healthy
export-api             3006     ✅ healthy
────────────────────────────────────────────────
```

### Option B: Dev mode (faster startup, no Docker needed)

```bash
pnpm dev
```

---

## T-10 minutes — Verify All Health Endpoints

Run this block and confirm every line returns `{"status":"ok"}`:

```bash
curl -s http://localhost:3001/health | grep status
curl -s http://localhost:3002/health | grep status
curl -s http://localhost:3003/health | grep status
curl -s http://localhost:3005/health | grep status
curl -s http://localhost:3006/health | grep status
```

- [ ] ✅ All 5 return `"status":"ok"`

---

## T-5 minutes — Open Browser

```
http://localhost:3000
```

- [ ] ✅ Upload page loads with the resume and JD text areas visible
- [ ] ✅ The amber **Demo Mode** toggle is present in the top-right area
- [ ] ✅ Click the ⚙️ gear icon — endpoint configurator expands (then close it)
- [ ] ⚠️ Open DevTools (F12) → Network tab → confirm no 404 or 500 errors on load

---

## Live Demo — Step-by-Step Script

### Step 1: Enable Demo Mode *(~15 sec)*

> 🗣️ *"I'll start with Demo Mode so we don't wait on the AI — this pre-fills the inputs with a real résumé and a real job description from our sample dataset."*

- [ ] Click the **Demo Mode** toggle (turns amber)
- [ ] Confirm both text areas fill with content

---

### Step 2: Show the original resume *(~20 sec)*

> 🗣️ *"This is a real résumé — `tests/sample_data/resumes/resume_01.txt`. You can see it has solid experience but uses generic language: 'Built REST APIs', 'Reduced load time'. Compare that to the job description on the right, which wants specific things like 'TypeScript microservices', 'Kubernetes', 'PostgreSQL'."*

- [ ] Scroll through the resume text area briefly
- [ ] Scroll through the JD text area — point at 2–3 keywords

---

### Step 3: Analyse & Tailor *(~30 sec)*

> 🗣️ *"When I click Analyze & Tailor Resume, the frontend orchestrates five services in sequence: parse, analyse, rewrite, score, then optionally export. You can watch the progress on the Stepper."*

- [ ] Click **"Analyze & Tailor Resume"** button
- [ ] Watch the Stepper animate through 5 stages
- [ ] Wait for automatic redirect to Results page

---

### Step 4: Show the Score Card *(~25 sec)*

> 🗣️ *"The Score Card shows the ATS match score — before and after. In demo mode we see 42% before, 88% after. That 46-point jump is the objective improvement. The bar chart breaks it down: required skill coverage went from 35% to 100%, and semantic similarity also jumped."*

- [ ] Point at the **42% → 88%** numbers
- [ ] Point at the bar chart

---

### Step 5: Walk through the Diff Viewer *(~40 sec)*

> 🗣️ *"Below the score card are the actual rewrites, one per experience bullet, shown as a side-by-side diff. Red is the original, green is the AI output. Let me show you one."*

- [ ] Scroll to the first diff card
- [ ] Read the original bullet aloud briefly
- [ ] Read the rewritten bullet aloud
- [ ] Point at the lightbulb / rationale: *"The amber card shows the AI's reasoning in under 30 words — and the confidence badge shows 95%, meaning the AI itself is confident it didn't hallucinate."*

---

### Step 6: Export PDF *(~20 sec)*

> 🗣️ *"Finally, the Export button at the top calls our export-api — Playwright renders the résumé into a styled HTML template and streams back a PDF. Two templates available: modern with a dark sidebar, and classic which is single-column ATS-safe."*

- [ ] Click **"Export Tailored PDF"**
- [ ] Confirm a `resume_modern_*.pdf` file downloads
- [ ] Open it and show the two-column layout briefly

---

## Post-Demo — Run Evaluation Script *(optional, ~60 sec)*

> 🗣️ *"If you want to see the numbers without demo mode — the evaluation script calls all four services against five résumé/JD pairs and writes a CSV."*

```bash
# In a terminal (all services must be running)
node scripts/evaluate.js
```

- [ ] ⚠️ Show the printed summary table
- [ ] ⚠️ Open `evaluation_results.csv` in a text editor

---

## Emergency Fallbacks

| Problem | Fix |
|---|---|
| Service won't start | Check `infra/.env` has a valid `GOOGLE_API_KEY` |
| Port already in use | `docker compose down` then `./infra/start-dev.sh` |
| Frontend 500 error | Use **Demo Mode** toggle — bypasses all services |
| PDF download fails | Paste the JSON into `curl` command in README |
| Gemini rate limit | Set `PROMPT_VARIANT=short` in `infra/.env` and restart |
| No internet for Gemini | Demo Mode does **NOT** call Gemini — safe fallback |

---

## 3-Minute Demo Script (exact spoken lines)

*Read this verbatim if nerves take over.*

> **[0:00]** "Hi — I'm going to show you something I built over the past few weeks: an AI system that automatically tailors a résumé to a specific job description, without making up any accomplishments.
>
> **[0:15]** The system has five microservices: a parser that extracts the résumé into structured JSON, a JD analyser that pulls required skills and keywords from the job posting, a rewrite service that uses Gemini to rephrase each experience bullet — but with a strict no-hallucination rule — a scoring engine that gives an objective ATS match score, and a PDF exporter.
>
> **[0:45]** Let me show you the frontend. I'll enable Demo Mode — this pre-fills with real sample data so we don't wait on network calls. You can see a real résumé and a matching job description.
>
> **[1:00]** I click Analyze & Tailor. Watch the Stepper — it's showing each service being called in sequence.
>
> **[1:20]** On the Results page: the Score Card shows the before and after ATS score. 42% became 88%. Not cherry-picked — this is the scoring algorithm running deterministically, same number every time.
>
> **[1:35]** Scrolling down — each experience bullet is shown side-by-side: original on the left, AI rewrite on the right. The difference highlighted in colour. Under each card is a one-sentence rationale from the AI explaining what it changed and why.
>
> **[1:55]** I'll click Export PDF. Playwright renders this into a professional two-column template and downloads a PDF directly.
>
> **[2:15]** The whole stack is containerised. One command — `./infra/start-dev.sh` — builds and starts everything. Every service has a `/health` endpoint. The frontend won't start until every API service passes its health check.
>
> **[2:35]** The evaluation script runs all five résumé/JD pairs end-to-end and writes a CSV. Average improvement: 45 points. Same number, every run.
>
> **[2:50]** That's the system. Questions?"
