# Disaster Recovery Plan

**Document Version:** 1.0  
**Last Updated:** January 4, 2026  
**Owner:** Platform Engineering Team

---

## Table of Contents

1. [Overview](#overview)
2. [Recovery Objectives](#recovery-objectives)
3. [Backup Strategy](#backup-strategy)
4. [Disaster Scenarios](#disaster-scenarios)
5. [Recovery Procedures](#recovery-procedures)
6. [Communication Plan](#communication-plan)
7. [Testing Schedule](#testing-schedule)
8. [Contacts](#contacts)

---

## Overview

This document outlines the disaster recovery (DR) procedures for the Ngurra Pathways platform. It covers backup strategies, recovery procedures, and communication protocols for various disaster scenarios.

### Scope

- Production API servers
- Production Web application
- PostgreSQL database
- Redis cache
- File storage (S3)
- SSL certificates
- DNS configuration

### Exclusions

- Development and staging environments
- Mobile app (App Store/Play Store deployment)
- Third-party integrations (can be reconnected post-recovery)

---

## Recovery Objectives

| Metric | Target | Description |
|--------|--------|-------------|
| **RTO** (Recovery Time Objective) | 4 hours | Maximum time to restore services |
| **RPO** (Recovery Point Objective) | 1 hour | Maximum data loss acceptable |
| **MTTR** (Mean Time to Repair) | 2 hours | Average recovery time |

### Priority Levels

1. **P1 - Critical:** Database, Auth service, Core API
2. **P2 - High:** Job search, Applications, Notifications
3. **P3 - Medium:** Courses, Mentorship, Analytics
4. **P4 - Low:** Admin dashboards, Reports

---

## Backup Strategy

### Database Backups

| Type | Frequency | Retention | Location |
|------|-----------|-----------|----------|
| Full backup | Daily (2 AM AEST) | 30 days | S3 (ap-southeast-2) |
| WAL archive | Continuous | 7 days | S3 (ap-southeast-2) |
| Cross-region copy | Weekly | 90 days | S3 (us-west-2) |

### Application Backups

| Component | Strategy | Retention |
|-----------|----------|-----------|
| Docker images | Tagged in ECR | Forever (tagged releases) |
| Configuration | Git repository | Forever |
| Secrets | AWS Secrets Manager | Versioned |
| SSL certificates | Let's Encrypt auto-renew | N/A |

### File Storage

- S3 Cross-Region Replication enabled
- Versioning enabled on all buckets
- Lifecycle policy: 90-day retention for deleted objects

---

## Disaster Scenarios

### Scenario 1: Database Failure

**Symptoms:**
- API returns 500 errors
- Health check `/health` shows database unhealthy
- Prisma connection errors in logs

**Impact:** Critical - All platform functionality affected

**Recovery:** [See Procedure DR-001](#dr-001-database-recovery)

### Scenario 2: Complete Region Failure

**Symptoms:**
- All services unreachable
- AWS status page shows outage
- DNS queries fail

**Impact:** Critical - Complete platform outage

**Recovery:** [See Procedure DR-002](#dr-002-region-failover)

### Scenario 3: Security Breach

**Symptoms:**
- Unusual login patterns
- Data exfiltration alerts
- Customer reports of unauthorized access

**Impact:** Critical - Security and compliance

**Recovery:** [See Procedure DR-003](#dr-003-security-incident)

### Scenario 4: Ransomware Attack

**Symptoms:**
- Files encrypted
- Ransom note displayed
- Services unresponsive

**Impact:** Critical - Complete compromise

**Recovery:** [See Procedure DR-004](#dr-004-ransomware-recovery)

---

## Recovery Procedures

### DR-001: Database Recovery

**Time Estimate:** 1-2 hours

#### Prerequisites
- Access to AWS Console or CLI
- Database credentials in Secrets Manager
- Backup verification completed within 24 hours

#### Steps

1. **Assess the Situation**
   ```bash
   # Check database status
   pg_isready -h $DB_HOST -p 5432
   
   # Check AWS RDS status (if applicable)
   aws rds describe-db-instances --db-instance-identifier ngurra-prod
   ```

2. **Enable Maintenance Mode**
   ```bash
   # Set maintenance mode via API
   curl -X POST https://api.ngurrapathways.com.au/admin/maintenance \
     -H "Authorization: Bearer $ADMIN_TOKEN" \
     -d '{"enabled": true, "message": "System maintenance in progress"}'
   ```

3. **Identify Latest Backup**
   ```bash
   # List available backups
   aws s3 ls s3://ngurra-backups/database/full/ --recursive | tail -5
   ```

4. **Restore Database**
   ```bash
   # Download backup
   aws s3 cp s3://ngurra-backups/database/full/[LATEST_BACKUP] /tmp/restore.sql.gz
   
   # Decrypt if encrypted
   gpg --decrypt /tmp/restore.sql.gz.gpg > /tmp/restore.sql.gz
   
   # Restore to new database
   createdb ngurra_restore
   pg_restore -d ngurra_restore /tmp/restore.sql.gz
   
   # Verify data
   psql ngurra_restore -c "SELECT COUNT(*) FROM users;"
   ```

5. **Switch to Restored Database**
   ```bash
   # Update environment variables
   # Point DATABASE_URL to new database
   
   # Restart API servers
   docker-compose restart api
   ```

6. **Verify and Disable Maintenance**
   ```bash
   # Run health checks
   curl https://api.ngurrapathways.com.au/health
   
   # Disable maintenance mode
   curl -X POST https://api.ngurrapathways.com.au/admin/maintenance \
     -H "Authorization: Bearer $ADMIN_TOKEN" \
     -d '{"enabled": false}'
   ```

7. **Post-Recovery Actions**
   - Notify stakeholders
   - Document incident
   - Update runbook if needed

---

### DR-002: Region Failover

**Time Estimate:** 2-4 hours

#### Prerequisites
- Secondary region infrastructure deployed
- DNS failover configured
- Cross-region database replication active

#### Steps

1. **Confirm Primary Region Outage**
   - Check AWS Status page
   - Verify with AWS Support
   - Confirm not a localized issue

2. **Initiate Failover**
   ```bash
   # Promote secondary database to primary
   aws rds promote-read-replica --db-instance-identifier ngurra-prod-secondary
   
   # Update DNS to point to secondary region
   aws route53 change-resource-record-sets ...
   ```

3. **Verify Secondary Region Services**
   ```bash
   # Check all services
   ./scripts/health-check-all.sh --region us-west-2
   ```

4. **Notify Users**
   - Update status page
   - Send email notification
   - Update social media

---

### DR-003: Security Incident

**Time Estimate:** Varies

#### Immediate Actions (First 15 minutes)

1. **Isolate Affected Systems**
   ```bash
   # Revoke all active sessions
   redis-cli FLUSHDB
   
   # Block suspicious IPs
   aws waf update-ip-set --add-addresses [IP_LIST]
   ```

2. **Preserve Evidence**
   ```bash
   # Snapshot affected servers
   aws ec2 create-snapshot --volume-id [VOL_ID]
   
   # Export logs
   aws logs get-log-events --log-group-name ngurra-api > /secure/incident_logs.json
   ```

3. **Notify Security Team**
   - Call security hotline
   - Open incident ticket
   - Begin forensic analysis

4. **Assess Scope**
   - What data was accessed?
   - How many users affected?
   - What was the attack vector?

#### Recovery Actions

5. **Patch Vulnerability**
6. **Reset Credentials**
7. **Notify Affected Users** (within 72 hours for GDPR)
8. **Notify Regulators** (if required)

---

### DR-004: Ransomware Recovery

**Time Estimate:** 4-8 hours

⚠️ **DO NOT PAY THE RANSOM**

1. **Isolate All Systems**
   - Disconnect from network
   - Shut down affected servers
   - Preserve evidence

2. **Notify Authorities**
   - ACSC (Australian Cyber Security Centre)
   - Law enforcement
   - Legal counsel

3. **Restore from Clean Backups**
   - Use backups from before infection
   - Restore to isolated environment first
   - Scan for malware before going live

4. **Rebuild Infrastructure**
   - Assume all credentials compromised
   - Rotate all secrets
   - Deploy fresh infrastructure

---

## Communication Plan

### Internal Communication

| Audience | Channel | When | Who |
|----------|---------|------|-----|
| Engineering | Slack #incident | Immediately | On-call engineer |
| Leadership | Phone + Email | Within 15 min | Engineering Manager |
| Support | Slack #support | Within 30 min | Support Lead |
| All Staff | Email | Within 1 hour | Communications |

### External Communication

| Audience | Channel | When | Who |
|----------|---------|------|-----|
| Users | Status page | Immediately | On-call engineer |
| Users | Email | Within 1 hour | Communications |
| Media | Press release | If needed | PR Team |
| Regulators | Official notice | As required | Legal |

### Status Page Updates

```
Template for initial update:
"We are currently experiencing issues with [SERVICE]. 
Our team is investigating and we will provide updates every 30 minutes. 
We apologize for any inconvenience."

Template for resolution:
"The issue affecting [SERVICE] has been resolved. 
All systems are now operating normally. 
Total duration: [X hours]. 
A post-incident report will be published within 48 hours."
```

---

## Testing Schedule

| Test Type | Frequency | Last Tested | Next Scheduled |
|-----------|-----------|-------------|----------------|
| Backup restoration | Monthly | 2025-12-15 | 2026-01-15 |
| Failover drill | Quarterly | 2025-10-01 | 2026-01-01 |
| Full DR simulation | Annually | 2025-06-15 | 2026-06-15 |
| Tabletop exercise | Bi-annually | 2025-09-01 | 2026-03-01 |

---

## Contacts

### On-Call Rotation

| Role | Primary | Secondary | Escalation |
|------|---------|-----------|------------|
| Platform Engineer | [Name] | [Name] | Engineering Manager |
| Database Admin | [Name] | [Name] | Platform Lead |
| Security | [Name] | [Name] | CISO |

### External Contacts

| Service | Contact | Phone |
|---------|---------|-------|
| AWS Support | Enterprise Support | [Number] |
| DNS Provider | Cloudflare | [Number] |
| Security Incident | ACSC | 1300 CYBER1 |
| Legal | [Law Firm] | [Number] |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-04 | Platform Team | Initial version |
