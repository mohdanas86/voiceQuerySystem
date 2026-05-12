# Backend Phase Plan (Step-by-Step)

This plan maps the Phase 3 implementation steps to backend work only. Each step has tasks and acceptance criteria. Complete steps in order.

## Step 1 - App shell, routing, base layout (backend scope)
- Tasks
  - Create FastAPI app factory and main entry
  - Add versioned router structure (/api/v1)
  - Add health check endpoint
- Acceptance Criteria
  - GET /api/v1/health returns 200 with {"status":"ok"}
  - App starts locally without errors

## Step 2 - Speech recording UI (backend scope)
- Tasks
  - No backend work required
- Acceptance Criteria
  - N/A

## Step 3 - Live transcript generation, transcript editor (backend scope)
- Tasks
  - Define schemas for transcript payloads
- Acceptance Criteria
  - Pydantic models exist for original and translated transcripts

## Step 4 - Translation flow (backend scope)
- Tasks
  - No backend work required (translation handled on client)
- Acceptance Criteria
  - N/A

## Step 5 - Phone number input and validation (backend scope)
- Tasks
  - Add server-side validation rules for phone fields
- Acceptance Criteria
  - API rejects invalid phone format with 400 and validation error

## Step 6 - Query submission API
- Tasks
  - Create POST /api/v1/queries
  - Add request/response schemas and error models
  - Add request id to logs
- Acceptance Criteria
  - Valid payload returns 201 with id and timestamp
  - Invalid payload returns 400 with validation details

## Step 7 - MongoDB persistence
- Tasks
  - Add async MongoDB client
  - Implement repository for queries
  - Create indexes on submitted_at, phone_full, status
- Acceptance Criteria
  - Submissions are stored in MongoDB with expected fields
  - Indexes created on startup or migration step

## Step 8 - Resend email integration
- Tasks
  - Create email service wrapper for Resend
  - Build subject and body format from requirements
  - Send to support@ulavitech.com
- Acceptance Criteria
  - Email delivered with correct subject and body lines

## Step 9 - Success response
- Tasks
  - Ensure API returns success status for completed flow
- Acceptance Criteria
  - API responds only after DB write and email send succeed

## Step 10 - Error handling
- Tasks
  - Add global exception handler
  - Normalize error responses
  - Add retry-safe errors for email failures
- Acceptance Criteria
  - Errors return stable JSON schema with status code

## Step 11 - Logging and observability
- Tasks
  - Add structured JSON logging
  - Include request id, latency, status
- Acceptance Criteria
  - Logs show request id and status for every call

## Step 12 - Production optimization
- Tasks
  - Configure CORS
  - Add rate limiting for /queries
  - Validate payload size limits
- Acceptance Criteria
  - CORS allows only frontend origin
  - 429 returned on rate limit breach
