import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import Redis from 'ioredis';
import hpp from 'hpp';
import { prisma } from './db';

// Load environment variables first
dotenv.config();

// Environment validation (validates on import)
import { validateEnv, config } from './lib/env';
const envConfig = validateEnv();
if (envConfig) {
  console.log('✅ Environment validation passed');
} else {
  console.warn('⚠️  Running with default configuration (development mode)');
}

// Structured logging
import { logger } from './lib/logger';
// Standardized error handling
import { requestIdMiddleware, notFoundHandler, errorHandler } from './lib/errorHandler';
// Enhanced middleware
import { limiters, cacheMiddleware, securitySanitize, blockScanners, validateContentType, requestLogger } from './middleware';
// Deployment/Health
import * as deployment from './lib/deployment';
// Maintenance mode and metrics
import { maintenanceMiddleware } from './lib/maintenanceMode';
import { metricsMiddleware, getMetrics, getMetricsSummary } from './lib/metrics';

// Routes
import webhooksRouter from './routes/webhooks';
import membersRouter from './routes/members';
import companiesRouter from './routes/companies';
import companyJobsRouter from './routes/companyJobs';
import memberApplicationsRouter from './routes/memberApplications';
import adminTemplatesRouter from './routes/adminTemplates';
import jobsRouter from './routes/jobs';
import uploadsRouter from './routes/uploads';
import aiRouter from './routes/ai';
import testHarnessRouter from './routes/testHarness';
import mentorsRouter from './routes/mentors';
import tafeRouter from './routes/tafe';
import analyticsRouter from './routes/analytics';
import subscriptionsRouter from './routes/subscriptions';
import billingRouter from './routes/billing';
import mentorshipRouter from './routes/mentorship';
import coursesRouter from './routes/courses';
import healthRouter from './routes/health';
import forumsRouter from './routes/forums';
import badgesRouter from './routes/badges';
import skillsRouter from './routes/skills';
import storiesRouter from './routes/stories';
import featuredRouter from './routes/featured';
import reportingRouter from './routes/reporting';
import subscriptionsV2Router from './routes/subscriptions-v2';
import analyticsEmployerRouter from './routes/analytics-employer';
import rapRouter from './routes/rap';
import coursePaymentsRouter from './routes/course-payments';
import whiteLabelRouter from './routes/white-label';
import docsRouter from './routes/docs';
import communityRouter from './routes/community';
import verificationRouter from './routes/verification';
import notificationsRouter from './routes/notifications';
import mentorPayoutsRouter from './routes/mentor-payouts';
import contactRouter from './routes/contact';
import advertisingRouter from './routes/advertising';
import adminRouter from './routes/admin';
import messagesRouter from './routes/messages';
import organizationsRouter from './routes/organizations';
import groupsRouter from './routes/groups';
import socialFeedRouter from './routes/social-feed';
import safetyRouter from './routes/safety';
import moderationRouter from './routes/moderation';
import connectionsRouter from './routes/connections';
import socialNotificationsRouter from './routes/social-notifications';
import eventsRouter from './routes/events';
import referralsRouter from './routes/referrals';
import leaderboardRouter from './routes/leaderboard';
import wellnessRouter from './routes/wellness';
import financialRouter from './routes/financial';
import rentalsRouter from './routes/rentals';
import housingRouter from './routes/housing';
import experimentsRouter from './routes/experiments';
import recordingsRouter from './routes/recordings';
import learningRouter from './routes/learning';
import alumniMentorsRouter from './routes/alumni-mentors';
import candidateMatchingRouter from './routes/candidate-matching';
import liveMessagesRouter from './routes/live-messages';
import profileImportRouter from './routes/profile-import';
import advisoryRouter from './routes/advisory';
import governmentRouter from './routes/government';
import procurementRouter from './routes/procurement';
import civicRouter from './routes/civic';
import searchRouter from './routes/search';
import apiKeysRouter from './routes/api-keys';
import webhookEndpointsRouter from './routes/webhook-endpoints';
import ssoRouter from './routes/sso';
import bulkImportRouter from './routes/bulk-import';
import tenantRouter from './routes/tenant';
import recommendationsRouter from './routes/recommendations';
import infrastructureRouter from './routes/infrastructure';
import securityRouter from './routes/security';
import sessionsRouter from './routes/sessions';
import emailTemplatesRouter from './routes/email-templates';
import calendarRouter from './routes/calendar';
import resumeParserRouter from './routes/resume-parser';
import adminHealthRouter from './routes/admin-health';
import resourcesRouter from './routes/resources';
import bookmarksRouter from './routes/bookmarks';
import employerRouter from './routes/employer';
import videoSessionsRouter from './routes/videoSessions';
import preApplyRouter from './routes/pre-apply';
import adminSchedulerRouter from './routes/admin-scheduler';
import sitemapRouter from './routes/sitemap';
import jobPerformanceRouter from './routes/job-performance';
import coverLettersRouter from './routes/cover-letters';
import businessFormationRouter from './routes/business-formation';
import certificationsRouter from './routes/certifications';
import womenBusinessRouter from './routes/women-business';
import legalDocumentsRouter from './routes/legal-documents';
import cashbookRouter from './routes/cashbook';
import financeRouter from './routes/finance';
import marketplaceRouter from './routes/marketplace';
import liveStreamingRouter from './routes/live-streaming';
import authRouter from './routes/auth';
import culturalRouter from './routes/cultural';
import socialStoriesRouter from './routes/social-stories';
import pulseRouter from './routes/pulse';

