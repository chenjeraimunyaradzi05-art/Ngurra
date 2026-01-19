# Security Checklist & Maintenance

This document outlines ongoing security maintenance tasks, penetration testing schedules, and operational security procedures.

## Quarterly Security Review Checklist

### Q1, Q2, Q3, Q4 - Every Quarter

- [ ] Review and rotate all API keys and secrets
- [ ] Review user access logs for anomalies
- [ ] Update dependencies (npm audit fix)
- [ ] Review and update firewall rules
- [ ] Test backup restoration procedures
- [ ] Review RBAC permissions and remove unused
- [ ] Update security documentation
- [ ] Conduct internal security training

## Monthly Security Tasks

### Week 1
- [ ] Review security alerts and logs
- [ ] Check for new CVEs affecting dependencies
- [ ] Verify backup integrity
- [ ] Review rate limiting effectiveness

### Week 2
- [ ] Run automated security scans (OWASP ZAP)
- [ ] Review authentication logs
- [ ] Check certificate expiration dates
- [ ] Audit admin account access

### Week 3
- [ ] Review error logs for security issues
- [ ] Check for unusual traffic patterns
- [ ] Verify logging and monitoring systems
- [ ] Test incident response procedures

### Week 4
- [ ] Update security runbooks if needed
- [ ] Review third-party integrations
- [ ] Check for configuration drift
- [ ] Prepare monthly security report

## Annual Security Tasks

### Penetration Testing (Annually)

**Schedule**: Q2 each year

**Scope**:
1. External penetration testing
   - Web application testing
   - API security testing
   - Network perimeter testing
   
2. Internal penetration testing
   - Privilege escalation testing
   - Lateral movement testing
   - Data exfiltration testing

**Vendors** (suggestions):
- Bugcrowd
- HackerOne
- Bishop Fox
- NCC Group

**Budget**: Allocate $20,000-50,000 annually

### Security Audit (Annually)

**Areas to audit**:
- Code review for security vulnerabilities
- Infrastructure security configuration
- Access control and authentication
- Data handling and privacy
- Incident response procedures
- Business continuity planning

## Secret Rotation Schedule

| Secret Type | Rotation Frequency | Last Rotated | Next Rotation |
|-------------|-------------------|--------------|---------------|
| JWT_SECRET | 90 days | YYYY-MM-DD | YYYY-MM-DD |
| DATABASE_PASSWORD | 90 days | YYYY-MM-DD | YYYY-MM-DD |
| REDIS_PASSWORD | 90 days | YYYY-MM-DD | YYYY-MM-DD |
| AWS_ACCESS_KEY | 90 days | YYYY-MM-DD | YYYY-MM-DD |
| STRIPE_SECRET_KEY | Annual | YYYY-MM-DD | YYYY-MM-DD |
| OPENAI_API_KEY | Annual | YYYY-MM-DD | YYYY-MM-DD |
| ENCRYPTION_KEY | Annual | YYYY-MM-DD | YYYY-MM-DD |

### Secret Rotation Procedure

```bash
# 1. Generate new secret
NEW_SECRET=$(openssl rand -base64 32)

# 2. Update in secrets manager (AWS Secrets Manager example)
aws secretsmanager update-secret \
  --secret-id production/gimbi/jwt-secret \
  --secret-string "$NEW_SECRET"

# 3. Deploy new version with updated secret
# 4. Monitor for authentication failures
# 5. Invalidate old sessions if needed
# 6. Update rotation log
```

## Certificate Management

### SSL/TLS Certificates

| Domain | Provider | Expiry | Auto-Renew |
|--------|----------|--------|------------|
| *.ngurrapathways.com.au | Let's Encrypt | Check | Yes |
| api.ngurrapathways.com.au | Let's Encrypt | Check | Yes |

### Certificate Renewal Script

```bash
#!/bin/bash
# /scripts/renew-certificates.sh

# Check certificate expiry (30 days warning)
certbot certificates 2>/dev/null | grep -A3 "Domains:" | while read line; do
  if echo "$line" | grep -q "VALID:"; then
    days=$(echo "$line" | grep -oP '\d+(?= days)')
    if [ "$days" -lt 30 ]; then
      echo "WARNING: Certificate expires in $days days"
      # Send alert
      curl -X POST "$SLACK_WEBHOOK" \
        -H 'Content-Type: application/json' \
        -d "{\"text\":\"⚠️ SSL certificate expires in $days days\"}"
    fi
  fi
done

# Auto-renew
certbot renew --quiet

# Reload nginx if certificates were renewed
if [ -f /var/run/nginx.pid ]; then
  nginx -s reload
fi
```

