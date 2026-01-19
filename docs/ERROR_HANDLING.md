# Error Handling Guide

Comprehensive error handling patterns for the Ngurra Pathways platform.

## Table of Contents

- [Error Classification](#error-classification)
- [API Errors](#api-errors)
- [Client-Side Errors](#client-side-errors)
- [Database Errors](#database-errors)
- [External Service Errors](#external-service-errors)
- [Error Reporting](#error-reporting)
- [Best Practices](#best-practices)

## Error Classification

### Error Categories

| Category | HTTP Status | Retryable | User Message |
|----------|-------------|-----------|--------------|
| Validation | 400 | No | Show field errors |
| Authentication | 401 | No | Prompt login |
| Authorization | 403 | No | Permission denied |
| Not Found | 404 | No | Resource not found |
| Conflict | 409 | No | Already exists |
| Rate Limited | 429 | Yes | Too many requests |
| Server Error | 500 | Yes | Something went wrong |
| Service Unavailable | 503 | Yes | Try again later |

### Error Hierarchy

```typescript
// Base error class
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error types
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 400, 'VALIDATION_ERROR', true, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR', true);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Permission denied') {
    super(message, 403, 'AUTHORIZATION_ERROR', true);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id 
      ? `${resource} with id ${id} not found`
      : `${resource} not found`;
    super(message, 404, 'NOT_FOUND', true, { resource, id });
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 409, 'CONFLICT', true, details);
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter: number) {
    super('Too many requests', 429, 'RATE_LIMITED', true, { retryAfter });
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, originalError?: Error) {
    super(`External service error: ${service}`, 503, 'SERVICE_ERROR', true, {
      service,
      originalMessage: originalError?.message,
    });
  }
}
```

## API Errors

### Error Middleware

```typescript
// Global error handler
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log error
  const logger = req.log || console;
  
  if (err instanceof AppError) {
    // Operational error - expected
    if (err.statusCode >= 500) {
      logger.error({ err, path: req.path }, 'Server error');
    } else {
      logger.warn({ err, path: req.path }, 'Client error');
    }
    
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
  } else {
    // Unexpected error
    logger.error({ err, path: req.path }, 'Unhandled error');
    
    // Don't expose internal errors in production
    const message = process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message;
    
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message,
      },
    });
  }
}

// Async handler wrapper
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
```

### Error Responses

```typescript
// Standardized error response format
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    validationErrors?: Array<{
      field: string;
      message: string;
      code: string;
    }>;
  };
  requestId?: string;
  timestamp: string;
}

// Example error responses
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "validationErrors": [
      {
        "field": "email",
        "message": "Invalid email format",
        "code": "invalid_email"
      },
      {
        "field": "password",
        "message": "Password must be at least 8 characters",
        "code": "min_length"
      }
    ]
  },
  "requestId": "req_abc123",
  "timestamp": "2024-01-15T10:30:00Z"
}

{
  "error": {
    "code": "NOT_FOUND",
    "message": "Job with id job_xyz not found",
    "details": {
      "resource": "Job",
      "id": "job_xyz"
    }
  },
  "requestId": "req_def456",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Validation Errors

```typescript
import { z } from 'zod';

// Transform Zod errors
export function formatZodError(error: z.ZodError): ValidationError {
  const validationErrors = error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
  }));
  
  return new ValidationError('Validation failed', { validationErrors });
}

// Usage in route handler
app.post('/api/jobs', asyncHandler(async (req, res) => {
  const result = createJobSchema.safeParse(req.body);
  
  if (!result.success) {
    throw formatZodError(result.error);
  }
  
  const job = await createJob(result.data);
  res.status(201).json(job);
}));
```

## Client-Side Errors

### Error Boundary

```tsx
import { Component, ReactNode, ErrorInfo } from 'react';
import { reportError } from '@/lib/errorReporting';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    reportError(error, { componentStack: errorInfo.componentStack });
    this.props.onError?.(error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-fallback" role="alert">
          <h2>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### API Error Handling

```typescript
// API client with error handling
export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(
        error.error.message,
        response.status,
        error.error.code,
        error.error.details
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network error
    throw new ApiError(
      'Network error. Please check your connection.',
      0,
      'NETWORK_ERROR'
    );
  }
}

// Custom hook for API errors
export function useApiError() {
  const [error, setError] = useState<ApiError | null>(null);
  
  const handleError = useCallback((err: unknown) => {
    if (err instanceof ApiError) {
      setError(err);
      
      // Auto-redirect for auth errors
      if (err.statusCode === 401) {
        router.push('/login');
      }
    } else {
      setError(new ApiError('An unexpected error occurred', 500, 'UNKNOWN'));
    }
  }, []);
  
  const clearError = useCallback(() => setError(null), []);
  
  return { error, handleError, clearError };
}
```

### Form Error Handling

```tsx
import { useForm } from '@/lib/formHelpers';

function RegistrationForm() {
  const { values, errors, handleChange, handleSubmit, isSubmitting } = useForm({
    initialValues: { email: '', password: '' },
    onSubmit: async (values) => {
      await register(values);
    },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!isValidEmail(values.email)) {
        errors.email = 'Please enter a valid email address';
      }
      if (values.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
      }
      return errors;
    },
  });

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          name="email"
          value={values.email}
          onChange={handleChange}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <span id="email-error" role="alert" className="error">
            {errors.email}
          </span>
        )}
      </div>
      
      <div>
        <input
          name="password"
          type="password"
          value={values.password}
          onChange={handleChange}
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? 'password-error' : undefined}
        />
        {errors.password && (
          <span id="password-error" role="alert" className="error">
            {errors.password}
          </span>
        )}
      </div>
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
}
```

## Database Errors

### Prisma Error Handling

```typescript
import { Prisma } from '@prisma/client';

export function handlePrismaError(error: unknown): AppError {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        // Unique constraint violation
        const field = (error.meta?.target as string[])?.join(', ') || 'field';
        return new ConflictError(`A record with this ${field} already exists`);
      
      case 'P2025':
        // Record not found
        return new NotFoundError('Record');
      
      case 'P2003':
        // Foreign key constraint
        return new ValidationError('Referenced record does not exist');
      
      case 'P2014':
        // Required relation violation
        return new ValidationError('Required related record is missing');
      
      default:
        return new AppError(`Database error: ${error.code}`, 500, 'DB_ERROR');
    }
  }
  
  if (error instanceof Prisma.PrismaClientValidationError) {
    return new ValidationError('Invalid data format');
  }
  
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return new AppError('Database connection failed', 503, 'DB_CONNECTION_ERROR');
  }
  
  return new AppError('Database error', 500, 'DB_ERROR');
}

// Usage
export async function createUser(data: CreateUserInput) {
  try {
    return await prisma.user.create({ data });
  } catch (error) {
    throw handlePrismaError(error);
  }
}
```

### Transaction Error Handling

```typescript
export async function transferApplication(applicationId: string, newJobId: string) {
  try {
    return await prisma.$transaction(async (tx) => {
      const application = await tx.application.findUniqueOrThrow({
        where: { id: applicationId },
      });
      
      const newJob = await tx.job.findUniqueOrThrow({
        where: { id: newJobId },
      });
      
      if (newJob.status !== 'active') {
        throw new ValidationError('Cannot transfer to inactive job');
      }
      
      return tx.application.update({
        where: { id: applicationId },
        data: { jobId: newJobId },
      });
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw handlePrismaError(error);
  }
}
```

## External Service Errors

### Retry Logic

```typescript
import { retry, RetryConfig } from '@/lib/retry';

const defaultConfig: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryableErrors: ['ETIMEDOUT', 'ECONNRESET', 'ECONNREFUSED'],
  retryableStatuses: [502, 503, 504, 429],
};

export async function callExternalService<T>(
  serviceName: string,
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  try {
    return await retry(fn, { ...defaultConfig, ...config });
  } catch (error) {
    throw new ExternalServiceError(serviceName, error as Error);
  }
}

// Usage
const resumeData = await callExternalService('resume-parser', async () => {
  const response = await fetch(RESUME_PARSER_URL, {
    method: 'POST',
    body: resumeFile,
  });
  
  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}`);
    (error as any).status = response.status;
    throw error;
  }
  
  return response.json();
});
```

### Circuit Breaker

```typescript
interface CircuitState {
  failures: number;
  lastFailure: number;
  state: 'closed' | 'open' | 'half-open';
}

const circuits = new Map<string, CircuitState>();

const FAILURE_THRESHOLD = 5;
const RECOVERY_TIMEOUT = 30000;

export async function withCircuitBreaker<T>(
  serviceName: string,
  fn: () => Promise<T>
): Promise<T> {
  const circuit = circuits.get(serviceName) || {
    failures: 0,
    lastFailure: 0,
    state: 'closed',
  };

  // Check if circuit is open
  if (circuit.state === 'open') {
    const elapsed = Date.now() - circuit.lastFailure;
    if (elapsed < RECOVERY_TIMEOUT) {
      throw new ExternalServiceError(serviceName, new Error('Circuit is open'));
    }
    circuit.state = 'half-open';
  }

  try {
    const result = await fn();
    
    // Success - reset circuit
    circuit.failures = 0;
    circuit.state = 'closed';
    circuits.set(serviceName, circuit);
    
    return result;
  } catch (error) {
    circuit.failures++;
    circuit.lastFailure = Date.now();
    
    if (circuit.failures >= FAILURE_THRESHOLD) {
      circuit.state = 'open';
    }
    
    circuits.set(serviceName, circuit);
    throw error;
  }
}
```

### Timeout Handling

```typescript
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  operation: string
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new AppError(`${operation} timed out`, 504, 'TIMEOUT'));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

