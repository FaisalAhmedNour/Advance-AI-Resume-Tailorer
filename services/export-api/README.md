# Export API

Standalone PDF export microservice. Renders a tailored resume JSON into a styled PDF using Playwright's headless Chromium.

## Endpoint

### `POST /api/v1/export`

| Field | Type | Required | Description |
|---|---|---|---|
| `tailoredResume` | Object | ✅ | Parser-schema resume with rewritten bullets applied |
| `template` | `"modern"` \| `"classic"` | ✅ | Which HTML template to render |

**Response:** `application/pdf` binary stream with `Content-Disposition: attachment`.

---

## Templates

### `modern`
Two-column layout with a dark navy sidebar (contact, skills, education) and a white main column (experience, projects). **Inter** font, blue accent (`#3B82F6`). Best for LinkedIn/creative roles.

### `classic`
Single-column, center-aligned header, horizontal rules, **Georgia** serif font. ATS-scanner safe. Best for corporate and finance roles.

---

## Example cURL

```bash
curl -X POST http://localhost:3005/api/v1/export \
  -H "Content-Type: application/json" \
  -d '{
    "template": "modern",
    "tailoredResume": {
      "contact": {
        "name": "Faisal Ahmed",
        "email": "faisal@example.com",
        "phone": "555-123-4567",
        "location": "New York, NY",
        "linkedin": "linkedin.com/in/faisal",
        "github": "github.com/faisal",
        "portfolio": null
      },
      "education": [
        { "institution": "Tech University", "degree": "B.S.", "field": "Computer Science", "graduationDate": "05/2021", "gpa": "3.8" }
      ],
      "experience": [
        {
          "company": "Tech Corp", "role": "Software Engineer",
          "location": "Remote", "startDate": "06/2021", "endDate": null, "isCurrent": true,
          "bullets": ["Architected scalable REST APIs using Node.js and TypeScript."]
        }
      ],
      "projects": [],
      "skills": {
        "languages": ["TypeScript", "Python"],
        "frameworks": ["Node.js", "React"],
        "tools": ["Docker"],
        "softSkills": ["Communication"]
      }
    }
  }' \
  --output tailored_resume.pdf
```

---

## Running Locally

```bash
# Install dependencies (first time installs Chromium automatically via postinstall)
pnpm install

# Start dev server (port 3005)
pnpm dev

# Run tests
pnpm test
```

---

## Architecture

```
POST /api/v1/export
   └─ export.controller.ts   # Validates payload
       └─ template.service.ts # Reads HTML + token substitution
           └─ pdf.service.ts  # Launches Playwright Chromium → PDF Buffer
```