## Bug Bounty Program

### Program Details

**Platform**: HackerOne or Bugcrowd (recommended)

**Scope**:
- `*.ngurrapathways.com.au`
- API endpoints
- Mobile applications

**Out of Scope**:
- Social engineering
- Physical attacks
- DoS/DDoS attacks
- Third-party services

### Reward Tiers

| Severity | Example | Bounty |
|----------|---------|--------|
| Critical | RCE, SQL injection with data access, Auth bypass | $2,000-5,000 |
| High | Stored XSS, IDOR with sensitive data | $500-2,000 |
| Medium | CSRF, Reflected XSS, Info disclosure | $100-500 |
| Low | Missing headers, Verbose errors | $50-100 |

### Response SLA

| Severity | First Response | Triage | Fix |
|----------|---------------|--------|-----|
| Critical | 4 hours | 24 hours | 72 hours |
| High | 24 hours | 3 days | 2 weeks |
| Medium | 3 days | 1 week | 1 month |
| Low | 1 week | 2 weeks | 3 months |

## Access Review Procedures

### Quarterly Access Review

1. **Export all user accounts**
   ```sql
   SELECT id, email, role, lastLoginAt, createdAt 
   FROM users 
   ORDER BY role, lastLoginAt;
   ```

2. **Identify inactive accounts** (no login > 90 days)
   ```sql
   SELECT * FROM users 
   WHERE lastLoginAt < NOW() - INTERVAL '90 days';
   ```

3. **Review admin accounts**
   - Verify each admin is still employed
   - Verify admin access is still needed
   - Check for least privilege compliance

4. **Review API keys**
   ```sql
   SELECT * FROM api_keys 
   WHERE lastUsedAt < NOW() - INTERVAL '30 days';
   ```

5. **Document findings and actions**

### Offboarding Checklist

When an employee/contractor leaves:

- [ ] Disable user account immediately
- [ ] Revoke all API keys
- [ ] Remove from GitHub/GitLab
- [ ] Remove from AWS IAM
- [ ] Remove from Slack/communications
- [ ] Rotate any shared secrets they knew
- [ ] Review their recent access logs
- [ ] Document offboarding in security log

## Incident Documentation

### Incident Log Template

```markdown
## Incident Report: [ID]-[DATE]

### Summary
Brief description of what happened.

### Timeline
- HH:MM - First detection
- HH:MM - Response initiated
- HH:MM - Root cause identified
- HH:MM - Mitigation applied
- HH:MM - Incident resolved

### Impact
- Number of users affected: X
- Data exposed: None/Limited/Significant
- Service downtime: X minutes
- Financial impact: $X

### Root Cause
Technical explanation of what went wrong.

### Resolution
Steps taken to resolve the incident.

### Prevention
Changes to prevent recurrence.

### Lessons Learned
What we learned from this incident.

### Action Items
- [ ] Action 1 - Owner - Due Date
- [ ] Action 2 - Owner - Due Date
```

## Security Metrics Dashboard

Track these metrics monthly:

### Authentication
- Failed login attempts per day
- Password reset requests
- 2FA adoption rate
- Session invalidations

### Authorization
- 403 errors per day
- Privilege escalation attempts
- RBAC permission changes

### Application Security
- Security vulnerabilities found
- Time to patch vulnerabilities
- Dependency vulnerabilities
- Security test coverage

### Infrastructure
- Failed SSH attempts
- Firewall blocks
- Certificate expiration warnings
- Backup success rate

## Compliance Checklist

### Australian Privacy Act

- [ ] Privacy Policy published and up-to-date
- [ ] Consent obtained for data collection
- [ ] Data retention policies documented
- [ ] Data export capability for users
- [ ] Data deletion capability for users
- [ ] Breach notification procedure in place

### GDPR (if applicable)

- [ ] Lawful basis documented for processing
- [ ] Data processing agreements with vendors
- [ ] Cross-border transfer mechanisms
- [ ] DPO appointed (if required)
- [ ] Data protection impact assessments

### PCI DSS (if handling cards)

- [ ] No storage of full card numbers
- [ ] Tokenization via Stripe
- [ ] Secure transmission (TLS)
- [ ] Access controls to payment data
- [ ] Regular security testing