// Usage
const result = await withTimeout(
  fetch(externalUrl),
  5000,
  'External API call'
);
```

## Error Reporting

### Sentry Integration

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: process.env.APP_VERSION,
  tracesSampleRate: 0.1,
  beforeSend(event, hint) {
    // Filter out non-operational errors
    const error = hint.originalException;
    if (error instanceof AppError && error.isOperational) {
      // Don't send expected operational errors
      if (error.statusCode < 500) {
        return null;
      }
    }
    return event;
  },
});

// Report error with context
export function reportError(error: Error, context?: Record<string, unknown>) {
  Sentry.withScope((scope) => {
    if (context) {
      scope.setExtras(context);
    }
    Sentry.captureException(error);
  });
}
```

### Error Context

```typescript
// Add context to errors
export function enrichError(
  error: AppError,
  context: Record<string, unknown>
): AppError {
  error.details = { ...error.details, ...context };
  return error;
}

// Usage in route
app.post('/api/applications', asyncHandler(async (req, res) => {
  try {
    const application = await createApplication(req.body, req.user.id);
    res.status(201).json(application);
  } catch (error) {
    if (error instanceof AppError) {
      throw enrichError(error, {
        userId: req.user.id,
        jobId: req.body.jobId,
        action: 'createApplication',
      });
    }
    throw error;
  }
}));
```

