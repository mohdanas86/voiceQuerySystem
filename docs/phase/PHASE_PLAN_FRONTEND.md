# Frontend Phase Plan (Step-by-Step)

This plan maps the Phase 3 implementation steps to frontend work only. Each step has tasks and acceptance criteria. Complete steps in order.

## Step 1 - App shell, routing, responsive layout, global theme
- Tasks
  - Create Next.js app structure with app router
  - Add global styles and design tokens
  - Build base layout and page routes
- Acceptance Criteria
  - App loads with responsive layout on mobile
  - Base theme matches design system

## Step 2 - Speech recording UI and states
- Tasks
  - Build MicButton and RecordingTimer components
  - Implement idle/recording/done states
  - Enforce max 60 seconds
- Acceptance Criteria
  - Recording state changes correctly
  - Timer stops at 60 seconds

## Step 3 - Live transcript generation and editor
- Tasks
  - Integrate Web Speech API for transcript
  - Display live transcript
  - Allow user edits in TranscriptEditor
- Acceptance Criteria
  - Transcript appears while speaking
  - User can edit before submission

## Step 4 - Translation flow
- Tasks
  - Translate transcript to English using free API
  - Show translated text in review screen
- Acceptance Criteria
  - Review screen shows English version

## Step 5 - Phone number input and validation
- Tasks
  - Build CountryCodeSelect and PhoneInput
  - Label field "Your Mobile Number"
  - Placeholder "98765 43210"
  - Validate full number and show inline error
  - Disable Send until valid
- Acceptance Criteria
  - Invalid numbers show inline error
  - Send button disabled when invalid

## Step 6 - Submit API integration
- Tasks
  - Create API client
  - Submit payload to backend
- Acceptance Criteria
  - Successful response routes to confirmation

## Step 7 - Persistence (frontend scope)
- Tasks
  - No frontend work required
- Acceptance Criteria
  - N/A

## Step 8 - Email integration (frontend scope)
- Tasks
  - No frontend work required
- Acceptance Criteria
  - N/A

## Step 9 - Success screen
- Tasks
  - Build confirmation screen
  - Show message: "Thank you for your query. Our team will get back to you shortly."
- Acceptance Criteria
  - Confirmation screen displays correct message

## Step 10 - Error handling
- Tasks
  - Show error banners for recording, translation, and submit
  - Provide retry actions
- Acceptance Criteria
  - Errors are visible and recoverable

## Step 11 - Logging and observability
- Tasks
  - Add client-side event logging hooks
  - Track submission success rate
- Acceptance Criteria
  - Events emitted for submit attempts and results

## Step 12 - Production optimization
- Tasks
  - Optimize bundles and assets
  - Add accessibility checks
- Acceptance Criteria
  - Lighthouse mobile score > 85 for performance and accessibility
