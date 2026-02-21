# JD Analyzer API Service

A service designed to interpret raw, unstructured Job Description text (JDs) and normalize them into a strict internal JSON schema.

## Core Features
1. **Deterministic Parsing**: Enforces a strict schema dictating array types, `null` parameters, and explicit seniority constants.
2. **Chunking**: Handles arbitrarily long job descriptions by logically chunking them concurrently and deeply merging results (preferring Maximum Years, Array Unions).
3. **Caching**: Computes `sha256` hashing on identical prompt texts bypassing the LLM completely reducing billing costs and latent API times.
4. **Synonym Sanitization**: Operates a generic ~300 synonym map forcing keywords like `js` -> `JavaScript` allowing downstream ATS algorithms cleaner diffs.

## Endpoints

### `POST /api/v1/jd-analyzer/analyze`

**Request:**
```json
{
  "jdText": "We are looking for a Senior React dev with 5 years experience in Node.js and AWS."
}
```

**Response:**
```json
{
  "title": "React dev",
  "seniority": "senior",
  "requiredSkills": ["React", "Node.js", "AWS"],
  "preferredSkills": [],
  "softSkills": [],
  "responsibilities": [],
  "keywords": ["React", "Node.js", "AWS"],
  "yearsExperience": {
    "min": 5,
    "max": null
  }
}
```

## Internal System Prompt 

The AI model receives the following instructions bounding output parameters deterministically.

```text
You are an ATS JSON extractor. ALWAYS RETURN VALID JSON EXACTLY MATCHING THE SCHEMA. If a value is unknown, use null or empty array. Do not include any explanation or extra fields.

SCHEMA:
{
  "title": string | null,
  "seniority": "intern" | "junior" | "mid" | "senior" | "lead" | "manager" | null,
  "requiredSkills": string[],
  "preferredSkills": string[],
  "softSkills": string[],
  "responsibilities": string[],
  "keywords": string[],
  "yearsExperience": { "min": number | null, "max": number | null }
}
```
