# Phase 2 Implementation Plan (Reality-Checked)

**Objective:** Ship Phase 2 features as production-ready increments.

**Status:** ✅ Complete (January 2025)

**Important:** The API in this repo is mounted at root paths (e.g. `/subscriptions`, `/video-sessions`) — not `/api/...`.

---

## 0. Reality Check (What already exists)

### ✅ Video (LiveKit + recording primitives)

- API routes implemented:
  - `GET /video-sessions/health` - Health/config check
  - `POST /video-sessions/token` - Ad-hoc room token issuance
  - `POST /video-sessions/mentor-sessions/:id/token` - Scoped mentor session tokens
  - `POST /video-sessions/webhooks/livekit` - LiveKit webhook handler (room events)
  - `/recordings` (recording lifecycle + playback URL generation)
- DB schema includes `VideoSession` and `Interview` models.
- Required env: `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `LIVEKIT_WEBHOOK_SECRET`, `FEATURE_VIDEO_CALLS=true`.

### ✅ Billing (Stripe + persisted invoices)

- Stripe helpers exist in the API layer, and Stripe webhooks are implemented at `POST /webhooks/stripe`.
- Subscription routes:
  - `/subscriptions/v2/*` (Stripe checkout/portal/cancel/reactivate)
  - `/billing/*` aliases:
    - `POST /billing/checkout`
    - `POST /billing/portal`
    - `GET /billing/invoices`
- DB schema includes `CompanySubscription` and `Invoice`.

### ✅ Recommendations (rules-based + mentor matching)

- Job recommendations API at `/recommendations` with scoring + feedback endpoints.
- **NEW:** Mentor recommendations at `/recommendations/mentors` with:
  - Skill/industry/experience matching
  - `GET /recommendations/mentors` - Personalized mentor recommendations
  - `POST /recommendations/mentors/feedback` - Mentor feedback

### ✅ Safety/Reporting + Automated Moderation

- Reporting & enforcement primitives under `/safety/*` (reports, incidents, trust scoring, blocks, mutes).
- Automated moderation at `POST /moderation/check`.
- **NEW:** Admin moderation triage endpoints:
  - `GET /safety/admin/reports` - List reports with filtering
  - `GET /safety/admin/reports/:id` - Report detail with target content
  - `PATCH /safety/admin/reports/:id` - Update status, assign, resolve with actions
  - `GET /safety/admin/incidents` - List safety incidents
  - `PATCH /safety/admin/incidents/:id` - Update incident status
  - `GET /safety/admin/stats` - Moderation statistics

### ✅ Analytics Dashboard

- **NEW:** Full analytics dashboard implementation:
  - `GET /analytics-dashboard/admin/overview` - Platform KPIs
  - `GET /analytics-dashboard/admin/user-retention` - Cohort analysis
  - `GET /analytics-dashboard/admin/job-funnel` - Application funnel metrics
  - `GET /analytics-dashboard/employer/overview` - Employer metrics
  - `GET /analytics-dashboard/employer/jobs/:jobId` - Per-job analytics
  - `GET /analytics-dashboard/mentor/overview` - Mentor metrics

---

## 1. Epic: Video Calls + Interviews ✅

**Goal:** Live video calls for mentorship and interviews with auditable session tracking.

### Video Scope

- LiveKit tokens for mentorship sessions and ad-hoc rooms.
- Persist `VideoSession` records for analytics/history.
- LiveKit webhook handler for room lifecycle events.

### Video API (Implemented)

- `GET /video-sessions/health` - Returns configured/enabled status
- `POST /video-sessions/token` (ad-hoc rooms)
- `POST /video-sessions/mentor-sessions/:id/token` (scoped to mentor sessions)
- `POST /video-sessions/webhooks/livekit` - Handles room_started, room_finished, participant_joined, participant_left

### Video API (Current)

- `GET /video-sessions/health`
- `POST /video-sessions/token` (ad-hoc rooms)
- `POST /video-sessions/mentor-sessions/:id/token` (scoped to mentor sessions)

### Video Still Missing / Decisions

- **Room management:** whether the backend should create rooms explicitly (LiveKit supports server-side room creation; current flow is token-only).
- **Webhook strategy:** whether we listen to LiveKit webhooks for room events (join/leave, room finished) vs relying on client signals.

### Video Acceptance Criteria

- A mentor+mentee can join the same deterministic room.
- A `VideoSession` row is created (or safely skipped if migrations not run) without breaking token issuance.
- Health endpoint reports configured vs enabled status.

### Video Verification

- Add a short “happy path” in API smoke tests (optional).

---

## 2. Epic: Subscription Billing (Q2 2026)

**Goal:** Tiered subscription upgrades for companies, Stripe-backed, with invoice history.

### Billing Scope

- Checkout creation, portal session creation, invoice listing.
- Stripe webhooks update `CompanySubscription` + create `Invoice` rows.

### Billing API (Current)

- `POST /webhooks/stripe` (Stripe webhook handler)
- `/subscriptions/v2/*` (checkout/portal/cancel/reactivate)
- `/billing/*` (Phase-2-friendly aliases)
  - `POST /billing/checkout`
  - `POST /billing/portal`
  - `GET /billing/invoices`

### Billing Env

- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PROFESSIONAL`, `STRIPE_PRICE_ENTERPRISE`, `STRIPE_PRICE_RAP`

### Billing Still Missing / Decisions

- Whether to use the `Plan`/`Subscription` models (advanced) vs the existing `CompanySubscription` flow (simple).
- Whether to add usage-based billing later (requires metering decisions).

### Billing Acceptance Criteria

- Checkout session can be created for STARTER/PROFESSIONAL/ENTERPRISE/RAP.
- Webhook updates subscription tier and persists invoices.
- Billing portal session is returned for users with a Stripe customer.

---

## 3. Epic: Recommendations v2 (Q3 2026)

**Goal:** Improve matching quality and explainability.

### Recommendations Current State

- Rules-based job recommendations already ship at `/recommendations`.

### Recommendations Next Increments

- Add mentor recommendations parity (if not already implemented in routes).
- Add persistence for recommendation impressions + outcomes (applied/ignored) if required for analytics.

### Recommendations Acceptance Criteria

- Endpoint returns ranked results with a stable score.
- Feedback endpoint stores “interested/not_interested/applied/irrelevant”.

---

## 4. Epic: Moderation + Trust Ops (Q3 2026)

**Goal:** Protect users and keep community content safe.

### Moderation Current State

- Reporting/incidents/trust scoring exist under `/safety/*`.
- Automated moderation decision endpoint exists at `POST /moderation/check`.

### Moderation Next Increments

- Admin review UI + admin endpoints for triage (list reports, assign, resolve).
- Add optional external AI moderation integration (OpenAI or Rekognition) behind feature flags.

### Moderation Acceptance Criteria

- Users can report content and see success responses.
- Moderation check returns actionable decision + sanitized content.

---

## 5. Epic: Analytics Dashboard (Q3 2026)

**Goal:** Actionable product + business analytics for admin and employers.

### Analytics Current State

- Analytics routes exist; Prometheus metrics endpoints exist.

### Analytics Next Increments

- Define canonical KPIs (conversion, retention, job funnel, mentor funnel).
- Ensure events are captured consistently (server-side + client-side).
- Add role-gated dashboard endpoints (admin/employer).

### Analytics Acceptance Criteria

- Employer dashboard returns metrics for their jobs/applications.
- Admin dashboard returns platform-level rollups.

---

## Execution (Next 2 Sprints)

### Sprint A (stabilize + document reality)

- Confirm and document the canonical endpoints (this file)
- Ensure env examples cover required Phase 2 keys

### Sprint B (finish the “missing” product pieces)

- Add admin triage endpoints for moderation/reports
- Decide and implement LiveKit webhook strategy (or explicitly defer)
