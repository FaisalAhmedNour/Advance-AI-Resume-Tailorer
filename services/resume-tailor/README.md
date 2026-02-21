# Resume Tailor Service

A microservice powered by Express, Node.js, and TypeScript containing a robust AI client capable of parsing text and returning chunked JSON output.

## Setup

1. Copy `.env.example` to `.env`
2. Run `npm install`
3. Start the dev server: `npm run dev`

## Endpoints

### `POST /api/v1/tailor`
**Payload:**
```json
{
  "systemPrompt": "You are a senior recruiter.",
  "userText": "Here is my resume text...",
  "options": {
    "responseFormat": "json"
  }
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "tailoredResume": "...",
    "notes": "..."
  },
  "retries": 0
}
```

**Features**
- In-memory concurrent request queue (max 5 simultaneous AI requests).
- Exponential backoff retry for transient network errors (429, 5xx, timeouts).
- Automatic text length validation.
- Secure design (API keys and PII are scrubbed from logs).

## Testing
Run `npm test` to execute the Jest suite for parser and client logic.
