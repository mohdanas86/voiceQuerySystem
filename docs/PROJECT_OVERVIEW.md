# Voice-Based Query Submission System - Project Overview

## System Purpose
Provide a fast, mobile-first web experience for submitting spoken queries in any language. The app converts speech to text in the browser, translates to English, collects a validated phone number with country code, stores the submission, and sends a structured email to the support team.

## Goals
- Reduce user effort for submitting support queries
- Deliver consistent, English-only support emails
- Capture accurate contact information with validation
- Operate on free-tier hosting and services
- Be production-grade, modular, and microservice-ready

## Architecture Overview
- Frontend: Next.js 15, TypeScript, Tailwind, shadcn/ui, Zustand, Zod
- Backend: FastAPI (modular monolith), async MongoDB client
- Database: MongoDB Atlas (free tier)
- Email: Resend free tier
- Deployment: Vercel (frontend) and Render (backend)

## MVP Scope
- 3 screens: Record, Review, Confirmation
- Browser speech-to-text with max 60 seconds
- Auto-translation to English
- Editable transcript
- Phone number with country code dropdown + validation
- Submit query to backend
- Persist to MongoDB
- Send structured email
- Success and error states

## Future Scalability
- Queue-based email delivery
- Per-locale UX and language detection
- Analytics and dashboards
- Multi-tenant org support
- Migration to microservices without large refactors
