# Phase 2: Advanced Features & Monetization

**Status:** ✅ Complete (January 2025)

---

## 1. Video Streaming Infrastructure (Sprint 1)

**Goal:** Enable secure, high-quality video calls for mentorship sessions and job interviews.

### Backend (Node.js/LiveKit)

- [x] Update Prisma Schema with `VideoSession` model.
- [x] Configure `livekit-server-sdk` with API keys.
- [x] Create `POST /video-sessions/token` endpoint for room access.
- [x] Create `POST /video-sessions/mentor-sessions/:id/token` for scoped mentor sessions.
- [x] Implement webhooks for room events (`POST /video-sessions/webhooks/livekit`).
- [x] Health check endpoint at `GET /video-sessions/health`.

### Frontend (React/Next.js)

- [ ] Install `@livekit/components-react` and `livekit-client`.
- [ ] Create `VideoRoom` component with custom UI (Cosmic/Aura theme).
- [ ] Integrate video call view into `MentorSession` and `Interview` pages.

## 2. Subscription Billing (Sprint 2)

**Goal:** Monetize the platform via Employer and TAFE subscriptions.

### Backend (Stripe)

- [x] Update Prisma Schema with `CompanySubscription`, `Invoice` models.
- [x] Configure Stripe Webhooks (`POST /webhooks/stripe`).
- [x] Create `POST /billing/checkout` for session creation.
- [x] Create `POST /billing/portal` for customer management.
- [x] Create `GET /billing/invoices` for invoice history.
- [x] Legacy support at `/subscriptions/v2/*`.

### Frontend

- [ ] Create Pricing Page with Plan selection.
- [ ] Build Subscription Management Dashboard.
- [ ] Gate premium features (e.g., Access to unlimited job posts) based on subscription status.

## 3. Advanced AI & Recommendation (Sprint 3)

- [x] Job Recommendation Engine with scoring (`GET /recommendations`).
- [x] Mentor Recommendation Engine (`GET /recommendations/mentors`).
- [x] Recommendation feedback endpoints (`POST /recommendations/feedback`, `POST /recommendations/mentors/feedback`).
- [x] Content Moderation Service (`POST /moderation/check`).
