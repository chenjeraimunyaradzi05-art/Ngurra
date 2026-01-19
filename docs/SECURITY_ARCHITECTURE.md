# Security Architecture & Data Flow

This document describes the security architecture, data flows, and trust boundaries for the Ngurra Pathways (Gimbi) platform.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              INTERNET                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EDGE LAYER (Trust Boundary 1)                        │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      Cloudflare / CDN                                │    │
│  │  • DDoS Protection           • WAF Rules                            │    │
│  │  • Bot Management            • SSL/TLS Termination                  │    │
│  │  • Rate Limiting             • Geo-blocking                         │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       LOAD BALANCER LAYER                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    Nginx Reverse Proxy                               │    │
│  │  • TLS 1.3 Only              • Request Filtering                    │    │
│  │  • Header Injection          • IP Allowlisting                      │    │
│  │  • Request Size Limits       • Health Checks                        │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER (Trust Boundary 2)                      │
│                                                                              │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐          │
│  │   Web Frontend  │    │   API Backend   │    │  Admin Portal   │          │
│  │   (Next.js)     │    │   (Express)     │    │   (Next.js)     │          │
│  │                 │    │                 │    │                 │          │
│  │  • CSP Nonces   │    │  • JWT Auth     │    │  • 2FA Required │          │
│  │  • CSRF Tokens  │    │  • RBAC         │    │  • Audit Logs   │          │
│  │  • Input Valid. │    │  • Rate Limit   │    │  • IP Restrict  │          │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘          │
│           │                      │                      │                    │
└───────────│──────────────────────│──────────────────────│────────────────────┘
            │                      │                      │
            │                      ▼                      │
            │    ┌─────────────────────────────────────┐  │
            │    │         Service Layer               │  │
            │    │                                     │  │
            │    │  ┌───────────────────────────────┐  │  │
            │    │  │     Authentication Service    │  │  │
            │    │  │  • Password Hashing (bcrypt)  │  │  │
            │    │  │  • Token Management           │  │  │
            │    │  │  • Session Management         │  │  │
            │    │  │  • 2FA/MFA                    │  │  │
            │    │  └───────────────────────────────┘  │  │
            │    │                                     │  │
            │    │  ┌───────────────────────────────┐  │  │
            │    │  │     Authorization Service     │  │  │
            │    │  │  • RBAC Engine                │  │  │
            │    │  │  • Permission Checks          │  │  │
            │    │  │  • Resource Ownership         │  │  │
            │    │  └───────────────────────────────┘  │  │
            │    │                                     │  │
            │    │  ┌───────────────────────────────┐  │  │
            │    │  │       GDPR Service            │  │  │
            │    │  │  • Data Export                │  │  │
            │    │  │  • Data Deletion              │  │  │
            │    │  │  • Consent Management         │  │  │
            │    │  └───────────────────────────────┘  │  │
            │    └─────────────────────────────────────┘  │
            │                      │                      │
            └──────────────────────┼──────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       DATA LAYER (Trust Boundary 3)                          │
│                                                                              │
│  ┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────┐  │
│  │     PostgreSQL      │    │       Redis         │    │    S3 Storage   │  │
│  │                     │    │                     │    │                 │  │
│  │  • Encrypted at     │    │  • TLS Connection   │    │  • SSE-S3       │  │
│  │    Rest (AES-256)   │    │  • AUTH Required    │    │  • Presigned    │  │
│  │  • TLS Connection   │    │  • TTL on Keys      │    │    URLs         │  │
│  │  • Row-Level Sec.   │    │  • Memory Limits    │    │  • CORS Config  │  │
│  │  • Audit Logging    │    │                     │    │                 │  │
│  └─────────────────────┘    └─────────────────────┘    └─────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES (Trust Boundary 4)                      │
│                                                                              │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐          │
│  │     Stripe      │    │    AWS SES      │    │   OpenAI API    │          │
│  │   (Payments)    │    │    (Email)      │    │   (AI/Chat)     │          │
│  │                 │    │                 │    │                 │          │
│  │  • Webhook Sig. │    │  • TLS Only     │    │  • API Key Auth │          │
│  │  • Idempotency  │    │  • DKIM/SPF     │    │  • Rate Limited │          │
│  │  • Circuit Brk. │    │  • Bounce Track │    │  • Circuit Brk. │          │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### 1. User Authentication Flow

```
┌────────┐         ┌────────────┐         ┌────────────┐         ┌──────────┐
│ Client │         │  Next.js   │         │  Express   │         │ Database │
│Browser │         │  Frontend  │         │    API     │         │PostgreSQL│
└────┬───┘         └─────┬──────┘         └─────┬──────┘         └────┬─────┘
     │                   │                      │                      │
     │ 1. Login Request  │                      │                      │
     │ (email, password) │                      │                      │
     │──────────────────>│                      │                      │
     │                   │                      │                      │
     │                   │ 2. POST /api/auth/login                     │
     │                   │ (HTTPS, includes CSRF token)                │
     │                   │─────────────────────>│                      │
     │                   │                      │                      │
     │                   │                      │ 3. Query user        │
     │                   │                      │ (parameterized)      │
     │                   │                      │─────────────────────>│
     │                   │                      │                      │
     │                   │                      │ 4. User record       │
     │                   │                      │<─────────────────────│
     │                   │                      │                      │
     │                   │                      │ 5. Verify bcrypt     │
     │                   │                      │    hash (async)      │
     │                   │                      │                      │
     │                   │ 6. Set HttpOnly Cookie                      │
     │                   │    (refresh token)                          │
     │                   │    Return access token                      │
     │                   │<─────────────────────│                      │
     │                   │                      │                      │
     │ 7. Store access   │                      │                      │
     │    token (memory) │                      │                      │
     │<──────────────────│                      │                      │
     │                   │                      │                      │
```

