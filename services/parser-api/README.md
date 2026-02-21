# Parser API Service

A microservice dedicated to extracting structured Resume JSON from bare plain string formats, PDF files, and Word Documents (`.docx`).

## Endpoints

### `POST /api/v1/parser/parse`

#### Mode 1: Raw JSON Text Parsing
```bash
curl -X POST http://localhost:3001/api/v1/parser/parse \
  -H "Content-Type: application/json" \
  -d '{
    "text": "John Doe\njohn@example.com\n\nEXPERIENCE\nSoftware Dev\n- Built things."
  }'
```

#### Mode 2: File Upload (PDF / DOCX)
Uploads via `multipart/form-data` with `file` key parameter.

```bash
curl -X POST http://localhost:3001/api/v1/parser/parse \
  -F "file=@/path/to/your/resume.pdf"
```

## Schema output

Returns a carefully guaranteed metadata JSON structure representing contact, summary, education, experience, skill tokens natively synced to an internal 300+ synonym dictionary mapping.
