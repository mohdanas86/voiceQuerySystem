# Low Level Design

## Module Structure
Frontend:
- app/: routes and layouts
- components/: UI and shared parts
- features/: feature slices
- hooks/: reusable hooks
- services/: API clients
- store/: Zustand stores
- types/: shared types
- lib/: utilities
- styles/: global styles

Backend:
- app/api/routes: versioned routes
- app/core: config, database, logger, security
- app/modules: query, notifications
- app/models: database models
- app/schemas: request and response
- app/services: business logic
- app/middleware: request logging, cors
- app/utils: helpers

## Request Lifecycle
1. Client sends POST /api/v1/queries
2. Middleware validates headers and rate limits
3. Router validates body with Pydantic
4. Service persists to MongoDB
5. Service sends email via Resend
6. Response returns success payload

## Backend Layers
- API layer: routing and request parsing
- Service layer: business logic
- Data layer: database operations
- Integration layer: email provider

## Frontend Architecture
- Feature-driven components
- API service with typed client
- Zod validation for phone input
- Zustand for recording and submission states
- Browser Web Speech API for speech-to-text
- EmailJS for client-side email delivery
