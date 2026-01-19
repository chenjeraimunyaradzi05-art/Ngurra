# Pre-Launch Checklist

**Target Launch Date:** Week of January 6, 2026  
**Document Owner:** Platform Team

---

## 🔴 Critical (Must Complete Before Launch)

### Security

- [ ] All secrets rotated for production
- [ ] JWT_SECRET is 32+ characters (not DEV_JWT_SECRET)
- [ ] HTTPS enforced on all endpoints
- [ ] CORS configured for production domains only
- [ ] Rate limiting enabled and tested
- [ ] Security headers (CSP, HSTS) configured
- [ ] SQL injection audit passed
- [ ] XSS protection verified
- [ ] 2FA enabled for admin accounts
- [ ] Audit logging enabled

### Database

- [ ] Prisma schema migrated to production
- [ ] UserType enum migration applied
- [ ] Database indexes created for performance
- [ ] Connection pool configured (max connections)
- [ ] Backup automation verified (daily backups)
- [ ] Restore procedure tested within 24 hours
- [ ] Database credentials in Secrets Manager

### Infrastructure

- [ ] Production environment provisioned
- [ ] Docker images tagged and pushed
- [ ] Health check endpoints responding
- [ ] SSL certificates valid and auto-renewing
- [ ] DNS records configured (A, CNAME, TXT)
- [ ] CDN configured (if applicable)
- [ ] Load balancer health checks passing

### Data

- [ ] Seed data loaded (companies, jobs, courses)
- [ ] Test accounts removed or disabled
- [ ] PII data sanitized (no test emails in prod)
- [ ] Terms of Service and Privacy Policy updated
- [ ] Cookie consent implemented

---

## 🟡 Important (Should Complete Before Launch)

### Monitoring & Alerting

- [ ] Prometheus metrics collection working
- [ ] Grafana dashboards configured
- [ ] Alert rules defined (error rate, latency)
- [ ] PagerDuty/Slack alerting configured
- [ ] Log aggregation (Loki) working
- [ ] Uptime monitoring (external) configured

### Performance

- [ ] Load testing completed (50 concurrent users)
- [ ] API response time < 200ms (p95)
- [ ] Web Vitals passing (LCP < 2.5s)
- [ ] Database queries optimized
- [ ] Redis caching enabled for hot paths
- [ ] Image optimization configured

### SEO & Analytics

- [ ] Sitemap generated and submitted
- [ ] robots.txt configured
- [ ] Meta tags on all pages
- [ ] Structured data (JSON-LD) implemented
- [ ] Analytics tracking configured
- [ ] Search Console verified

### Accessibility

- [ ] WCAG 2.1 AA compliance verified
- [ ] Keyboard navigation tested
- [ ] Screen reader tested (NVDA/VoiceOver)
- [ ] Color contrast ratio ≥ 4.5:1
- [ ] Focus indicators visible
- [ ] Alt text on all images

### Mobile App

- [ ] API URL pointing to production
- [ ] Push notifications configured
- [ ] Deep linking tested
- [ ] App store listings updated
- [ ] TestFlight/Play Console beta tested

---

## 🟢 Nice to Have (Can Complete Post-Launch)

### Features

- [ ] Onboarding wizard tested
- [ ] Email templates reviewed
- [ ] Social sharing working
- [ ] Referral system enabled
- [ ] Leaderboard populated

### Documentation

- [ ] API documentation (OpenAPI) published
- [ ] User guides written
- [ ] FAQ section populated
- [ ] Support articles created
- [ ] Video tutorials recorded

### Operations

- [ ] Runbooks documented
- [ ] On-call rotation scheduled
- [ ] Incident response plan reviewed
- [ ] Communication templates prepared
- [ ] Status page configured

---

## Launch Day Procedure

### T-24 Hours

1. [ ] Final code freeze on `main` branch
2. [ ] Run full test suite (unit, integration, e2e)
3. [ ] Deploy to staging and verify
4. [ ] Backup production database
5. [ ] Notify team of launch timeline

### T-4 Hours

1. [ ] Deploy to production (during low traffic)
2. [ ] Run smoke tests
3. [ ] Verify all health checks passing
4. [ ] Test critical user flows manually
5. [ ] Enable monitoring dashboards

### T-0 (Launch)

1. [ ] Disable maintenance mode
2. [ ] Update status page to operational
3. [ ] Send launch announcement
4. [ ] Monitor metrics closely
5. [ ] On-call engineer available

### T+1 Hour

1. [ ] Review error rates
2. [ ] Check user feedback channels
3. [ ] Address any critical issues
4. [ ] Send internal status update

### T+24 Hours

1. [ ] Review analytics
2. [ ] Compile incident report (if any)
3. [ ] Plan hotfixes (if needed)
4. [ ] Celebrate! 🎉

---

## Rollback Plan

If critical issues are discovered after launch:

1. **Enable maintenance mode**
   ```bash
   curl -X POST https://api.ngurrapathways.com.au/admin/maintenance \
     -H "Authorization: Bearer $ADMIN_TOKEN" \
     -d '{"enabled": true}'
   ```

2. **Rollback deployment**
   ```bash
   # Revert to previous Docker image
   docker-compose -f docker-compose.production.yml down
   docker tag ngurra-api:previous ngurra-api:latest
   docker-compose -f docker-compose.production.yml up -d
   ```

3. **Rollback database** (if schema changed)
   ```bash
   npx prisma migrate resolve --rolled-back [migration-name]
   ```

4. **Notify stakeholders**
5. **Document incident**

---

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Engineering Lead | | | |
| Product Manager | | | |
| Security Officer | | | |
| QA Lead | | | |

---

*Last updated: January 4, 2026*
