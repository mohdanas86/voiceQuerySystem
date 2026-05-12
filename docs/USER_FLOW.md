# User Flow

## Primary Journey
1. User opens web app on mobile or desktop
2. User taps mic button to start recording
3. Recording status shows active and timer counts up
4. User taps stop or reaches 60 seconds
5. Browser speech-to-text produces transcript
6. App translates transcript to English
7. Review screen shows editable transcript
8. User selects country code and enters phone number
9. Validation passes and Send button enabled
10. User submits query
11. Backend stores query and sends email
12. User sees confirmation screen

## Success States
- Speech recorded and transcript displayed
- Translation completed and shown
- Phone number validated
- Submission accepted and email sent

## Failure States
- Microphone permission denied
- Speech recognition error
- Translation failure
- Phone validation failure
- Network or API failure
- Email provider failure

## Edge Cases
- User stops recording immediately
- Partial transcript with low confidence
- Invalid or missing country code
- User edits transcript to empty
- Slow network delays submission

## State Transitions
- Idle -> Recording -> Processing -> Review -> Submitting -> Success
- Any state -> Error (with retry)