### 2. Sensitive Data Flow

```
User Input
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    INPUT VALIDATION                              │
│  • Zod Schema Validation      • SQL Injection Prevention        │
│  • XSS Sanitization           • Length/Format Checks            │
│  • Path Traversal Prevention  • File Type Validation            │
└─────────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION CHECK                          │
│  • JWT Verification           • Token Expiration                │
│  • Session Validation         • Device Fingerprint              │
└─────────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHORIZATION CHECK                           │
│  • RBAC Permission Check      • Resource Ownership              │
│  • Sudo Mode (sensitive ops)  • API Key Scope                   │
└─────────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RATE LIMITING                                 │
│  • Per-User Limits            • Per-IP Limits                   │
│  • Per-Endpoint Limits        • Distributed (Redis)             │
└─────────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC                                │
│  • Service Layer              • Domain Validation               │
│  • Audit Logging              • Error Handling                  │
└─────────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATA PERSISTENCE                              │
│  • Parameterized Queries      • Encryption at Rest              │
│  • PII Field Encryption       • Audit Trail                     │
└─────────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RESPONSE SANITIZATION                         │
│  • Remove Sensitive Fields    • Log Redaction                   │
│  • Security Headers           • Content-Type                    │
└─────────────────────────────────────────────────────────────────┘
```

### 3. File Upload Security Flow

```
┌────────────┐
│User Upload │
└─────┬──────┘
      │
      ▼
┌─────────────────────────────────────┐
│ 1. Size Check                       │
│    Max: 10MB (configurable)         │
│    Reject oversized files early     │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│ 2. MIME Type Validation             │
│    Check Content-Type header        │
│    Verify against allowlist         │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│ 3. Magic Number Verification        │
│    Read file header bytes           │
│    Validate against known sigs      │
│    Prevent extension spoofing       │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│ 4. Malware Scan (Optional)          │
│    ClamAV or cloud scanning         │
│    Quarantine suspicious files      │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│ 5. Metadata Stripping               │
│    Remove EXIF data from images     │
│    Prevent information leakage      │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│ 6. Generate Safe Filename           │
│    UUID-based naming                │
│    Preserve extension (validated)   │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│ 7. Upload to S3                     │
│    Private bucket                   │
│    Server-side encryption           │
│    Presigned URL for access         │
└─────────────────────────────────────┘
```

## Trust Boundaries

### Boundary 1: Internet → Edge
- **Controls**: WAF, DDoS protection, bot detection
- **Data Sanitization**: None at this layer (handled downstream)
- **Authentication**: None (public access)

### Boundary 2: Edge → Application
- **Controls**: TLS termination, request filtering, rate limiting
- **Data Sanitization**: Request size limits, header validation
- **Authentication**: API key validation for internal services

### Boundary 3: Application → Data
- **Controls**: Parameterized queries, connection pooling
- **Data Sanitization**: Full input validation, SQL injection prevention
- **Authentication**: Database credentials (rotated), TLS

### Boundary 4: Application → External
- **Controls**: Circuit breakers, retry with backoff, idempotency
- **Data Sanitization**: PII minimization for external APIs
- **Authentication**: API keys, webhook signatures

## Sensitive Data Classification

| Data Type | Classification | Encryption | Access | Retention |
|-----------|---------------|------------|--------|-----------|
| Password | Critical | bcrypt hash | Auth only | Forever (hashed) |
| Email | PII | At rest | Owner + Admin | Account lifetime |
| Full Name | PII | At rest | Public/Private setting | Account lifetime |
| Phone | PII | AES-256 | Owner only | Account lifetime |
| Address | PII | AES-256 | Owner only | Account lifetime |
| Resume | Confidential | At rest | Owner + Applied employers | 3 years |
| Payment Card | Critical | Not stored (Stripe) | Stripe only | Per Stripe policy |
| Session Token | Critical | N/A (short-lived) | User session | 15 minutes |
| Refresh Token | Critical | HMAC signed | HttpOnly cookie | 7 days |
| API Keys | Secret | AES-256 | Owner + Admin | Until revoked |

## Security Controls Summary

| Control | Implementation | Layer |
|---------|---------------|-------|
| Authentication | JWT + bcrypt + 2FA | Application |
| Authorization | RBAC + Ownership | Application |
| Encryption (Transit) | TLS 1.3 | All |
| Encryption (Rest) | AES-256 | Data |
| Input Validation | Zod schemas | Application |
| Output Encoding | React auto-escape | Frontend |
| SQL Injection | Prisma ORM | Application |
| XSS | CSP + sanitization | Application |
| CSRF | Double-submit cookie | Frontend |
| Rate Limiting | Redis-backed | Application |
| Logging | Structured, redacted | Application |
| Monitoring | Prometheus metrics | Infrastructure |
| Secrets | Environment variables | Infrastructure |
