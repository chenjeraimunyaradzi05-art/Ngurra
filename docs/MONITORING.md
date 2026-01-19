# Monitoring Guide

Comprehensive monitoring and observability guide for the Ngurra Pathways platform.

## Table of Contents

- [Overview](#overview)
- [Metrics Collection](#metrics-collection)
- [Logging](#logging)
- [Alerting](#alerting)
- [Dashboards](#dashboards)
- [Health Checks](#health-checks)
- [Troubleshooting](#troubleshooting)

## Overview

### Monitoring Stack

| Component | Tool | Purpose |
|-----------|------|---------|
| Metrics | Prometheus | Time-series metrics |
| Visualization | Grafana | Dashboards |
| Logging | Pino + ELK | Structured logs |
| Tracing | OpenTelemetry | Distributed tracing |
| Alerting | PagerDuty/Slack | Incident notification |
| APM | Sentry | Error tracking |

### Key Metrics

- **Availability**: Uptime percentage, health check status
- **Latency**: Response times (p50, p95, p99)
- **Throughput**: Requests per second
- **Error Rate**: 4xx and 5xx responses
- **Saturation**: CPU, memory, connections

## Metrics Collection

### Application Metrics

```typescript
import { metricsMiddleware, getPrometheusMetrics } from '@/lib/metrics';

// Apply metrics middleware
app.use(metricsMiddleware);

// Expose Prometheus endpoint
app.get('/metrics', async (req, res) => {
  const metrics = getPrometheusMetrics();
  res.type('text/plain').send(metrics);
});
```

### Custom Metrics

```typescript
import { counter, histogram, gauge } from '@/lib/metrics';

// Count events
counter('jobs.posted', { company: 'acme' });
counter('applications.submitted', { jobId: '123' });

// Track durations
histogram('db.query.duration', queryTime, { query: 'findJobs' });
histogram('external.api.latency', apiTime, { service: 'resume-parser' });

// Track current state
gauge('queue.length', queueSize, { queue: 'email' });
gauge('active.connections', connectionCount);
gauge('cache.hit.rate', hitRate);
```

### System Metrics

```typescript
// Collect Node.js metrics
import { collectDefaultMetrics } from 'prom-client';
collectDefaultMetrics({ prefix: 'ngurra_' });

// Memory usage
const memoryMetrics = () => ({
  heapUsed: process.memoryUsage().heapUsed,
  heapTotal: process.memoryUsage().heapTotal,
  external: process.memoryUsage().external,
  rss: process.memoryUsage().rss,
});

// Event loop lag
import { monitorEventLoopDelay } from 'perf_hooks';
const h = monitorEventLoopDelay({ resolution: 20 });
h.enable();
gauge('nodejs.eventloop.lag', h.mean / 1e6);
```

### Database Metrics

```typescript
// Prisma metrics
prisma.$on('query', (e) => {
  histogram('prisma.query.duration', e.duration, {
    query: e.query.substring(0, 50),
  });
});

// Connection pool metrics
gauge('db.pool.active', pool.activeConnections);
gauge('db.pool.idle', pool.idleConnections);
gauge('db.pool.waiting', pool.waitingClients);
```

## Logging

### Structured Logging

```typescript
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  base: {
    service: 'ngurra-api',
    env: process.env.NODE_ENV,
  },
});

// Request logging
app.use((req, res, next) => {
  req.log = logger.child({
    requestId: req.headers['x-request-id'] || uuid(),
    method: req.method,
    path: req.path,
    userAgent: req.headers['user-agent'],
  });
  next();
});
```

### Log Levels

| Level | Usage |
|-------|-------|
| `error` | Errors requiring immediate attention |
| `warn` | Unusual conditions, degraded operation |
| `info` | Significant business events |
| `debug` | Detailed diagnostic information |
| `trace` | Very detailed tracing |

### Log Examples

```typescript
// Error with context
logger.error({
  err: error,
  userId: user.id,
  action: 'createApplication',
  jobId: job.id,
}, 'Failed to create application');

// Info event
logger.info({
  userId: user.id,
  jobId: job.id,
  applicationId: app.id,
}, 'Application submitted successfully');

// Warning
logger.warn({
  userId: user.id,
  rateLimitRemaining: 5,
}, 'User approaching rate limit');

// Debug
logger.debug({
  query: 'findJobs',
  params: { status: 'active' },
  duration: 45,
}, 'Database query completed');
```

### Log Aggregation

```yaml
# fluent-bit config
[INPUT]
    Name              tail
    Path              /var/log/ngurra/*.log
    Parser            json
    Tag               ngurra.*

[FILTER]
    Name              parser
    Match             ngurra.*
    Key_Name          message
    Parser            json

[OUTPUT]
    Name              es
    Match             ngurra.*
    Host              elasticsearch
    Port              9200
    Index             ngurra-logs
```

## Alerting

### Alert Rules

```yaml
# prometheus-alerts.yml
groups:
  - name: ngurra-alerts
    rules:
      # High error rate
      - alert: HighErrorRate
        expr: |
          sum(rate(http_requests_total{status=~"5.."}[5m])) 
          / sum(rate(http_requests_total[5m])) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }}"

      # Slow responses
      - alert: SlowResponses
        expr: |
          histogram_quantile(0.95, 
            rate(http_request_duration_seconds_bucket[5m])
          ) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Slow API responses"
          description: "95th percentile latency is {{ $value }}s"

      # Service down
      - alert: ServiceDown
        expr: up{job="ngurra-api"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Ngurra API is down"

      # Database connection issues
      - alert: DatabaseConnectionsExhausted
        expr: db_pool_waiting > 10
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Database connection pool exhausted"

      # High memory usage
      - alert: HighMemoryUsage
        expr: |
          process_resident_memory_bytes 
          / node_memory_MemTotal_bytes > 0.85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"

      # Queue backup
      - alert: QueueBacklog
        expr: queue_length > 1000
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Job queue backlog"
```

### Notification Channels

```typescript
// Alert notifier configuration
const alertChannels = {
  critical: [
    { type: 'pagerduty', serviceKey: process.env.PAGERDUTY_KEY },
    { type: 'slack', webhook: process.env.SLACK_CRITICAL_WEBHOOK },
  ],
  warning: [
    { type: 'slack', webhook: process.env.SLACK_ALERTS_WEBHOOK },
  ],
  info: [
    { type: 'email', recipients: ['ops@ngurra-pathways.com'] },
  ],
};
```

### Alert Routing

```yaml
# alertmanager.yml
route:
  receiver: 'default'
  group_by: ['alertname', 'service']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  routes:
    - match:
        severity: critical
      receiver: 'pagerduty'
      continue: true
    - match:
        severity: critical
      receiver: 'slack-critical'
    - match:
        severity: warning
      receiver: 'slack-warnings'

receivers:
  - name: 'pagerduty'
    pagerduty_configs:
      - service_key: '${PAGERDUTY_SERVICE_KEY}'
  
  - name: 'slack-critical'
    slack_configs:
      - api_url: '${SLACK_WEBHOOK_CRITICAL}'
        channel: '#alerts-critical'
        title: '{{ .GroupLabels.alertname }}'
        text: '{{ .CommonAnnotations.description }}'
  
  - name: 'slack-warnings'
    slack_configs:
      - api_url: '${SLACK_WEBHOOK_WARNINGS}'
        channel: '#alerts'
```

## Dashboards

### API Dashboard

```json
{
  "title": "Ngurra API Dashboard",
  "panels": [
    {
      "title": "Request Rate",
      "type": "graph",
      "query": "sum(rate(http_requests_total[5m])) by (method)"
    },
    {
      "title": "Error Rate",
      "type": "singlestat",
      "query": "sum(rate(http_requests_total{status=~\"5..\"}[5m])) / sum(rate(http_requests_total[5m])) * 100"
    },
    {
      "title": "Response Time (p95)",
      "type": "graph",
      "query": "histogram_quantile(0.95, rate(http_request_duration_bucket[5m]))"
    },
    {
      "title": "Active Connections",
      "type": "gauge",
      "query": "active_connections"
    }
  ]
}
```

### Database Dashboard

```json
{
  "title": "Database Dashboard",
  "panels": [
    {
      "title": "Query Time",
      "query": "histogram_quantile(0.95, rate(prisma_query_duration_bucket[5m]))"
    },
    {
      "title": "Connection Pool",
      "query": "db_pool_active"
    },
    {
      "title": "Slow Queries",
      "query": "increase(prisma_query_duration_count{le=\"1\"}[1h])"
    }
  ]
}
```

### Business Metrics Dashboard

```json
{
  "title": "Business Metrics",
  "panels": [
    {
      "title": "New Registrations",
      "query": "increase(users_registered_total[24h])"
    },
    {
      "title": "Applications Submitted",
      "query": "sum(increase(applications_submitted_total[24h]))"
    },
    {
      "title": "Active Jobs",
      "query": "active_jobs_count"
    },
    {
      "title": "Mentorship Sessions",
      "query": "increase(mentorship_sessions_total[7d])"
    }
  ]
}
```

## Health Checks

### Endpoint

```typescript
// GET /health
app.get('/health', async (req, res) => {
  const checks = await Promise.allSettled([
    checkDatabase(),
    checkRedis(),
    checkExternalServices(),
  ]);
  
  const status = {
    status: checks.every(c => c.status === 'fulfilled') ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION,
    checks: {
      database: checks[0].status === 'fulfilled' ? 'ok' : 'fail',
      redis: checks[1].status === 'fulfilled' ? 'ok' : 'fail',
      external: checks[2].status === 'fulfilled' ? 'ok' : 'fail',
    },
  };
  
  res.status(status.status === 'healthy' ? 200 : 503).json(status);
});

// Kubernetes probes
app.get('/health/live', (req, res) => {
  res.status(200).send('OK');
});

app.get('/health/ready', async (req, res) => {
  const ready = await isReady();
  res.status(ready ? 200 : 503).send(ready ? 'OK' : 'Not Ready');
});
```

### Health Check Implementation

```typescript
async function checkDatabase(): Promise<void> {
  await prisma.$queryRaw`SELECT 1`;
}

async function checkRedis(): Promise<void> {
  await redis.ping();
}

async function checkExternalServices(): Promise<void> {
  const services = [
    fetch(process.env.EMAIL_SERVICE_URL + '/health'),
    fetch(process.env.STORAGE_SERVICE_URL + '/health'),
  ];
  await Promise.all(services);
}
```

## Troubleshooting

### Common Issues

#### High Latency

```bash
# Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

# Check connection pool
SELECT count(*) FROM pg_stat_activity 
WHERE state = 'active';

# Check Redis latency
redis-cli --latency
```

#### Memory Issues

```bash
# Generate heap snapshot
kill -USR2 <pid>

# Check memory usage
docker stats

# Analyze with Chrome DevTools
node --inspect app.js
```

#### Connection Issues

```bash
# Check connection limits
SELECT max_connections FROM pg_settings 
WHERE name = 'max_connections';

# Check current connections
SELECT count(*) FROM pg_stat_activity;

# Redis connections
redis-cli info clients
```

### Debug Mode

```bash
# Enable debug logging
DEBUG=ngurra:* pnpm start

# Enable Prisma query logging
DEBUG=prisma:query pnpm start

# Enable HTTP debugging
NODE_DEBUG=http pnpm start
```

### Log Analysis

```bash
# Find errors in last hour
cat api.log | jq 'select(.level == "error")' | tail -100

# Count errors by type
cat api.log | jq 'select(.level == "error") | .err.name' | sort | uniq -c

# Find slow requests
cat api.log | jq 'select(.responseTime > 1000)'
```

### Metrics Queries

```promql
# Error rate by endpoint
sum(rate(http_requests_total{status=~"5.."}[5m])) by (path)
/ sum(rate(http_requests_total[5m])) by (path)

# Latency percentiles
histogram_quantile(0.50, rate(http_request_duration_bucket[5m]))
histogram_quantile(0.95, rate(http_request_duration_bucket[5m]))
histogram_quantile(0.99, rate(http_request_duration_bucket[5m]))

# Request volume trend
sum(increase(http_requests_total[1h]))
```

## Runbooks

### High Error Rate

1. Check error logs: `cat api.log | jq 'select(.level == "error")' | tail -50`
2. Identify error pattern
3. Check downstream services
4. Scale if needed: `kubectl scale deployment api --replicas=5`
5. Consider rollback if caused by recent deploy

### Database Overload

1. Check active queries: `SELECT * FROM pg_stat_activity WHERE state = 'active'`
2. Kill long-running queries if needed
3. Check connection pool: `SELECT count(*) FROM pg_stat_activity`
4. Restart connection pool if exhausted
5. Scale read replicas if query load

### Memory Pressure

1. Check memory usage: `docker stats`
2. Generate heap dump for analysis
3. Restart affected containers
4. Scale horizontally if persistent
5. Investigate memory leaks
