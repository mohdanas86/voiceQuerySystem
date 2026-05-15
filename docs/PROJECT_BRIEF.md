# Internship Project Brief — Voice-Based Query Submission System

**Ulavi Technologies · 4 weeks · Web platform**

---

## What you will build

A web app that lets users speak their query in any language, converts it to text, translates it to English, collects their mobile number with country code, and sends everything as a structured email to the support team.

- **Platform:** Web — any phone or computer, no install  
- **Approach:** AI-assisted development (Vibe Coding)

---

## 1. What are we building?

Users who struggle to type long queries — especially in their own language — get a simple flow:

1. Tap mic and speak (any language, max 60 seconds)
2. App converts speech to text
3. App translates to English
4. User reviews and edits the English text
5. User enters mobile number with country code
6. User taps **Send** — support receives a structured email
7. User sees a confirmation message

**Example:** A user in Tamil Nadu speaks in Tamil for 30 seconds. The app transcribes, translates to English, captures `+91` phone number, and ops receives a clean English email.

---

## 2. Who uses it?

| User | Need |
|------|------|
| Website visitor / customer | Open app, record, review, enter number, send |
| Support team | Receive emails with query, mobile number, timestamp |

The UI must stay simple for non-technical users.

---

## 3. Required features (6)

| # | Feature | Requirement |
|---|---------|-------------|
| 1 | Voice input | Mic button, max 60 seconds |
| 2 | Speech-to-text | Text in the language spoken |
| 3 | Auto-translation | English before send |
| 4 | Mobile number | Country code + number, validated before submit |
| 5 | Email submission | English query, full phone, timestamp to support |
| 6 | Confirmation | *"Thank you for your query. Our team will get back to you shortly."* |

---

## 4. Mobile number field

| Requirement | Detail |
|-------------|--------|
| Screen | Review — below transcript, above Send |
| Label | **Your Mobile Number** |
| Layout | Country code dropdown + number field side by side |
| Placeholder | e.g. `98765 43210` |
| Validation | Not empty; valid format; inline error; block submit if invalid |
| Email | Full number with code, e.g. `+91 98765 43210` |

Send must stay disabled or show an error until the number is valid.

---

## 5. Screens (3)

| Screen | Content |
|--------|---------|
| **Record** | Mic, status (idle / recording / done), timer (max 60s) |
| **Review** | Editable English text, mobile field, Send (disabled until valid) |
| **Confirmation** | Required thank-you message |

---

## 6. Email

Support provides the destination address. The email body must include on separate labelled lines:

- **Query (English):** translated text  
- **Mobile Number:** country code + number  
- **Submitted at:** timestamp when Send was clicked  

Example subject: `New Query from +91 98765 43210`

---

## 7. Suggested tools

Bolt.new, Claude, Cursor, Firebase (optional storage) — team chooses what fits.

---

## 8. Four-week plan

| Week | Goal |
|------|------|
| 1 | Plan and design (3 screens, number field placement) |
| 2 | Build record, speech-to-text, translation, phone field + validation |
| 3 | Email integration, confirmation, cross-country testing |
| 4 | Polish, documentation, live demo |

---

## 9. Team roles (5 students)

| Role | Owns |
|------|------|
| App Builder | All 6 features end-to-end |
| Designer & Planner | Flow, layouts, number field UX |
| Email & Number | Validation, EmailJS, confirmation |
| Tester | E2E tests, email verification |
| Demo & Docs | Presentation, README, demo video |

---

## 10. Final submission

- Working web app (link testable on phones)  
- Code (Git or shared folder)  
- Short write-up (what you built, challenges, learnings)  
- Live demo with real voice query, phone number, and received email  

---

## 11. Grading criteria

| Criterion | Good outcome |
|-----------|----------------|
| App works | All 6 features without major errors |
| Phone field | Dropdown works, bad input rejected, correct in email |
| Ease of use | New user completes flow in under 2 minutes |
| Teamwork | All members contributed |
| Problem solving | Issues debugged with or without AI |
| Beyond scope | Optional extras (e.g. Firebase, auto country code) |

---

## Intellectual property

This project and all materials are the exclusive property of **Ulavi Technologies**. Unauthorised use, reproduction, or distribution may result in legal action.

*Confidential — Ulavi Technologies*
