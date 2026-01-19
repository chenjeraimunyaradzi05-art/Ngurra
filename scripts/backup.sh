#!/bin/bash
# =====================================
# Ngurra Pathways - Database Backup Script
# Step 50: Encrypted daily backups to S3
# =====================================
# Runs daily via cron or Docker compose profile

set -e

# Configuration
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/ngurra_${DATE}.sql.gz"
ENCRYPTED_FILE="${BACKUP_DIR}/ngurra_${DATE}.sql.gz.enc"
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}
ENCRYPTION_KEY_FILE="${BACKUP_ENCRYPTION_KEY_FILE:-/run/secrets/backup_key}"

echo "Starting backup at $(date)"

# Create backup directory if needed
mkdir -p ${BACKUP_DIR}

# Perform backup with compression
echo "Creating backup: ${BACKUP_FILE}"
PGPASSWORD="${POSTGRES_PASSWORD}" pg_dump \
    -h "${POSTGRES_HOST:-postgres}" \
    -U "${POSTGRES_USER:-ngurra}" \
    -d "${POSTGRES_DB:-ngurra_production}" \
    --format=custom \
    --compress=9 \
    --verbose \
    | gzip > "${BACKUP_FILE}"

# Check backup was created
if [ ! -f "${BACKUP_FILE}" ]; then
    echo "ERROR: Backup file was not created"
    exit 1
fi

BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
echo "Backup created: ${BACKUP_FILE} (${BACKUP_SIZE})"

# Step 50: Encrypt backup if key is available
if [ -f "${ENCRYPTION_KEY_FILE}" ]; then
    echo "Encrypting backup..."
    openssl enc -aes-256-cbc -salt -pbkdf2 -iter 100000 \
        -in "${BACKUP_FILE}" \
        -out "${ENCRYPTED_FILE}" \
        -pass file:"${ENCRYPTION_KEY_FILE}"
    
    # Remove unencrypted backup
    rm -f "${BACKUP_FILE}"
    BACKUP_FILE="${ENCRYPTED_FILE}"
    echo "Backup encrypted: ${ENCRYPTED_FILE}"
elif [ -n "${BACKUP_ENCRYPTION_KEY}" ]; then
    echo "Encrypting backup with environment key..."
    openssl enc -aes-256-cbc -salt -pbkdf2 -iter 100000 \
        -in "${BACKUP_FILE}" \
        -out "${ENCRYPTED_FILE}" \
        -pass env:BACKUP_ENCRYPTION_KEY
    
    # Remove unencrypted backup
    rm -f "${BACKUP_FILE}"
    BACKUP_FILE="${ENCRYPTED_FILE}"
    echo "Backup encrypted: ${ENCRYPTED_FILE}"
else
    echo "WARNING: No encryption key found. Backup is NOT encrypted!"
fi

# Upload to S3 if configured
if [ -n "${AWS_S3_BUCKET}" ]; then
    echo "Uploading to S3: s3://${AWS_S3_BUCKET}/backups/"
    
    # Install AWS CLI if not present
    if ! command -v aws &> /dev/null; then
        apk add --no-cache aws-cli
    fi
    
    # Upload with server-side encryption
    aws s3 cp "${BACKUP_FILE}" "s3://${AWS_S3_BUCKET}/backups/$(basename ${BACKUP_FILE})" \
        --sse aws:kms \
        --storage-class STANDARD_IA
    
    echo "Upload complete"
    
    # Verify upload
    aws s3 ls "s3://${AWS_S3_BUCKET}/backups/$(basename ${BACKUP_FILE})" && echo "Upload verified"
fi

# Cleanup old local backups
echo "Cleaning up backups older than ${RETENTION_DAYS} days"
find ${BACKUP_DIR} -name "ngurra_*.sql.gz" -mtime +${RETENTION_DAYS} -delete

# List remaining backups
echo "Current backups:"
ls -lh ${BACKUP_DIR}/*.sql.gz 2>/dev/null || echo "No backups found"

echo "Backup completed at $(date)"
