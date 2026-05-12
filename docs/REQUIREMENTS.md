# Requirements

## Functional Requirements
- Record speech up to 60 seconds from browser
- Convert speech to text in the source language
- Translate transcript to English
- Allow user to edit transcript before submission
- Collect phone number with country code dropdown
- Validate phone number before enabling submit
- Submit query to backend API
- Store submission in MongoDB
- Send structured email to support
- Show confirmation message on success
- Display error messages on failures

## Non-Functional Requirements
- Mobile-first, accessible UI
- Production-grade code quality
- Modular monolith architecture
- Free-tier hosting and services only
- Observability with structured logs
- Secure handling of secrets

## Performance Requirements
- First contentful paint under 2.5s on mobile
- API response for submit under 1.5s (p95)
- Speech flow should remain responsive within 200ms UI updates

## Scalability Requirements
- Support 10k+ users and spikes in submissions
- Stateless API nodes for horizontal scaling
- Database indexes for common queries

## Security Requirements
- Input validation on client and server
- Rate limiting on submit endpoint
- CORS locked to frontend origins
- Secrets stored in environment variables
- Sanitization of user-provided content
