# Incident Response Runbook

Emergency procedures and response protocols for Ngurra Pathways platform.

## Table of Contents

- [Incident Classification](#incident-classification)
- [Response Team](#response-team)
- [Initial Response](#initial-response)
- [Common Incidents](#common-incidents)
- [Rollback Procedures](#rollback-procedures)
- [Communication Templates](#communication-templates)
- [Post-Incident](#post-incident)

## Incident Classification

### Severity Levels

| Level | Description | Response Time | Examples |
|-------|-------------|---------------|----------|
| **P0 - Critical** | Complete service outage | 15 minutes | Database down, API unreachable |
| **P1 - High** | Major feature broken | 1 hour | Authentication failing, payments broken |
| **P2 - Medium** | Partial degradation | 4 hours | Slow performance, minor feature broken |
| **P3 - Low** | Minor issue | 24 hours | UI glitch, non-critical bug |

### Escalation Path

```
P3 → On-call Engineer
P2 → On-call Engineer → Team Lead
P1 → On-call Engineer → Team Lead → Engineering Manager
P0 → On-call Engineer → Team Lead → Engineering Manager → CTO
```

## Response Team

### On-Call Rotation

- **Primary**: Check PagerDuty schedule
- **Secondary**: Backup on-call engineer
- **Escalation**: @platform-leads

### Contact Information

| Role | Slack | Phone |
|------|-------|-------|
| On-Call Primary | @oncall-primary | PagerDuty |
| Engineering Lead | @eng-lead | See PagerDuty |
| DevOps | @devops-team | See PagerDuty |

## Initial Response

### Step 1: Acknowledge

```
[ ] Acknowledge alert in PagerDuty
[ ] Join #incidents Slack channel
[ ] Post initial status: "Investigating [issue description]"
```

### Step 2: Assess

```
[ ] Check monitoring dashboards
[ ] Review error logs
[ ] Identify affected services
[ ] Determine severity level
[ ] Assign incident commander
```

### Step 3: Communicate

```
[ ] Update status page
[ ] Notify stakeholders
[ ] Post in #incidents with regular updates
```

### Step 4: Resolve

```
[ ] Implement fix or rollback
[ ] Verify resolution
[ ] Update status page
[ ] Close incident
```

## Common Incidents

### 1. API Unreachable

**Symptoms:**
- 5xx errors on all endpoints
- Health check failing
- Users cannot access application

**Diagnostic Commands:**

```bash
# Check API health
curl -v https://api.ngurra-pathways.com/health

# Check Railway status
railway status

# View recent logs
railway logs --tail 200

# Check deployment history
railway deployments
```

**Resolution:**

```bash
# Option 1: Restart service
railway restart

# Option 2: Rollback to previous version
railway rollback

# Option 3: Scale up instances
railway scale 3
```

### 2. Database Connection Issues

**Symptoms:**
- "Connection refused" errors
- Timeout errors
- "Too many connections" errors

**Diagnostic Commands:**

```bash
# Test database connection
psql $DATABASE_URL -c "SELECT 1"

# Check active connections
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity"

# Check for long-running queries
psql $DATABASE_URL -c "SELECT pid, now() - pg_stat_activity.query_start AS duration, query 
FROM pg_stat_activity 
WHERE state != 'idle' 
ORDER BY duration DESC 
LIMIT 10"
```

**Resolution:**

```bash
# Kill long-running queries
psql $DATABASE_URL -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE duration > interval '5 minutes'"

# Increase connection limit (if using Neon/Supabase)
# Check provider dashboard

# Restart API to reset connection pool
railway restart
```

### 3. Redis/Cache Issues

**Symptoms:**
- Slow response times
- Session errors
- Rate limiting not working

**Diagnostic Commands:**

```bash
# Check Redis connectivity
redis-cli -u $REDIS_URL PING

# Check memory usage
redis-cli -u $REDIS_URL INFO memory

# Check connected clients
redis-cli -u $REDIS_URL CLIENT LIST
```

**Resolution:**

```bash
# Flush cache if corrupted
redis-cli -u $REDIS_URL FLUSHDB

# Restart with cleared cache
railway restart

# If Redis service is down, API will fall back to memory cache
```

### 4. High Error Rate

**Symptoms:**
- Sentry alert: High error rate
- User complaints about failures
- Increased 500 errors in logs

**Diagnostic Commands:**

```bash
# Check recent errors in logs
railway logs | grep -i error | tail -50

# Check Sentry for error details
# https://sentry.io/organizations/ngurra/issues/

# Check if specific endpoint is failing
railway logs | grep "POST /api/applications" | tail -20
```

**Resolution:**

1. Identify the failing component from Sentry
2. Check recent deployments
3. Rollback if recent deployment caused issue
4. Apply hotfix if bug is identified

### 5. Performance Degradation

**Symptoms:**
- Response times > 2 seconds
- High CPU/memory usage
- User complaints about slowness

**Diagnostic Commands:**

```bash
# Check response times
curl -w "@curl-format.txt" https://api.ngurra-pathways.com/health

# Check database query times
psql $DATABASE_URL -c "SELECT query, calls, mean_time, total_time 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10"

# Check Railway metrics
railway metrics
```

**Resolution:**

```bash
# Scale up instances
railway scale 3

# Add database indexes if slow queries identified
# Deploy hotfix with optimizations

# Enable aggressive caching temporarily
redis-cli -u $REDIS_URL SET cache:aggressive true
```

### 6. Security Incident

**Symptoms:**
- Unusual access patterns
- Unauthorized data access
- Credential compromise suspected

**Immediate Actions:**

```bash
# 1. Revoke compromised tokens
redis-cli -u $REDIS_URL KEYS "session:*" | xargs redis-cli -u $REDIS_URL DEL

# 2. Rotate secrets
railway variables set JWT_SECRET=$(openssl rand -hex 32)

# 3. Block suspicious IPs (CloudFlare)
# Use CloudFlare dashboard or API

# 4. Enable enhanced logging
railway variables set LOG_LEVEL=debug
```

**Escalation:**
- Immediately notify Security Lead
- Preserve all logs
- Do not discuss publicly until assessed

### 7. Deployment Failure

**Symptoms:**
- Build failing in CI
- Deployment stuck
- New version not serving traffic

**Diagnostic Commands:**

```bash
# Check GitHub Actions
# View workflow runs at https://github.com/org/repo/actions

# Check Vercel deployment
vercel ls
vercel logs

# Check Railway deployment
railway status
railway logs
```

**Resolution:**

```bash
# Cancel stuck deployment
railway cancel

# Rollback to last working version
railway rollback
vercel rollback

# If build issue, check and fix locally
pnpm build
```

## Rollback Procedures

### Application Rollback

```bash
# Vercel (Web)
vercel rollback
# Or select specific deployment:
vercel rollback [deployment-url]

# Railway (API)
railway rollback
# Or use specific version:
railway rollback [deployment-id]
```

### Database Rollback

```bash
# If migration caused issues, run down migration
pnpm --filter api db:migrate:reset --to [migration-name]

# Restore from backup
pg_restore -d $DATABASE_URL -c backup-20240315.dump

# Point-in-time recovery (provider specific)
# Neon: Branch restore from dashboard
# Supabase: Point-in-time recovery from dashboard
```

### DNS/CDN Rollback

```bash
# Switch to maintenance page
# CloudFlare Dashboard > Rules > Create Rule
# Or via API:
curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/firewall/rules" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -d '{"action":"block","filter":{"expression":"true"}}'
```

## Communication Templates

### Status Page Update (Investigating)

```
**Incident: [Brief Description]**

Status: Investigating
Start Time: [Time UTC]

We are currently investigating reports of [issue description]. 
Some users may experience [symptoms].

We will provide updates every 30 minutes.

Last Updated: [Time UTC]
```

### Status Page Update (Identified)

```
**Incident: [Brief Description]**

Status: Identified
Start Time: [Time UTC]

We have identified the root cause as [brief cause].
We are implementing a fix and expect resolution within [timeframe].

Affected Services: [List]

Last Updated: [Time UTC]
```

### Status Page Update (Resolved)

```
**Incident: [Brief Description]**

Status: Resolved
Start Time: [Time UTC]
End Time: [Time UTC]
Duration: [Duration]

The incident has been resolved. [Brief explanation of fix].

All services are now operating normally. 
We apologize for any inconvenience.

A post-mortem will be conducted and shared within 48 hours.
```

### Slack Update Template

```
🔴 **INCIDENT [P0/P1/P2]** - [Title]

**Status:** Investigating/Identified/Resolved
**Started:** [Time]
**Incident Commander:** @[name]

**Impact:** [Who/what is affected]

**Current Status:** 
[Brief update on what's happening]

**Next Update:** [Time]

Thread for updates ⬇️
```

## Post-Incident

### Post-Mortem Template

```markdown
# Post-Mortem: [Incident Title]

## Summary
- **Date:** [Date]
- **Duration:** [Start time] - [End time] ([duration])
- **Severity:** [P0/P1/P2/P3]
- **Impact:** [Number of users affected, features impacted]

## Timeline
| Time (UTC) | Event |
|------------|-------|
| HH:MM | First alert triggered |
| HH:MM | On-call acknowledged |
| HH:MM | Root cause identified |
| HH:MM | Fix deployed |
| HH:MM | Incident resolved |

## Root Cause
[Detailed technical explanation of what went wrong]

## Resolution
[What was done to fix the issue]

## Lessons Learned

### What Went Well
- [Item 1]
- [Item 2]

### What Went Wrong
- [Item 1]
- [Item 2]

### Where We Got Lucky
- [Item 1]

## Action Items
| Action | Owner | Due Date | Status |
|--------|-------|----------|--------|
| [Action 1] | @name | [Date] | ⬜ Open |
| [Action 2] | @name | [Date] | ⬜ Open |

## Appendix
[Relevant logs, screenshots, links]
```

### Post-Mortem Checklist

```
[ ] Schedule post-mortem meeting (within 48 hours)
[ ] Create post-mortem document
[ ] Invite all involved parties
[ ] Focus on systems, not individuals
[ ] Identify action items with owners
[ ] Share summary with team
[ ] Track action items to completion
```

## Useful Links

- **Status Page**: https://status.ngurra-pathways.com
- **Sentry**: https://sentry.io/ngurra-pathways
- **Railway Dashboard**: https://railway.app/project/ngurra
- **Vercel Dashboard**: https://vercel.com/ngurra
- **CloudFlare**: https://dash.cloudflare.com
- **PagerDuty**: https://ngurra.pagerduty.com
- **Runbook Repository**: `/docs/runbooks/`

## Emergency Contacts

For P0 incidents only:

- **Engineering Lead**: [Via PagerDuty]
- **CTO**: [Via PagerDuty escalation]
- **Cloud Provider Support**: 
  - Railway: support@railway.app
  - Vercel: support@vercel.com
  - Neon: support@neon.tech
