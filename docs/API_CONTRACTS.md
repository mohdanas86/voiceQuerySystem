# API Contracts

Base URL: /api/v1

## POST /queries
Create a new query submission.

Request Body
```json
{
  "source_language": "string",
  "original_transcript": "string",
  "translated_transcript": "string",
  "phone_country_code": "string",
  "phone_number": "string",
  "phone_full": "string",
  "client_timestamp": "string",
  "client_timezone": "string"
}
```

Validation Rules
- original_transcript: required, 1-5000 chars
- translated_transcript: required, 1-5000 chars
- phone_country_code: required, format +NN
- phone_number: required, digits and spaces only, 6-15 digits total
- phone_full: required, must include country code

Response 201
```json
{
  "id": "string",
  "status": "accepted",
  "submitted_at": "string"
}
```

Email Payload Rules (backend responsibility)
- Recipient: support@ulavitech.com
- Subject: "New Query from {phone_full}"
- Body lines (labels required):
  - Query (English): {translated_transcript}
  - Mobile Number: {phone_full}
  - Submitted at: {submitted_at_local}

Errors
- 400: validation_error
- 429: rate_limited
- 500: server_error

## GET /health
Returns service status.

Response 200
```json
{
  "status": "ok"
}
```
