# Rewrite API Service

A service encapsulating `@google/genai` to contextually optimize singular resume experience bullet points against requested JD keywords while **strictly avoiding hallucinations**.

## Core Features
1. **Verification Engine**: Internally parses all numbers from the original payload (`originalBullet` + `resumeContext` values). If the AI response contains digits NOT included in the original block, the rewrite is forcefully rejected preventing dangerous fabrications on resumes.
2. **Concurrency Safe**: Wrapped the LLM invocations using Node concurrency limiting (`p-limit(3)`) preventing rate limit panics during heavy batched generation processing.
3. **Template Fallback**: Uses a smart safe action verb compilation system forcing `confidence <= 20` if constraints fail locally.

## Endpoints

### `POST /api/v1/rewrite/rewrite`

**Request:**
```json
{
  "originalBullet": "built APIs",
  "resumeContext": {
    "company": "Startup Inc",
    "role": "Backend Dev",
    "dates": "2020-2021",
    "otherBullets": ["fixed 5 bugs"]
  },
  "jdKeywords": ["Node.js", "Scalability", "AWS"]
}
```

**Response:**
```json
{
  "rewritten": "Developed scalable APIs using Node.js.",
  "explanation": "Added strong action verb 'Developed' and integrated JD keywords 'scalable' and 'Node.js' aligned with your history.",
  "confidence": 92
}
```

### `POST /api/v1/rewrite/explain`

Used strictly by the UI to grab a ~30-word summarized explanation displaying which JD metrics were mapped effectively into the rewrite. Identical pairings are automatically cached via SHA256 hashes inside Memory.

**Request:**
```json
{
  "originalBullet": "built APIs",
  "rewrittenBullet": "Developed scalable APIs using Node.js.",
  "jdKeywords": ["Node.js", "Scalability", "AWS"]
}
```

**Response:**
```json
{
  "rationale": "I highlighted your Node.js experience and scalability improvements since the job stresses modern backend architecture capabilities."
}
```
