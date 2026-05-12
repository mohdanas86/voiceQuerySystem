# Component Architecture

## Reusable Components
- AppShell
- PageHeader
- PrimaryButton
- MicButton
- RecordingTimer
- TranscriptEditor
- PhoneInput
- CountryCodeSelect
- ErrorBanner
- SuccessPanel

## Component Hierarchy
- AppShell
  - RecordPage
    - MicButton
    - RecordingTimer
  - ReviewPage
    - TranscriptEditor
    - PhoneInput (below transcript, before Send)
    - PrimaryButton
  - ConfirmationPage
    - SuccessPanel

## Props Strategy
- Use typed props with explicit interfaces
- Pass callbacks and minimal state
- Avoid deep prop drilling

## State Management
- Zustand store for recording and submission state
- Local component state for input values

## Data Flow
- UI actions update store
- Store triggers API service calls
- API results update store and route
