# Business Suite — Women-First Features & Safety Checklist

Purpose

- Capture functional, privacy, legal and safety requirements for the new business suite and women-first features (safe housing, panic mode, extended profiles, workplace inclusivity ratings).

Principles

- Women-first and trauma-informed design: opt-in, non-judgemental, plain-language, minimize friction, avoid re-traumatization.
- Privacy-by-default: only collect data that is necessary and make all sensitive fields opt-in and nullable.
- Safety-first: explicit consent for emergency/panic features, minimal disclosure in messages, secure handling and retention of sensitive events.
- Cultural safety: specific optional fields and support for Aboriginal and Torres Strait Islander users; community-sensitive resource linking.

Scope

- Extended user profiles (nullable) with media support (photos/video), pronouns, religion, sexuality, age/birthYear, likes/hobbies, numberOfKids, relationshipStatus, trades, educationLevel, previousEmployment, driversLicence and type, housingSituation, Indigenous identifiers and communityAffiliation.
- Housing/property listings with multiple photos/videos and flags for Domestic Violence (DV) safe housing and culturally-safe housing.
- Panic mode (opt-in): quick emergency action that records a secure, ephemeral event and optionally notifies verified emergency contacts and trusted responders.
- Business model and workplace inclusivity rating system (metrics for safety, gender equity, accessibility, indigenous inclusion) and reporting/moderation flows.
- Media upload pipeline: secure storage, scanning/moderation workflow, moderation status on media, admin review queue.

Legal & Privacy Checklist ✅

- [ ] Define lawful basis for collecting each sensitive attribute (consent, legitimate interest, etc.).
- [ ] Make sensitive fields opt-in and nullable — include explicit consent prompts.
- [ ] Define data retention policy for panic events, sensitive profile fields, and media. Default: minimal retention, configurable by policy.
- [ ] Encryption at rest & in transit for sensitive data (panic events, emergency contacts, Indigenous identifiers).
- [ ] Access controls & audit logging for any access to sensitive records (moderator/admin access must be auditable).
- [ ] Privacy notice and in-app explanations for each sensitive field; easy data export & deletion flows for users.
- [ ] Legal review for mandatory reporting obligations and jurisdictional variation (DV/sexual exploitation reporting laws).

Safety & Operational Checklist ✅

- [ ] Panic mode design: opt-in, discreet UI, safe message templates that avoid explicit terms that could endanger the user, verification of emergency contacts, and throttled notification logic.
- [ ] Emergency contact verification flow (SMS/push/email) before they can be notified.
- [ ] Minimal and ephemeral data capture for panic events; retention & auto-delete policy and strong encryption.
- [ ] Moderation workflow for user-submitted media & content (automated scanning + manual review), with a priority path for sexual exploitation content.
- [ ] Reporting flow for exploitation or DV incidents with reviewer escalation and evidence preservation for law enforcement when required by policy.
- [ ] Staff training materials for handling DV and sexual exploitation reports (sensitivity, safety, cultural competency).
- [ ] Clear user-facing guidance and quick access to local helplines & culturally appropriate support resources.

Technical & Implementation Checklist ✅

- [ ] Schema additions with all new fields marked nullable by default.
- [ ] Migrations and backward compatibility plan (no breaking changes to existing users).
- [ ] Storage & media pipeline: S3-compatible signed uploads, virus/malware scan, transcoding for video, thumbnail generation, moderated flag.
- [ ] Notification service templates for panic & emergency that are readable but intentionally vague when needed.
- [ ] Rate limits, abuse protections, and monitoring for panic endpoints to prevent misuse.
- [ ] Add integration tests and end-to-end tests for panic, property creation with media, profile updates, and ratings.
- [ ] Feature flags to roll out features gradually and measure impact.

Accessibility & Cultural Safety

- Ensure UI and copy are accessible (WCAG basics) and written for a diverse audience.
- Provide translations and culturally-sensitive phrasing where relevant.
- Consult with Aboriginal community advisors for wording around Indigenous identifiers and community support/resourcing.

Acceptance Criteria

- Documented legal/privacy sign-off and retention policy approved by data/privacy lead.
- Schemas and migrations in `apps/api/prisma/schema.prisma` with nullable flags.
- Integration tests for core flows (profile updates w/media, create property w/media, panic event recording & notification opt-in, ratings) pass in CI.
- Admin/moderation queue for media and reports exists and is accessible to authorized staff only.

Next steps

1. Approve this document or propose edits.
2. Move to Step 2 (Data model design & migration plan): create ER diagrams and a migration roadmap once Step 1 is reviewed and approved.

Notes

- All DV/panic-related features must be opt-in and privacy-preserving by default. Implementers must follow legal and ethical guidance in each jurisdiction before enabling automated notifications to services.
- The project should include engagement with community stakeholders (women’s shelters, Aboriginal community reps) before launch.

---

_Created for: Business Suite — Women-First & Safety features — initial requirements and checklist._
