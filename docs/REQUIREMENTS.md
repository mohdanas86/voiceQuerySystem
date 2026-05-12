# Requirements

## Functional Requirements
- Record speech up to 60 seconds from browser
- Convert speech to text in the source language (browser speech API)
- Translate transcript to English
- Allow user to edit transcript before submission
- Collect phone number with country code dropdown and number input side by side
- Label the field "Your Mobile Number" with placeholder "98765 43210"
- Validate phone number before enabling submit and show inline error on invalid
- Submit query to backend API
- Store submission in MongoDB
- Send structured email to support using EmailJS (client-side)
- Show confirmation message on success: "Thank you for your query. Our team will get back to you shortly."
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

## Email Format Requirements
- Subject: "New Query from {phone_full}"
- Body lines (labels required):
	- Query (English): {translated_transcript}
	- Mobile Number: {phone_full}
	- Submitted at: {submitted_at_local}