## Best Practices

### Do's

1. **Use specific error types** - Create error classes for different scenarios
2. **Include error codes** - Machine-readable codes for client handling
3. **Provide helpful messages** - Clear, actionable user messages
4. **Log with context** - Include request ID, user ID, relevant data
5. **Fail fast** - Validate early, return errors immediately
6. **Handle async errors** - Use try/catch or async handlers
7. **Use error boundaries** - Prevent crashes from propagating
8. **Report to monitoring** - Track errors for analysis

### Don'ts

1. **Don't expose internals** - Hide stack traces, SQL errors in production
2. **Don't swallow errors** - Always handle or rethrow
3. **Don't use generic errors** - Be specific about what went wrong
4. **Don't ignore validation** - Validate all inputs
5. **Don't block on retries** - Use exponential backoff
6. **Don't log sensitive data** - Sanitize passwords, tokens

### Error Message Guidelines

```typescript
// ✅ Good - Clear, actionable
"Your session has expired. Please log in again."
"Email address is already registered. Try logging in instead."
"The file must be smaller than 10MB."

// ❌ Bad - Technical, unhelpful
"ECONNREFUSED"
"Unique constraint failed on email"
"Error: null reference"
```

### Checklist

- [ ] All routes use asyncHandler
- [ ] Global error middleware configured
- [ ] Specific error types for each scenario
- [ ] Zod validation with formatted errors
- [ ] Database errors properly mapped
- [ ] External service errors wrapped
- [ ] Error boundary around main app
- [ ] Sentry/monitoring configured
- [ ] Error logging with context
- [ ] User-friendly error messages
- [ ] No sensitive data in error responses
