# Scoring API

A high-performance algorithmic microservice built to deterministically process `parser-api` and `jd-analyzer-api` schemas calculating an ATS fractional match score, securely running independently of expensive LLM layers.

## Algorithm Breakdown
- **Coverage Scoring**: Applies rigorous text normalization extracting and converting synonyms across both the JD boundaries and the Resume structures to yield a firm fractional percent score mapping precisely to `requiredSkills` (45% weight) and `preferredSkills` (25% weight).
- **Semantic Similarity / Jaccard Index**: Validates Context mapping responsibilities against the resume's history using a deterministic NLP overlap formula ensuring relevance is preserved across UI iterations (30% weight).
- **Formatting Penalties**: Executes rigorous Regex rules simulating rigid ATS parsers, penalizing documents that arbitrarily shift across differing date syntaxes (e.g., `MM/YYYY` mixed globally with `Month, Year`).

## Endpoint

### `POST /api/v1/score/score`

**Request Payload:**
Accepts the full `parser` and `analyzer` outputs along with the latest array of locally `rewritten` bullets modified by the user.
```json
{
   "resume": { /* Parsed Resume JSON object */ },
   "jd": { /* Analyzed JD JSON object */ },
   "rewrittenBullets": [
       { "original": "built apis", "rewritten": "Developed scalable apis using Node" }
   ]
}
```

**Response Output:**
Instantly yields the Before/After Delta allowing the UI to show exact mathematical progression graphs.
```json
{
   "beforeScore": 34,
   "afterScore": 88,
   "breakdown": {
       "requiredCoverage": 0.33,
       "preferredCoverage": 0,
       "semanticSimilarity": 0.45,
       "formatPenalty": 0
   },
   "afterBreakdown": {
       "requiredCoverage": 1.0,
       "preferredCoverage": 1.0,
       "semanticSimilarity": 0.82,
       "formatPenalty": 0
   }
}
```
