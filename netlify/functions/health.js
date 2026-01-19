/**
 * Health check function for Netlify
 * Provides status of all services and dependencies
 */
const https = require('https');
const http = require('http');

/**
 * Check if a URL is reachable
 * @param {string} url - URL to check
 * @param {number} timeout - Timeout in ms
 * @returns {Promise<{ok: boolean, latency: number, error?: string}>}
 */
async function checkUrl(url, timeout = 5000) {
  const start = Date.now();
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, { timeout }, (res) => {
      const latency = Date.now() - start;
      resolve({ ok: res.statusCode >= 200 && res.statusCode < 400, latency, statusCode: res.statusCode });
    });
    req.on('error', (err) => {
      resolve({ ok: false, latency: Date.now() - start, error: err.message });
    });
    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, latency: timeout, error: 'Timeout' });
    });
  });
}

exports.handler = async (event, context) => {
  const startTime = Date.now();
  const checks = {};
  
  // Basic service info
  const nodeEnv = process.env.NODE_ENV || 'unknown';
  const region = process.env.AWS_REGION || context.awsRequestId ? 'aws-lambda' : 'local';
  
  // Check API endpoint if configured
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;
  if (apiUrl) {
    try {
      const apiCheck = await checkUrl(`${apiUrl}/`, 5000);
      checks.api = {
        status: apiCheck.ok ? 'healthy' : 'unhealthy',
        latency: apiCheck.latency,
        url: apiUrl,
        ...(apiCheck.error && { error: apiCheck.error }),
      };
    } catch (err) {
      checks.api = { status: 'error', error: err.message };
    }
  } else {
    checks.api = { status: 'not_configured' };
  }

  // Check database connectivity (via environment variable presence)
  checks.database = {
    status: process.env.DATABASE_URL ? 'configured' : 'not_configured',
    provider: process.env.DATABASE_URL?.includes('postgresql') ? 'postgres' : 
              process.env.DATABASE_URL?.includes('mysql') ? 'mysql' : 'unknown',
  };

  // Check email service configuration
  checks.email = {
    status: (process.env.SENDGRID_API_KEY || process.env.AWS_SES_ACCESS_KEY || process.env.SMTP_HOST) 
      ? 'configured' : 'not_configured',
    provider: process.env.SENDGRID_API_KEY ? 'sendgrid' :
              process.env.AWS_SES_ACCESS_KEY ? 'ses' :
              process.env.SMTP_HOST ? 'smtp' : 'none',
  };

  // Check Stripe configuration
  checks.stripe = {
    status: process.env.STRIPE_SECRET_KEY ? 'configured' : 'not_configured',
    webhookConfigured: !!process.env.STRIPE_WEBHOOK_SECRET,
  };

  // Check S3/storage configuration
  checks.storage = {
    status: (process.env.AWS_S3_BUCKET || process.env.CLOUDINARY_URL) ? 'configured' : 'not_configured',
    provider: process.env.AWS_S3_BUCKET ? 's3' :
              process.env.CLOUDINARY_URL ? 'cloudinary' : 'none',
  };

  // Check AI service configuration
  checks.ai = {
    status: (process.env.OPENAI_API_KEY || process.env.AI_PROTOTYPE_URL) ? 'configured' : 'not_configured',
    provider: process.env.OPENAI_API_KEY ? 'openai' :
              process.env.AI_PROTOTYPE_URL ? 'prototype' : 'none',
  };

  // Determine overall status
  const criticalServices = ['database'];
  const overallHealthy = criticalServices.every(
    (svc) => checks[svc]?.status === 'configured' || checks[svc]?.status === 'healthy'
  );

  const response = {
    status: overallHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    environment: nodeEnv,
    region,
    responseTime: Date.now() - startTime,
    version: process.env.COMMIT_REF || process.env.BUILD_ID || 'unknown',
    checks,
    netlify: {
      site: process.env.SITE_NAME || 'unknown',
      deployId: process.env.DEPLOY_ID || 'unknown',
      context: process.env.CONTEXT || 'unknown',
      branch: process.env.BRANCH || 'unknown',
    },
  };

  return {
    statusCode: overallHealthy ? 200 : 503,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, max-age=0',
    },
    body: JSON.stringify(response, null, 2),
  };
};
