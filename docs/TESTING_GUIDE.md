# Testing Guide

Comprehensive testing documentation for Ngurra Pathways platform.

## Table of Contents

- [Overview](#overview)
- [Testing Stack](#testing-stack)
- [Running Tests](#running-tests)
- [Unit Tests](#unit-tests)
- [Integration Tests](#integration-tests)
- [End-to-End Tests](#end-to-end-tests)
- [Load Tests](#load-tests)
- [Accessibility Tests](#accessibility-tests)
- [Writing Tests](#writing-tests)
- [Best Practices](#best-practices)
- [CI/CD Integration](#cicd-integration)

## Overview

Our testing strategy follows the testing pyramid:

```
        ╱╲
       ╱  ╲      E2E Tests (few, slow, high confidence)
      ╱────╲
     ╱      ╲    Integration Tests (medium, moderate speed)
    ╱────────╲
   ╱          ╲  Unit Tests (many, fast, low overhead)
  ╱────────────╲
```

### Test Distribution Goals

- **Unit Tests**: ~70% of tests
- **Integration Tests**: ~20% of tests
- **E2E Tests**: ~10% of tests

## Testing Stack

| Type | Tool | Location |
|------|------|----------|
| Unit | Vitest | `apps/*/tests/unit/` |
| Integration | Vitest + Supertest | `apps/*/tests/integration/` |
| E2E | Playwright | `apps/web/e2e/` |
| Load | k6, Artillery | `apps/api/tests/load/` |
| Accessibility | axe-core, Playwright | `apps/web/e2e/` |
| Component | Storybook | `apps/web/src/components/*.stories.tsx` |

## Running Tests

### Quick Reference

```bash
# Run all tests
pnpm test

# Run specific package tests
pnpm --filter api test
pnpm --filter web test

# Run with coverage
pnpm test:coverage

# Run in watch mode
pnpm test:watch

# Run E2E tests
pnpm test:e2e

# Run E2E tests with UI
pnpm test:e2e:ui

# Run load tests
pnpm test:load
```

### Test Scripts

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:a11y": "node tools/audit-a11y.js",
    "test:load": "k6 run apps/api/tests/load/load-test.js"
  }
}
```

## Unit Tests

Unit tests verify individual functions and modules in isolation.

### Location

```
apps/api/tests/unit/
├── auth.test.ts
├── cache.test.ts
├── encryption.test.ts
├── sanitize.test.ts
├── upload.test.ts
└── validation.test.ts

apps/web/tests/unit/
├── formatters.test.ts
├── validators.test.ts
└── storage.test.ts
```

### Example Unit Test

```typescript
// apps/api/tests/unit/validation.test.ts
import { describe, it, expect } from 'vitest';
import { validateEmail, validatePassword } from '../../src/lib/validation';

describe('validateEmail', () => {
  it('should accept valid email addresses', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('user.name@domain.com.au')).toBe(true);
  });

  it('should reject invalid email addresses', () => {
    expect(validateEmail('invalid')).toBe(false);
    expect(validateEmail('user@')).toBe(false);
    expect(validateEmail('@domain.com')).toBe(false);
  });
});

describe('validatePassword', () => {
  it('should require minimum length', () => {
    expect(validatePassword('short').valid).toBe(false);
    expect(validatePassword('LongEnough123!').valid).toBe(true);
  });

  it('should require uppercase letter', () => {
    const result = validatePassword('lowercase123!');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('uppercase');
  });
});
```

### Mocking

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendEmail } from '../../src/services/email';

// Mock external service
vi.mock('../../src/services/email', () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true })
}));

describe('notification service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should send email notification', async () => {
    await sendNotification({ type: 'email', to: 'user@test.com' });
    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
      to: 'user@test.com'
    }));
  });
});
```

## Integration Tests

Integration tests verify that components work together correctly.

### Location

```
apps/api/tests/integration/
├── auth.test.ts
├── jobs.test.ts
├── users.test.ts
└── applications.test.ts
```

### Example Integration Test

```typescript
// apps/api/tests/integration/auth.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { prisma } from '../../src/lib/prisma';

describe('Auth API', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'SecurePass123!'
  };

  beforeAll(async () => {
    // Setup: Clean test database
    await prisma.user.deleteMany({ 
      where: { email: testUser.email } 
    });
  });

  afterAll(async () => {
    // Cleanup
    await prisma.user.deleteMany({ 
      where: { email: testUser.email } 
    });
    await prisma.$disconnect();
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: testUser.email,
          password: testUser.password,
          firstName: 'Test',
          lastName: 'User'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
    });

    it('should reject duplicate email', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: testUser.email,
          password: testUser.password,
          firstName: 'Another',
          lastName: 'User'
        });

      expect(response.status).toBe(409);
    });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send(testUser);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    it('should reject invalid password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
    });
  });
});
```

### Database Testing

```typescript
// tests/setup.ts
import { prisma } from '../src/lib/prisma';
import { beforeEach, afterAll } from 'vitest';

beforeEach(async () => {
  // Clean database before each test
  const tables = await prisma.$queryRaw`
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public'
  `;
  
  for (const { tablename } of tables) {
    if (tablename !== '_prisma_migrations') {
      await prisma.$executeRawUnsafe(
        `TRUNCATE TABLE "${tablename}" CASCADE`
      );
    }
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});
```

## End-to-End Tests

E2E tests verify complete user flows in a real browser.

### Location

```
apps/web/e2e/
├── auth-flow.spec.js
├── jobs-listing.spec.js
├── application-flow.spec.js
├── keyboard-navigation.spec.js
└── screen-reader.spec.js
```

### Example E2E Test

```javascript
// apps/web/e2e/auth-flow.spec.js
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should complete full registration flow', async ({ page }) => {
    await page.goto('/register');
    
    // Fill registration form
    await page.fill('[name="firstName"]', 'Test');
    await page.fill('[name="lastName"]', 'User');
    await page.fill('[name="email"]', `test-${Date.now()}@example.com`);
    await page.fill('[name="password"]', 'SecurePass123!');
    await page.fill('[name="confirmPassword"]', 'SecurePass123!');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Welcome');
  });

  test('should show validation errors', async ({ page }) => {
    await page.goto('/register');
    
    // Submit empty form
    await page.click('button[type="submit"]');
    
    // Should show errors
    await expect(page.locator('[role="alert"]')).toBeVisible();
    await expect(page.locator('text=Email is required')).toBeVisible();
  });

  test('should login and logout', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'demo@example.com');
    await page.fill('[name="password"]', 'DemoPass123!');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/dashboard');
    
    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Sign out');
    
    await expect(page).toHaveURL('/');
  });
});
```

### Page Object Model

```javascript
// apps/web/e2e/pages/LoginPage.js
export class LoginPage {
  constructor(page) {
    this.page = page;
    this.emailInput = page.locator('[name="email"]');
    this.passwordInput = page.locator('[name="password"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('[role="alert"]');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async getError() {
    return this.errorMessage.textContent();
  }
}

// Usage in test
test('should login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('user@example.com', 'password');
  await expect(page).toHaveURL('/dashboard');
});
```

### Visual Regression Testing

```javascript
test('should match homepage snapshot', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('homepage.png', {
    maxDiffPixels: 100
  });
});
```

## Load Tests

### k6 Tests

```javascript
// apps/api/tests/load/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 50 },   // Ramp up
    { duration: '5m', target: 50 },   // Stay at 50 users
    { duration: '2m', target: 100 },  // Ramp up more
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1500'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  // Browse jobs
  const res = http.get(`${__ENV.BASE_URL}/api/jobs`);
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time OK': (r) => r.timings.duration < 500,
  });
  sleep(1);
}
```

### Running Load Tests

```bash
# Run k6 load test
k6 run apps/api/tests/load/load-test.js

# Run with environment variable
k6 run -e BASE_URL=http://localhost:3000 apps/api/tests/load/load-test.js

# Run Artillery tests
artillery run apps/api/tests/load/artillery.yml
```

## Accessibility Tests

### Automated Testing

```javascript
// apps/web/e2e/accessibility.spec.js
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('homepage should have no violations', async ({ page }) => {
    await page.goto('/');
    
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    
    expect(results.violations).toEqual([]);
  });

  test('job listing should have no violations', async ({ page }) => {
    await page.goto('/jobs');
    
    const results = await new AxeBuilder({ page })
      .exclude('.third-party-widget') // Exclude third-party content
      .analyze();
    
    expect(results.violations).toEqual([]);
  });
});
```

### Keyboard Navigation Testing

```javascript
test('should navigate with keyboard only', async ({ page }) => {
  await page.goto('/');
  
  // Tab through interactive elements
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toHaveAttribute('href', '/jobs');
  
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toHaveText('Sign In');
  
  // Activate with Enter
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL('/login');
});
```

## Writing Tests

### Test File Naming

```
*.test.ts        - Unit tests
*.spec.ts        - Integration tests
*.e2e.spec.js    - E2E tests (Playwright)
```

### Test Structure

Use the AAA pattern:

```typescript
describe('Component/Function', () => {
  describe('method/scenario', () => {
    it('should expected behavior when given input', () => {
      // Arrange - Set up test data
      const input = { email: 'test@example.com' };
      
      // Act - Execute the function
      const result = validateEmail(input.email);
      
      // Assert - Check the result
      expect(result).toBe(true);
    });
  });
});
```

### Test Fixtures

```typescript
// tests/fixtures/users.ts
export const testUsers = {
  admin: {
    id: 'admin-1',
    email: 'admin@test.com',
    role: 'admin',
  },
  candidate: {
    id: 'candidate-1',
    email: 'candidate@test.com',
    role: 'candidate',
  },
  employer: {
    id: 'employer-1',
    email: 'employer@test.com',
    role: 'employer',
  },
};

export const testJobs = {
  active: {
    id: 'job-1',
    title: 'Software Developer',
    status: 'active',
  },
  closed: {
    id: 'job-2',
    title: 'Project Manager',
    status: 'closed',
  },
};
```

## Best Practices

### Do's

- ✅ Write descriptive test names
- ✅ Test one thing per test
- ✅ Use meaningful assertions
- ✅ Clean up after tests
- ✅ Mock external services
- ✅ Use test fixtures
- ✅ Run tests in CI/CD

### Don'ts

- ❌ Test implementation details
- ❌ Share state between tests
- ❌ Use flaky selectors
- ❌ Ignore failing tests
- ❌ Write tests after bugs are fixed without regression tests

### Coverage Goals

| Type | Target |
|------|--------|
| Statements | 80% |
| Branches | 75% |
| Functions | 85% |
| Lines | 80% |

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm test:coverage
      - uses: codecov/codecov-action@v4

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
      - run: pnpm install
      - run: pnpm exec playwright install --with-deps
      - run: pnpm test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: apps/web/playwright-report/
```

### Pre-commit Hooks

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "vitest related --run"
    ]
  }
}
```

## Troubleshooting

### Common Issues

**Tests timing out:**
```typescript
// Increase timeout for slow tests
test('slow operation', async () => {
  // ...
}, 30000);
```

**Flaky E2E tests:**
```javascript
// Wait for network idle
await page.waitForLoadState('networkidle');

// Use explicit waits
await page.waitForSelector('[data-testid="job-list"]');
```

**Database connection issues:**
```typescript
// Ensure proper cleanup
afterAll(async () => {
  await prisma.$disconnect();
});
```

### Debug Mode

```bash
# Debug unit tests
pnpm test:debug

# Debug E2E tests
pnpm test:e2e:debug

# Debug specific test
pnpm test -- --grep "test name"
```
