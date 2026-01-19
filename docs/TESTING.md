# Testing Guide

This document covers the testing strategy, tools, and practices for Ngurra Pathways.

## Table of Contents

- [Overview](#overview)
- [Test Types](#test-types)
- [API Testing](#api-testing)
- [E2E Testing](#e2e-testing)
- [Writing Tests](#writing-tests)
- [CI Integration](#ci-integration)
- [Best Practices](#best-practices)

## Overview

Our testing strategy includes:

| Layer | Tool | Purpose |
|-------|------|---------|
| Unit Tests | Vitest | Test individual functions/modules |
| Integration Tests | Vitest + Supertest | Test API endpoints with database |
| E2E Tests | Playwright | Test complete user flows in browser |
| Accessibility | axe-core + Playwright | Automated a11y testing |
| Visual | Playwright Snapshots | Visual regression testing |

## Test Types

### Unit Tests

Test individual functions in isolation with mocked dependencies.

```typescript
// Example: apps/api/tests/unit/auth.service.test.ts
import { describe, it, expect, vi } from 'vitest';
import { AuthService } from '../../src/services/AuthService';

describe('AuthService', () => {
  it('should hash password correctly', async () => {
    const hash = await AuthService.hashPassword('password123');
    expect(hash).not.toBe('password123');
    expect(hash.length).toBeGreaterThan(50);
  });
});
```

### Integration Tests

Test API endpoints with real database connections.

```typescript
// Example: apps/api/tests/integration/auth.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import app from '../../src/app';

describe('Auth API', () => {
  const request = supertest(app);

  it('POST /auth/register - creates new user', async () => {
    const response = await request
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        userType: 'MEMBER'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
  });
});
```

### E2E Tests

Test complete user flows in a real browser.

```typescript
// Example: apps/web/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('user can login successfully', async ({ page }) => {
    await page.goto('/auth/login');
    
    await page.fill('[name="email"]', 'user@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Welcome');
  });
});
```

## API Testing

### Setup

```bash
# Install test dependencies (already included)
pnpm --filter api install

# Run all tests
pnpm --filter api test

# Run specific test file
pnpm --filter api test -- tests/test-auth-jobs.js

# Run with coverage
pnpm --filter api test:coverage
```

### Test Database

Tests run against a separate test database:

```bash
# Set up test database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gimbi_test

# Migrate test database
pnpm --filter api db:push
```

### Available Test Scripts

| Script | Description |
|--------|-------------|
| `test` | Run all tests |
| `test:smoke` | Quick smoke tests |
| `test:happy` | Happy path tests |
| `test:ai` | AI integration tests |
| `test:mentor` | Mentor feature tests |

## E2E Testing

### Setup

```bash
# Install Playwright browsers
pnpm --filter web e2e:install

# Run all E2E tests
pnpm --filter web test:e2e

# Run with UI mode (debugging)
pnpm --filter web exec playwright test --ui

# Run specific test
pnpm --filter web exec playwright test auth.spec.ts

# Update snapshots
pnpm --filter web test:e2e:update
```

### Configuration

Playwright is configured in `apps/web/playwright.config.js`:

```javascript
module.exports = {
  testDir: './e2e',
  baseURL: 'http://localhost:3000',
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
};
```

### Accessibility Testing

E2E tests include accessibility checks:

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('homepage has no accessibility violations', async ({ page }) => {
  await page.goto('/');
  
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
```

## Writing Tests

### Directory Structure

```
apps/
├── api/
│   └── tests/
│       ├── unit/           # Unit tests
│       ├── integration/    # Integration tests
│       └── fixtures/       # Test data
└── web/
    └── e2e/
        ├── auth.spec.ts    # Auth flow tests
        ├── jobs.spec.ts    # Job listing tests
        └── fixtures/       # Test fixtures
```

### Test Naming

- Unit tests: `*.test.ts`
- Integration tests: `*.integration.test.ts`
- E2E tests: `*.spec.ts`

### Test Data

Use factories for consistent test data:

```typescript
// tests/fixtures/factories.ts
export const createTestUser = (overrides = {}) => ({
  email: `test-${Date.now()}@example.com`,
  password: 'password123',
  userType: 'MEMBER',
  ...overrides
});

export const createTestJob = (companyId, overrides = {}) => ({
  title: 'Test Job',
  description: 'Test description',
  companyId,
  ...overrides
});
```

## CI Integration

### GitHub Actions

Tests run automatically on:
- Push to `main` or `staging`
- Pull requests

```yaml
# .github/workflows/ci.yml
- name: Run API Tests
  run: pnpm --filter api test
  env:
    DATABASE_URL: postgresql://postgres:postgres@localhost:5432/gimbi_test

- name: Run E2E Tests
  run: pnpm --filter web test:e2e
```

### Test Artifacts

Failed E2E tests upload artifacts:
- Screenshots
- Videos (on failure)
- Traces
- HTML report

## Best Practices

### General

1. **Isolate tests** - Each test should be independent
2. **Clean up** - Reset state after tests
3. **Mock external services** - AI, email, payment providers
4. **Use descriptive names** - `should create user when valid data provided`

### API Tests

1. **Test error cases** - Not just happy paths
2. **Validate response shape** - Check all expected fields
3. **Test authentication** - Both authenticated and unauthenticated
4. **Test rate limiting** - Verify limits are enforced

### E2E Tests

1. **Use data-testid** - For reliable element selection
2. **Wait for elements** - Use Playwright's auto-waiting
3. **Test critical paths first** - Login, signup, core features
4. **Keep tests fast** - Avoid unnecessary navigation

### Coverage Goals

| Layer | Target |
|-------|--------|
| Unit Tests | 80%+ |
| Integration Tests | 60%+ |
| E2E Tests | Critical user flows |

### Test Commands Reference

```bash
# API Tests
pnpm --filter api test              # All tests
pnpm --filter api test:smoke        # Smoke tests
pnpm --filter api test:coverage     # With coverage

# E2E Tests
pnpm --filter web test:e2e          # All E2E
pnpm --filter web test:e2e:ci       # CI mode with reporters
pnpm --filter web test:e2e:update   # Update snapshots

# Specific tests
pnpm --filter api test -- --grep "auth"
pnpm --filter web exec playwright test auth.spec.ts
```
