# ATHENA MASTER BLUEPRINT v6 - COMPLETE
**Status:** IMPLEMENTED ✅
**Focus:** Women-First Safety Framework & Platform Safeguards

---

## 🛡️ 1. Women-First Safety Framework

This framework governs all interactions on the Ngurra Pathways platform, ensuring a culturally safe environment for First Nations women.

### 1.1 Core Principles
*   **Cultural Safety First:** All features prioritize the mental, emotional, and physical safety of First Nations women.
*   **Verification & Exclusivity:** A strict "Women-Only" gate for sensitive features.
*   **Proactive Protection:** AI-driven monitoring for abuse, exploitation, and unsafe behavior.

### 1.2 Registration & The "Women-Only" Gate
**Implementation:** `apps/web/src/app/signup/page.tsx` & `apps/api/src/routes/auth.ts`

*   **Self-Attestation:** Mandatory declaration of female identity (Female / Woman / Tiddas) during signup.
*   **Strict Enforcement:** Server-side validation rejects non-female gender selections for member accounts.
*   **Invitational Access:**
    *   Invite codes allow for community-vetted entry.
    *   Expedited verification for invited members.
*   **Verification Tiers:**
    *   **Unverified:** Limited access to public resources.
    *   **Verified (Subscription/ID):** Full access to community features, messaging, and housing.

### 1.3 Employer Checks & Safety
**Implementation:** `jobs` and `company` modules

*   **Employer Vetting:** All employers must agree to the "Cultural Safety Pledge".
*   **Feedback Loop:** Workers can anonymously report culturally unsafe workplaces.
*   **AI Scanner:** Job descriptions are scanned for biased or exploitative language before publication.

---

## 🔒 2. Safety Controls & User Privacy
**Implementation:** `apps/api/src/routes/safety.ts` & `apps/web/src/app/settings/safety`

### 2.1 User-Controlled Settings
Users have granular control over their visibility and interactions:
*   **Message Controls:**
    *   `Allow Messages`: "Everyone", "Connections Only", "Verified Only", or "Nobody".
*   **Visibility:**
    *   `Profile Visibility`: Hide from public search.
    *   `Location Privacy`: Show Exact, Region-only, Country-only, or Hidden.
*   **Blocking & Muting:**
    *   One-click block prevents all future interaction.
    *   "Ghost Mode" availability.

### 2.2 Anti-Harassment
*   **Profanity & Abuse Filters:** Real-time message scanning.
*   **Connection Requests:** Strict limits on requests to prevent spam/stalking.

---

## 🆘 3. DV-Safe Features (Domestic Violence Protection)
**Implementation:** `lib/dv-safe.ts` & `dv-safe.routes.ts`

Designed for women in vulnerable situations or experiencing domestic violence.

### 3.1 Emergency Tools
*   **Panic Button:** Immediately locks the account, hides sensitive data, and (optionally) improved location sharing with emergency contacts.
*   **Safe Exit:** A "Quick Escape" button always visible that redirects to a neutral site (e.g., Weather, News) and clears the session history.
*   **Disguised App Mode:** Option to make the app icon and interface look like a utility app (Calculator/Weather).

### 3.2 Evidence Preservation
*   **Safe Chats:** Encrypted messaging that leaves no trace on the device.
*   **Evidence Vault:** Securely store documents, photos, or recordings in a cloud vault accessible only with a special key, independent of the user's primary login.

### 3.3 Financial protection
*   **Stash Accounts:** Hidden savings goals/trackers not visible on the main dashboard.

---

## 📝 4. Reporting & Incident Response
**Implementation:** `apps/api/src/routes/reporting.ts` (Planned)

1.  **Report Content/User:** Easy reporting flow with categories for "Cultural Unsafety", "Harassment", "Scam".
2.  **Triage:** High-priority queue for safety-related reports.
3.  **Action:**
    *   Immediate temporary suspension of reported aggressors pending review.
    *   Community moderation councils for disputes.

---

**Version History:**
*   v6.0: Added "True Women-Only Gate" specifications, Invitation logic, and consolidated Safety Framework documentation.
