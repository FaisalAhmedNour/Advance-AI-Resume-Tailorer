# services/shared

Shared utilities and constants used across the `resume-tailorer` monorepo services.

---

## `prompt-templates.ts` — AI System Prompts

Single source of truth for every system prompt sent to the Gemini API.

### Prompts included

| Export | Used by | Purpose |
|---|---|---|
| `REWRITE_SYSTEM_PROMPT` | `rewrite-api` | 7-rule no-hallucination bullet rewriter |
| `JD_SYSTEM_PROMPT` | `jd-analyzer-api` | Structured JD field extractor |
| `EXPLAIN_SYSTEM_PROMPT` | `rewrite-api` | ≤30-word rewrite rationale |

---

### PROMPT_VARIANT — Switching between full and short prompts

Set the environment variable **`PROMPT_VARIANT`** to control which prompt variant all services use:

```bash
# Default — production quality, higher token cost
PROMPT_VARIANT=full   # (or unset)

# Free-tier optimised — ~60% fewer input tokens
PROMPT_VARIANT=short
```

Add it to `infra/.env` or pass it inline:

```bash
PROMPT_VARIANT=short pnpm dev
```

You can also set it per-service in `docker-compose.yml`:

```yaml
services:
  rewrite-api:
    environment:
      PROMPT_VARIANT: short
```

---

### Token Cost Comparison

| Prompt | Full tokens (input) | Short tokens (input) | Saving |
|---|---|---|---|
| `REWRITE_SYSTEM_PROMPT` | ~120 | ~50 | **58%** |
| `JD_SYSTEM_PROMPT` | ~110 | ~45 | **59%** |
| `EXPLAIN_SYSTEM_PROMPT` | ~40 | ~22 | **45%** |

> **Note:** At Gemini Flash pricing ($0.075/1M input tokens) the absolute dollar difference is tiny. The benefit of `PROMPT_VARIANT=short` is primarily **rate-limit headroom** on the free tier (1M tokens/day limit) when running the evaluation script across many résumé/JD pairs.

---

### How to tweak prompts

All prompts are in [`prompt-templates.ts`](./prompt-templates.ts). They are plain TypeScript template literals — no special syntax.

**Steps:**

1. Open `services/shared/prompt-templates.ts`
2. Edit the `_FULL` or `_SHORT` variant of the prompt you want to adjust
3. Restart the service — prompts are read at startup (not hot-reloaded)

**Rules to preserve for correctness:**

| Rule | Why |
|---|---|
| Rewrite Rule 1 (no new facts) | Core anti-hallucination guard — do **not** remove or weaken |
| Rewrite Rule 2 (no new numbers) | Prevents fabricated metrics |
| JD schema shape | Must match `JDSchema` interface in `jd-analyzer-api/src/schema.ts` |
| Rewrite JSON shape | Must match `RewriteResponse` in `rewrite-api/src/schema.ts` |

**Safe to tweak:**

- Wording, tone, and verbosity of explanations
- The word-count constraint in the rewrite (currently 8–28 words)
- Whether to allow 1, 2, or 3 keyword injections (Rewrite Rule 3)
- The confidence scoring description (Rule 7)

---

### Adding a new prompt

1. Add the `_FULL` and `_SHORT` variants as exported `const` strings
2. Add the active-variant selector using `PROMPT_VARIANT`:
   ```typescript
   export const MY_NEW_PROMPT: string =
       PROMPT_VARIANT === 'short' ? MY_NEW_PROMPT_SHORT : MY_NEW_PROMPT_FULL;
   ```
3. Add it to the `PROMPTS` convenience object at the bottom of the file
4. Import from `'../../shared/prompt-templates.js'` in the consuming service
