"use strict";
/**
 * Enhanced Rate Limiting Middleware
 * 
 * Provides tiered rate limits based on:
 * - Endpoint type (public/authenticated/admin)
 * - User type (member/company/admin)
 * - Subscription tier (free/pro/enterprise)
 */

const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const Redis = require('ioredis');

// Only create Redis client if REDIS_URL is explicitly set
const redisClient = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL, {
  connectTimeout: 500,
  enableOfflineQueue: false,
  maxRetriesPerRequest: 1,
  retryStrategy: () => null,
}) : null;

const isE2E = process.env.NODE_ENV === 'test' || process.env.SES_TEST_CAPTURE === '1';

// E2E tests get very high limits to avoid flakiness
const E2E_MULTIPLIER = isE2E ? 50 : 1;

/**
 * Rate limit configurations by endpoint type
 */
const RATE_LIMITS = {
  // Public endpoints (login, registration, job listings)
  public: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500 * E2E_MULTIPLIER, // Increased from 100 for initial deployment
    message: { error: 'Too many requests. Please try again in 15 minutes.' }
  },
  
  // Authenticated user endpoints
  authenticated: {
    windowMs: 15 * 60 * 1000,
    max: 500 * E2E_MULTIPLIER, // Increased from 300
    message: { error: 'Rate limit exceeded. Please slow down.' }
  },
  
  // Sensitive endpoints (password reset, verification)
  sensitive: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10 * E2E_MULTIPLIER,
    message: { error: 'Too many attempts. Please try again in an hour.' }
  },
  
  // AI endpoints (expensive operations)
  ai: {
    windowMs: 60 * 1000, // 1 minute
    max: 10 * E2E_MULTIPLIER,
    message: { error: 'AI rate limit reached. Please wait before making more AI requests.' }
  },
  
  // File uploads
  uploads: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50 * E2E_MULTIPLIER,
    message: { error: 'Upload limit reached. Please try again later.' }
  },
  
  // Admin endpoints
  admin: {
    windowMs: 15 * 60 * 1000,
    max: 500 * E2E_MULTIPLIER,
    message: { error: 'Admin rate limit exceeded.' }
  },
  
  // Search endpoints
  search: {
    windowMs: 60 * 1000, // 1 minute
    max: 30 * E2E_MULTIPLIER,
    message: { error: 'Search rate limit reached. Please wait before searching again.' }
  }
};

/**
 * Create a rate limiter for a specific endpoint type
 * @param {string} type - One of: public, authenticated, sensitive, ai, uploads, admin, search
 * @param {Object} overrides - Optional config overrides
 */
function createRateLimiter(type, overrides = {}) {
  const config = RATE_LIMITS[type] || RATE_LIMITS.public;
  
  // Only use Redis store if Redis client is available and not in test mode
  const useRedisStore = !isE2E && redisClient;
  
  return rateLimit({
    ...config,
    ...overrides,
    standardHeaders: true,
    legacyHeaders: false,
    // Use MemoryStore if Redis not configured or in tests
    store: useRedisStore ? new RedisStore({
      sendCommand: (...args) => redisClient.call(...args),
    }) : undefined,
    // Use IP + user ID for authenticated endpoints
    keyGenerator: (req) => {
      const userId = req.user?.id || req.user?.userId || '';
      const ip = req.ip || req.connection?.remoteAddress || 'unknown';
      return userId ? `${ip}-${userId}` : ip;
    },
    skip: (req) => {
      // Skip rate limiting for health checks
      if (req.path === '/health' || req.path === '/') return true;
      return false;
    }
  });
}

/**
 * Subscription-aware rate limiter
 * Increases limits based on subscription tier
 */
function subscriptionAwareRateLimiter(baseType = 'authenticated') {
  return (req, res, next) => {
    const subscription = req.subscription || {};
    const tier = subscription.tier || 'FREE';
    
    // Multipliers by tier
    const tierMultipliers = {
      FREE: 1,
      STARTER: 1.5,
      PRO: 2,
      ENTERPRISE: 5
    };
    
    const multiplier = tierMultipliers[tier] || 1;
    const baseConfig = RATE_LIMITS[baseType] || RATE_LIMITS.authenticated;
    
    const limiter = rateLimit({
      ...baseConfig,
      max: Math.floor(baseConfig.max * multiplier),
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req) => {
        const userId = req.user?.id || req.user?.userId || '';
        const ip = req.ip || 'unknown';
        return userId ? `${ip}-${userId}` : ip;
      }
    });
    
    return limiter(req, res, next);
  };
}

// Pre-configured limiters for common use cases
const limiters = {
  public: createRateLimiter('public'),
  authenticated: createRateLimiter('authenticated'),
  sensitive: createRateLimiter('sensitive'),
  ai: createRateLimiter('ai'),
  uploads: createRateLimiter('uploads'),
  admin: createRateLimiter('admin'),
  search: createRateLimiter('search')
};

export {
  createRateLimiter,
  subscriptionAwareRateLimiter,
  limiters,
  RATE_LIMITS
};

