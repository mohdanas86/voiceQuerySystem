# Security

## Input Validation
- Client-side Zod validation
- Server-side Pydantic validation

## Rate Limiting
- Per IP rate limits on /queries
- Return 429 on limit exceeded

## Sanitization
- Strip dangerous characters from transcript
- Encode email content

## Secrets Handling
- Use environment variables only
- No secrets in repo

## CORS
- Allow only frontend origin

## API Security
- HTTPS only
- Reject oversized payloads
