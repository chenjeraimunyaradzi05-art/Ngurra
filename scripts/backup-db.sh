#!/bin/bash
# ==========================================
# Ngurra Pathways Database Backup Script
# ==========================================
# 
# This script performs automated database backups with:
# - Full daily backups
# - Incremental WAL archiving
# - S3 upload with encryption
# - Retention policy enforcement
# - Slack notifications
#
# Usage: ./backup-db.sh [full|incremental|test-restore]
#
# Environment variables required:
#   DATABASE_URL - PostgreSQL connection string
#   AWS_S3_BUCKET - S3 bucket for backup storage
#   AWS_ACCESS_KEY_ID - AWS credentials
#   AWS_SECRET_ACCESS_KEY - AWS credentials
#   SLACK_WEBHOOK_URL - (optional) Slack notifications
#   ENCRYPTION_KEY - GPG encryption key ID

set -euo pipefail

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/var/backups/ngurra}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
S3_BUCKET="${AWS_S3_BUCKET:-ngurra-backups}"
S3_PREFIX="${S3_PREFIX:-database}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
HOSTNAME=$(hostname)
LOG_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${timestamp} [${level}] ${message}" | tee -a "$LOG_FILE"
}

log_info() { log "INFO" "$@"; }
log_warn() { log "WARN" "${YELLOW}$@${NC}"; }
log_error() { log "ERROR" "${RED}$@${NC}"; }
log_success() { log "SUCCESS" "${GREEN}$@${NC}"; }

# Slack notification
send_slack_notification() {
    local status=$1
    local message=$2
    
    if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
        local emoji="✅"
        [ "$status" = "error" ] && emoji="❌"
        [ "$status" = "warning" ] && emoji="⚠️"
        
        curl -s -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"${emoji} *Ngurra Backup* (${HOSTNAME}): ${message}\"}" \
            "$SLACK_WEBHOOK_URL" || true
    fi
}

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Check dependencies
check_dependencies() {
    local deps=("pg_dump" "aws" "gpg" "gzip")
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            log_error "Required dependency not found: $dep"
            exit 1
        fi
    done
}

# Parse DATABASE_URL
parse_db_url() {
    # Extract components from postgresql://user:password@host:port/database
    export PGHOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
    export PGPORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
    export PGDATABASE=$(echo "$DATABASE_URL" | sed -n 's/.*\/\([^?]*\).*/\1/p')
    export PGUSER=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
    export PGPASSWORD=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
}

# Full backup
perform_full_backup() {
    log_info "Starting full database backup..."
    
    local backup_file="${BACKUP_DIR}/ngurra_full_${TIMESTAMP}.sql.gz"
    local encrypted_file="${backup_file}.gpg"
    
    # Perform pg_dump
    pg_dump \
        --format=custom \
        --compress=9 \
        --verbose \
        --file="$backup_file" \
        2>> "$LOG_FILE"
    
    local backup_size=$(du -h "$backup_file" | cut -f1)
    log_info "Backup created: $backup_file ($backup_size)"
    
    # Encrypt if key is provided
    if [ -n "${ENCRYPTION_KEY:-}" ]; then
        log_info "Encrypting backup..."
        gpg --encrypt --recipient "$ENCRYPTION_KEY" --output "$encrypted_file" "$backup_file"
        rm "$backup_file"
        backup_file="$encrypted_file"
        log_info "Backup encrypted"
    fi
    
    # Upload to S3
    log_info "Uploading to S3..."
    aws s3 cp "$backup_file" "s3://${S3_BUCKET}/${S3_PREFIX}/full/$(basename $backup_file)" \
        --storage-class STANDARD_IA \
        2>> "$LOG_FILE"
    
    log_success "Full backup completed and uploaded to S3"
    send_slack_notification "success" "Full backup completed ($backup_size)"
    
    # Clean up local file (keep for 24 hours)
    echo "$backup_file" >> "${BACKUP_DIR}/.cleanup_queue"
}

# Incremental backup (WAL archiving)
perform_incremental_backup() {
    log_info "Starting incremental backup (WAL archive)..."
    
    # This requires WAL archiving to be configured in PostgreSQL
    # archive_command = 'test ! -f /var/lib/postgresql/archive/%f && cp %p /var/lib/postgresql/archive/%f'
    
    local wal_dir="/var/lib/postgresql/archive"
    
    if [ -d "$wal_dir" ] && [ "$(ls -A $wal_dir 2>/dev/null)" ]; then
        for wal_file in "$wal_dir"/*; do
            aws s3 cp "$wal_file" "s3://${S3_BUCKET}/${S3_PREFIX}/wal/$(basename $wal_file)" \
                --storage-class STANDARD_IA \
                2>> "$LOG_FILE" && rm "$wal_file"
        done
        log_success "Incremental backup completed"
    else
        log_info "No WAL files to archive"
    fi
}

# Enforce retention policy
enforce_retention() {
    log_info "Enforcing retention policy (${RETENTION_DAYS} days)..."
    
    # Clean local backups
    find "$BACKUP_DIR" -name "ngurra_*.sql.gz*" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
    
    # Clean S3 backups (using lifecycle policies is preferred)
    local cutoff_date=$(date -d "${RETENTION_DAYS} days ago" +%Y-%m-%d)
    
    aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/full/" | while read -r line; do
        local file_date=$(echo "$line" | awk '{print $1}')
        local file_name=$(echo "$line" | awk '{print $4}')
        if [[ "$file_date" < "$cutoff_date" ]]; then
            aws s3 rm "s3://${S3_BUCKET}/${S3_PREFIX}/full/${file_name}" 2>> "$LOG_FILE"
            log_info "Deleted old backup: $file_name"
        fi
    done
    
    log_success "Retention policy enforced"
}

# Test restore (dry run)
test_restore() {
    log_info "Testing backup restoration..."
    
    # Get latest backup
    local latest_backup=$(aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/full/" --recursive \
        | sort | tail -1 | awk '{print $4}')
    
    if [ -z "$latest_backup" ]; then
        log_error "No backups found in S3"
        exit 1
    fi
    
    local test_file="${BACKUP_DIR}/test_restore_${TIMESTAMP}.sql.gz"
    
    log_info "Downloading: $latest_backup"
    aws s3 cp "s3://${S3_BUCKET}/${latest_backup}" "$test_file" 2>> "$LOG_FILE"
    
    # Decrypt if needed
    if [[ "$test_file" == *.gpg ]]; then
        gpg --decrypt --output "${test_file%.gpg}" "$test_file"
        test_file="${test_file%.gpg}"
    fi
    
    # Verify the backup can be read
    if pg_restore --list "$test_file" > /dev/null 2>&1; then
        log_success "Backup verification passed: $latest_backup"
        send_slack_notification "success" "Backup verification passed"
    else
        log_error "Backup verification failed: $latest_backup"
        send_slack_notification "error" "Backup verification FAILED"
        exit 1
    fi
    
    # Clean up
    rm -f "$test_file"
}

# Main execution
main() {
    local action="${1:-full}"
    
    log_info "=========================================="
    log_info "Ngurra Pathways Database Backup"
    log_info "Action: $action"
    log_info "Timestamp: $TIMESTAMP"
    log_info "=========================================="
    
    check_dependencies
    parse_db_url
    
    case "$action" in
        full)
            perform_full_backup
            enforce_retention
            ;;
        incremental)
            perform_incremental_backup
            ;;
        test-restore)
            test_restore
            ;;
        *)
            echo "Usage: $0 [full|incremental|test-restore]"
            exit 1
            ;;
    esac
    
    log_info "Backup process completed"
}

# Run if not sourced
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
