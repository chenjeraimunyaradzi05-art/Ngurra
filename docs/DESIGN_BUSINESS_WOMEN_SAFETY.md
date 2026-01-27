# Data Model Design & Migration Plan

This document describes the proposed data model changes and a safe migration plan to add the Business Suite, extended user profile fields, property media, panic events, emergency contacts, and workplace inclusivity ratings.

Goals

- Add schema changes that are fully backward compatible (all new columns nullable unless required for core functionality).
- Preserve existing behavior; add feature flags and opt-in controls to prevent accidental exposure.
- Provide migration steps, tests, and roll-back procedures.

## Proposed Models / Fields (Prisma syntax snippets)

Notes:

- All new sensitive profile fields MUST be nullable and opt-in in the application layer.
- Use `Json` fields sparingly (media arrays may be represented by separate `Media` model for moderation and metadata).

### User (extensions)

Add the following new optional fields to the `User` model. These fields are all nullable.

- pronouns String?
- religion String?
- sexuality String?
- birthYear Int?
- likes Json? // array of strings
- hobbies Json? // array of strings
- movies Json?
- music Json?
- sports Json?
- numberOfKids Int?
- relationshipStatus String?
- trades Json?
- educationLevel String?
- previousEmployment Json? // array of structured objects
- driversLicenceType String?
- housingSituation String?
- indigenousStatus Boolean?
- indigenousAffiliation String?
- profilePhotos Media[] // relation to Media model
- profileVideos Media[] // relation to Media model

Example Prisma extension (to be added to User model):

```prisma
model User {
  id                 String   @id @default(cuid())
  email              String   @unique
  // ... existing fields ...

  pronouns           String?
  religion           String?
  sexuality          String?
  birthYear          Int?
  likes              Json?
  hobbies            Json?
  movies             Json?
  music              Json?
  sports             Json?
  numberOfKids       Int?
  relationshipStatus String?
  trades             Json?
  educationLevel     String?
  previousEmployment Json?
  driversLicenceType String?
  housingSituation   String?
  indigenousStatus   Boolean? @default(false)
  indigenousAffiliation String?

  // relations
  profileMedia       Media[]  @relation("UserProfileMedia")
}
```

### Media

A single `Media` model handles both images and videos and stores metadata / moderation status.

```prisma
model Media {
  id           String   @id @default(cuid())
  url          String
  type         String   // IMAGE | VIDEO
  thumbnailUrl String?
  width        Int?
  height       Int?
  duration     Int?     // for video
  blurb        String?
  uploadedBy   String   // User.id or System
  uploadedAt   DateTime @default(now())
  public       Boolean @default(false)
  moderation   String?  // pending | approved | rejected
  business     Business? @relation(fields: [businessId], references: [id])
  businessId   String?
  property     Property? @relation(fields: [propertyId], references: [id])
  propertyId   String?
  user         User? @relation("UserProfileMedia", fields: [userId], references: [id])
  userId       String?
}
```

### Property (Housing)

```prisma
model Property {
  id            String   @id @default(cuid())
  ownerId       String   // User id
  title         String
  description   String?
  address       String?
  postcode      String?
  city          String?
  country       String?
  isSafeHousing Boolean? @default(false) // DV safe housing flag
  culturallySafe Boolean? @default(false)
  media         Media[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

### Business & WorkplaceRating

```prisma
model Business {
  id          String   @id @default(cuid())
  name        String
  description String?
  website     String?
  category    String?
  address     String?
  contacts    Json?
  media       Media[]
  ratings     WorkplaceRating[]
  createdAt   DateTime @default(now())
}

model WorkplaceRating {
  id            String   @id @default(cuid())
  businessId    String
  userId        String
  safetyScore   Int?    // 0-5
  genderEquityScore Int?
  accessibilityScore Int?
  indigenousInclusionScore Int?
  summary       String?
  createdAt     DateTime @default(now())

  business      Business @relation(fields: [businessId], references: [id])
}
```

### PanicEvent & EmergencyContact

```prisma
model EmergencyContact {
  id        String @id @default(cuid())
  userId    String
  name      String
  method    String // SMS, EMAIL, PUSH
  destination String
  verified  Boolean @default(false)
  createdAt DateTime @default(now())
}

model PanicEvent {
  id           String @id @default(cuid())
  userId       String
  triggeredAt  DateTime @default(now())
  location     Json? // optional geohint if user opts in
  notifiedTo   Json? // list of verified contacts notified
  shortMessage String? // intentionally vague
  retentionUntil DateTime? // for auto-delete
  encryptedPayload String? // optional encrypted details
}
```

## Migration plan

1. Add Prisma schema changes in a single migration with new models and **nullable** fields on `User`.
2. Run `prisma migrate dev` against a staging DB and run a migration test suite.
3. Seed test data (minimal) and run integration tests for new flows.
4. Add feature flag toggles to gate heavy features (panic events, property listing post visibility, business search by inclusivity) until approved.
5. Deploy database migration to production during a low-traffic window.
6. Monitor logs and error rates closely; have a rollback plan to revert migration and apply a hotfix if necessary.

Notes for backward compatibility

- Because all user profile fields are nullable, existing code should not break.
- New endpoints should be behind feature flags until frontend is ready.

Testing plan

- Unit tests for service methods (business creation, rating aggregation, property media upload flows).
- Integration tests for profile update, property creation and panic event recording (include opt-in/out behaviors).
- Security tests for encryption/authorization and misuse of panic endpoint.

Acceptance criteria

- Migrations apply clean to staging and CI runs pass.
- No existing tests fail after adding schema changes and new tests pass.
- Admin moderation queue can find suspicious media and reports.

## Next action

- On approval, I will implement the Prisma schema changes in a draft branch, generate the migration, and add unit/integration tests for the core models (User extensions, Media, Property, Business, WorkplaceRating, EmergencyContact, PanicEvent).

---

_End of Step 2 design doc._