export function createApp() {
    /** Create Express app and configure middleware */
    const app = express();

    // Attach shared Prisma client to app.locals for routes that depend on it
    app.locals.prisma = prisma;

    // Step 6: Trust proxy - Required for correct IP detection behind Nginx/Load Balancer
    // Set to 1 for single proxy, or 'loopback' for localhost only, or number of hops
    // This ensures rate limiting and audit logs record the real client IP
    const trustProxyValue = process.env.TRUST_PROXY || '1';
    app.set('trust proxy', trustProxyValue === 'true' ? true : 
      trustProxyValue === 'false' ? false : 
      /^\d+$/.test(trustProxyValue) ? parseInt(trustProxyValue, 10) : trustProxyValue);

    const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001,https://ngurrapathways.com.au,https://www.ngurrapathways.com.au').split(',').map((s) => s.trim()).filter(Boolean);
    const nodeEnv = String(process.env.NODE_ENV || 'development').toLowerCase();
    const sesTestCapture = String(process.env.SES_TEST_CAPTURE || '').toLowerCase();
    const isE2E = nodeEnv === 'test' || sesTestCapture === '1';

    // Rate limiting
    // IMPORTANT: In development we prefer the default in-memory store.
    // A misconfigured Redis store can hang *all* requests (including /health).
    const useRedisRateLimit =
        String(process.env.RATE_LIMIT_STORE || '').toLowerCase() === 'redis' || nodeEnv === 'production';

    let limiterStore: RedisStore | undefined;
    let rateLimitRedisClient: Redis | undefined;

    if (useRedisRateLimit) {
        rateLimitRedisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
            connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT_MS || '500', 10),
            enableOfflineQueue: false,
            maxRetriesPerRequest: 1,
            retryStrategy: () => null,
        });

        limiterStore = new RedisStore({
            sendCommand: (...args: string[]) => {
                const [command, ...params] = args;
                return rateLimitRedisClient!.call(command, ...params) as any;
            },
        });
    }

    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        // Keep production reasonably protected, but avoid test flakiness from 429s.
        // Relax rate limit in development to prevent local issues
        max: (isE2E || nodeEnv === 'development') ? 100000 : 300, 
        skip: (req) => nodeEnv === 'development', // Skip entirely in development
        standardHeaders: true,
        legacyHeaders: false,
        ...(limiterStore ? { store: limiterStore } : {}),
    });

    app.use(requestIdMiddleware);
    app.use(helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        strictTransportSecurity: {
            maxAge: 31536000, // 1 year
            includeSubDomains: true,
            preload: true,
        },
        xPoweredBy: false, // Explicitly disable X-Powered-By
        xFrameOptions: { action: "deny" } as any, // Prevent clickjacking
        xDnsPrefetchControl: { allow: false }, // Disable DNS prefetch
        xDownloadOptions: { action: "noopen" } as any, // Prevent IE8+ from opening HTML files
        xPermittedCrossDomainPolicies: { permittedPolicies: "none" }, // Prevent Flash/Acrobat cross-domain policies
    }));
    app.use(blockScanners); // Block common vulnerability scanners
    app.use(validateContentType); // Validate content type
    app.use(compression());
    app.use(limiter);
    app.use(cors({
        origin: (origin, callback) => {
            if (!origin)
                return callback(null, true);
            // Strict CORS: Only allow origins explicitly listed in ALLOWED_ORIGINS
            const allowed = allowedOrigins.includes(origin);
            return allowed ? callback(null, true) : callback(new Error('CORS not allowed'));
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    }));

    // Request logging (structured)
    app.use(requestLogger());

    // Maintenance mode check (Step 77)
    // Allows admins through, shows maintenance page to regular users
    app.use(maintenanceMiddleware());

    // Request metrics collection (Step 95)
    app.use(metricsMiddleware);

    // Stripe webhooks require raw body for signature verification
    // This must be before express.json() middleware
    app.use('/webhooks', express.raw({ type: 'application/json' }), webhooksRouter);

    // JSON parser for all other routes
    app.use(express.json());

    // Security Middleware that requires parsed body
    // app.use(hpp()); // Prevent HTTP Parameter Pollution - Disabled due to getter-only query property in some environments
    app.use(securitySanitize); // Sanitize input (XSS prevention)

    const mountRoutes = (base: any) => {
        // Authentication routes (public)
        base.use('/auth', authRouter);
        // Mount member routes
        base.use('/member', membersRouter);
        base.use('/uploads', limiters.uploads, uploadsRouter);
        // Company routes
        base.use('/company', companiesRouter);
        // company jobs
        base.use('/company/jobs', companyJobsRouter);
        base.use('/member/applications', memberApplicationsRouter);
        // admin templates
        base.use('/admin', adminTemplatesRouter);
        // Public jobs - with caching for listings
        base.use('/jobs', cacheMiddleware('jobs'), jobsRouter);
        // Unified search endpoint
        base.use('/search', searchRouter);

        base.use('/recommendations', recommendationsRouter);

        // Test harness endpoints
        if (nodeEnv !== 'production' || sesTestCapture === '1') {
            base.use('/__test', testHarnessRouter);
        }

        // AI Routers - with AI-specific rate limiting
        base.use('/ai', limiters.ai, aiRouter);
        // Mentor + TAFE profile routes
        base.use('/mentor', mentorsRouter);
        base.use('/tafe', tafeRouter);
        // Analytics and subscription routes
        base.use('/analytics', analyticsRouter);
        base.use('/subscriptions', subscriptionsRouter);
        // Phase 2 Billing aliases (kept separate from /subscriptions)
        base.use('/billing', billingRouter);
        // Mentorship matching routes
        base.use('/mentorship', mentorshipRouter);
        // Training/Courses routes - with caching
        base.use('/courses', cacheMiddleware('courses'), coursesRouter);
        // Health check routes
        base.use('/health', healthRouter);
        // Community forums
        base.use('/forums', forumsRouter);
        // Badges and credentials
        base.use('/badges', badgesRouter);
        // Skills taxonomy
        base.use('/skills', skillsRouter);
        // Success stories
        base.use('/stories', storiesRouter);
        // Featured jobs and partners
        base.use('/featured', featuredRouter);
        // RAP and impact reporting
        base.use('/reporting', reportingRouter);
        // Enhanced subscriptions with Stripe
        base.use('/subscriptions/v2', subscriptionsV2Router);

        // Live video calls (Phase 2)
        base.use('/video-sessions', videoSessionsRouter);
        // Employer analytics
        base.use('/analytics/employer', analyticsEmployerRouter);

        // RAP routes
        base.use('/rap', rapRouter);

        // Course payments and enrolment
        base.use('/course-payments', coursePaymentsRouter);

        // Enterprise Features - Phase H
        base.use('/api-keys', apiKeysRouter);
        base.use('/webhook-endpoints', webhookEndpointsRouter);
        base.use('/sso', ssoRouter);
        base.use('/bulk-import', bulkImportRouter);
        base.use('/tenant', tenantRouter);

        // Social networking routes
        base.use('/organizations', organizationsRouter);
        base.use('/groups', groupsRouter);
        base.use('/social-feed', socialFeedRouter);
        // Backward-compatible alias for older web routes
        base.use('/feed', socialFeedRouter);
        base.use('/safety', safetyRouter);
        // Phase 2: automated moderation checks
        base.use('/moderation', moderationRouter);
        base.use('/connections', connectionsRouter);
        base.use('/social-notifications', socialNotificationsRouter);
        base.use('/events', eventsRouter);
        // Resource library
        base.use('/resources', resourcesRouter);
        base.use('/bookmarks', bookmarksRouter);
        // Employer workflow APIs (ATS/interviews/offers/job editor)
        base.use('/employer', employerRouter);
        base.use('/referrals', referralsRouter);
        base.use('/leaderboard', leaderboardRouter);
        base.use('/wellness', wellnessRouter);
        base.use('/financial', financialRouter);
        base.use('/rentals', rentalsRouter);
        base.use('/housing', housingRouter);
        base.use('/experiments', experimentsRouter);
        base.use('/recordings', recordingsRouter);
        base.use('/learning', learningRouter);
        base.use('/alumni-mentors', alumniMentorsRouter);
        base.use('/candidate-matching', candidateMatchingRouter);
        base.use('/live-messages', liveMessagesRouter);
        base.use('/profile-import', profileImportRouter);
        base.use('/advisory', advisoryRouter);
        base.use('/government', governmentRouter);
        // Phase 10: Public Sector & Government
        base.use('/procurement', procurementRouter);
        base.use('/civic', civicRouter);
        // Pre-apply job matching
        base.use('/pre-apply', preApplyRouter);
        base.use('/white-label', whiteLabelRouter);
        base.use('/docs', docsRouter);
        base.use('/community', communityRouter);
        base.use('/verification', verificationRouter);
        base.use('/notifications', notificationsRouter);
        base.use('/mentor-payouts', mentorPayoutsRouter);
        base.use('/contact', contactRouter);
        base.use('/advertising', advertisingRouter);
        base.use('/admin-routes', adminRouter); // Renamed to avoid conflict with adminTemplates
        base.use('/admin/infrastructure', infrastructureRouter); // Infrastructure monitoring routes
        base.use('/admin/scheduler', adminSchedulerRouter); // Job alerts & pre-apply scheduler
        base.use('/security', securityRouter); // Security settings (2FA, sessions)
        base.use('/sessions', sessionsRouter); // Session management
        base.use('/messages', messagesRouter);
        base.use('/email-templates', emailTemplatesRouter);
        base.use('/calendar', calendarRouter);
        base.use('/resume', resumeParserRouter);
        base.use('/admin/health', adminHealthRouter);
        // SEO sitemap data endpoints
        base.use('/sitemap', sitemapRouter);
        // Job performance analytics (Phase 3)
        base.use('/job-performance', jobPerformanceRouter);

        // Phase 2: Cover letter builder
        base.use('/cover-letters', coverLettersRouter);
        // Phase 3: Business formation wizard
        base.use('/business-formation', businessFormationRouter);
        // Phase 2-3: Women business tools, legal docs, accounting and marketplace
        base.use('/women-business', womenBusinessRouter);
        base.use('/legal-documents', legalDocumentsRouter);
        base.use('/cashbook', cashbookRouter);
        base.use('/finance', financeRouter);
        base.use('/marketplace', marketplaceRouter);
        // Phase 6: Certifications and credentials tracking
        base.use('/certifications', certificationsRouter);
        // Phase 8.4: Live streaming and audio rooms
        base.use('/live', liveStreamingRouter);
        // Cultural safety features
        base.use('/cultural', culturalRouter);
        // Social stories (ephemeral 24-hour stories)
        base.use('/social-stories', socialStoriesRouter);
        // Phase 9: Short Video Platform (Pulse)
        base.use('/pulse', pulseRouter);
    };

    // Mount routes at root
    mountRoutes(app);
    // Also mount under /api for compatibility with tests/clients
    const apiRouter = express.Router();
    mountRoutes(apiRouter);
    app.use('/api', apiRouter);


    // Kubernetes-style health probes
    app.get('/health/live', (req, res) => {
        if (deployment.isAlive()) {
            res.status(200).json({ alive: true, uptime: process.uptime() });
        } else {
            res.status(503).json({ alive: false });
        }
    });

    app.get('/health/ready', (req, res) => {
        if (deployment.isReady()) {
            res.status(200).json({ ready: true });
        } else {
            res.status(503).json({ ready: false, reason: 'shutting_down' });
        }
    });

    app.get('/health/startup', async (req, res) => {
        const health = await deployment.performHealthCheck();
        const statusCode = health.status === 'healthy' ? 200 : 503;
        res.status(statusCode).json(health);
    });

    // Backwards-compatible root health endpoint
    app.get('/health', async (req, res) => {
        const health = await deployment.performHealthCheck();
        const statusCode = health.status === 'healthy' ? 200 : 503;
        res.status(statusCode).json(health);
    });

    // Prometheus-compatible metrics endpoint (Step 95)
    app.get('/metrics', (req, res) => {
        const authHeader = req.headers.authorization;
        // Require bearer token for metrics access in production
        if (process.env.NODE_ENV === 'production') {
            const metricsToken = process.env.METRICS_SECRET_TOKEN;
            if (metricsToken && authHeader !== `Bearer ${metricsToken}`) {
                return void res.status(401).json({ error: 'Unauthorized' });
            }
        }
        const metrics = getMetrics();
        res.set('Content-Type', 'text/plain');
        res.send(metrics);
    });

    // Metrics summary (JSON format for dashboards)
    app.get('/metrics/summary', (req, res) => {
        const authHeader = req.headers.authorization;
        if (process.env.NODE_ENV === 'production') {
            const metricsToken = process.env.METRICS_SECRET_TOKEN;
            if (metricsToken && authHeader !== `Bearer ${metricsToken}`) {
                return void res.status(401).json({ error: 'Unauthorized' });
            }
        }
        const summary = getMetricsSummary();
        res.json(summary);
    });

    // Root health endpoint
    app.get('/', (req, res) => {
        res.json({ status: 'ok', env: process.env.NODE_ENV || 'development', version: '1.0.0' });
    });

    // Not found + global error handling
    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}

