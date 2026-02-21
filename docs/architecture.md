# System Architecture

## Overview
The Advanced AI Resume Tailorer utilizes a React/Next.js frontend to allow users to interact with a suite of Node.js microservices. These services independently handle specific domains of the recruitment optimization pipeline.

## Flow Diagram

```mermaid
graph TD
    User([User]) -->|Uploads Resume & JD| Frontend(Frontend Next.js UI)
    
    Frontend -->|POST Base64| Parser[Parser API]
    Frontend -->|POST JD Text| Analyzer[JD Analyzer API]
    
    Parser -->|Returns Text Metadata| Frontend
    Analyzer -->|Returns JD Constraints| Frontend
    
    Frontend -->|Send Constraints & Text| Rewrite[Rewrite API]
    Frontend -->|Send Parsed Data & JD| Scoring[Scoring API]
    
    Rewrite -->|Tailored Resume String| Frontend
    Scoring -->|ATS Score Percentage| Frontend
    
    Frontend -->|Display Results View| User
```

## Microservices Breakdown
- **Parser API**: Extracts text from user uploads.
- **JD Analyzer API**: Infers capabilities required from the Job Description text.
- **Rewrite API**: AI augmentation of original experience into tailored bullet points.
- **Scoring API**: ATS scoring simulation based on keyword matching criteria.
