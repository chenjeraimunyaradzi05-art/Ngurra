<#
.SYNOPSIS
    Secret rotation automation script (Steps 96-97)

.DESCRIPTION
    Automates rotation of secrets and credentials:
    - JWT secrets
    - Database passwords
    - API keys
    - Encryption keys
    
    Supports AWS Secrets Manager and environment variable updates.

.PARAMETER SecretType
    Type of secret to rotate: jwt, database, redis, api, encryption, all

.PARAMETER DryRun
    Preview changes without applying them

.EXAMPLE
    .\rotate-secrets.ps1 -SecretType jwt
    .\rotate-secrets.ps1 -SecretType all -DryRun
#>

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("jwt", "database", "redis", "api", "encryption", "all")]
    [string]$SecretType,
    
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

# Configuration
$config = @{
    AwsRegion = $env:AWS_REGION ?? "ap-southeast-2"
    Environment = $env:NODE_ENV ?? "production"
    SecretsPrefix = "gimbi"
    SlackWebhook = $env:SLACK_SECURITY_WEBHOOK
}

# Logging
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    
    switch ($Level) {
        "ERROR" { Write-Host $logMessage -ForegroundColor Red }
        "WARN"  { Write-Host $logMessage -ForegroundColor Yellow }
        "SUCCESS" { Write-Host $logMessage -ForegroundColor Green }
        default { Write-Host $logMessage }
    }
    
    # Log to file
    $logPath = Join-Path $PSScriptRoot "logs/secret-rotation.log"
    if (-not (Test-Path (Split-Path $logPath -Parent))) {
        New-Item -ItemType Directory -Path (Split-Path $logPath -Parent) -Force | Out-Null
    }
    Add-Content -Path $logPath -Value $logMessage
}

# Generate secure random secret
function New-SecureSecret {
    param(
        [int]$Length = 32,
        [switch]$AlphanumericOnly
    )
    
    if ($AlphanumericOnly) {
        $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    }
    else {
        $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-="
    }
    
    $bytes = New-Object byte[] $Length
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($bytes)
    
    $secret = ""
    foreach ($byte in $bytes) {
        $secret += $chars[$byte % $chars.Length]
    }
    
    return $secret
}

# Update AWS Secrets Manager
function Update-AwsSecret {
    param(
        [string]$SecretName,
        [string]$SecretValue
    )
    
    $fullSecretName = "$($config.SecretsPrefix)/$($config.Environment)/$SecretName"
    
    if ($DryRun) {
        Write-Log "[DRY RUN] Would update AWS secret: $fullSecretName" "INFO"
        return $true
    }
    
    try {
        $result = aws secretsmanager update-secret `
            --secret-id $fullSecretName `
            --secret-string $SecretValue `
            --region $config.AwsRegion 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Log "Updated AWS secret: $fullSecretName" "SUCCESS"
            return $true
        }
        else {
            Write-Log "Failed to update AWS secret: $result" "ERROR"
            return $false
        }
    }
    catch {
        Write-Log "AWS error: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# Update environment variable in .env file
function Update-EnvFile {
    param(
        [string]$Key,
        [string]$Value,
        [string]$EnvPath = ".env"
    )
    
    if ($DryRun) {
        Write-Log "[DRY RUN] Would update $Key in $EnvPath" "INFO"
        return
    }
    
    if (-not (Test-Path $EnvPath)) {
        Write-Log "Env file not found: $EnvPath" "WARN"
        return
    }
    
    $content = Get-Content $EnvPath -Raw
    
    if ($content -match "^$Key=.*$") {
        $content = $content -replace "^$Key=.*$", "$Key=$Value"
    }
    else {
        $content += "`n$Key=$Value"
    }
    
    Set-Content -Path $EnvPath -Value $content
    Write-Log "Updated $Key in $EnvPath" "SUCCESS"
}

# Send Slack notification
function Send-Notification {
    param([string]$Message, [string]$Color = "#00FF00")
    
    if (-not $config.SlackWebhook) { return }
    
    $payload = @{
        attachments = @(@{
            color = $Color
            title = "Secret Rotation"
            text = $Message
            footer = "Gimbi Security"
            ts = [int][double]::Parse((Get-Date -UFormat %s))
        })
    } | ConvertTo-Json -Depth 3
    
    try {
        Invoke-RestMethod -Uri $config.SlackWebhook -Method Post -Body $payload -ContentType "application/json"
    }
    catch {
        Write-Log "Failed to send notification: $($_.Exception.Message)" "WARN"
    }
}

# Rotate JWT secret
function Rotate-JwtSecret {
    Write-Log "Rotating JWT secret..." "INFO"
    
    $newSecret = New-SecureSecret -Length 64 -AlphanumericOnly
    
    # Update AWS Secrets Manager
    $awsSuccess = Update-AwsSecret -SecretName "jwt-secret" -SecretValue $newSecret
    
    # Update local env files
    $envPaths = @(
        "apps/api/.env",
        "apps/api/.env.production"
    )
    
    foreach ($path in $envPaths) {
        if (Test-Path $path) {
            Update-EnvFile -Key "JWT_SECRET" -Value $newSecret -EnvPath $path
        }
    }
    
    if ($awsSuccess) {
        Write-Log "JWT secret rotated successfully" "SUCCESS"
        Send-Notification "JWT secret rotated successfully for $($config.Environment)"
    }
    
    return $awsSuccess
}

# Rotate database password
function Rotate-DatabasePassword {
    Write-Log "Rotating database password..." "INFO"
    
    $newPassword = New-SecureSecret -Length 32 -AlphanumericOnly
    
    # Update AWS Secrets Manager
    $awsSuccess = Update-AwsSecret -SecretName "database-password" -SecretValue $newPassword
    
    if ($DryRun) {
        Write-Log "[DRY RUN] Would update database user password" "INFO"
    }
    else {
        # Update PostgreSQL password (requires DB admin access)
        # This is environment-specific and may need customization
        Write-Log "Database password updated in secrets manager. Manual DB update may be required." "WARN"
    }
    
    # Update local env files
    Update-EnvFile -Key "DATABASE_PASSWORD" -Value $newPassword -EnvPath "apps/api/.env.production"
    
    if ($awsSuccess) {
        Write-Log "Database password rotated successfully" "SUCCESS"
        Send-Notification "Database password rotated for $($config.Environment)"
    }
    
    return $awsSuccess
}

# Rotate Redis password
function Rotate-RedisPassword {
    Write-Log "Rotating Redis password..." "INFO"
    
    $newPassword = New-SecureSecret -Length 32 -AlphanumericOnly
    
    # Update AWS Secrets Manager
    $awsSuccess = Update-AwsSecret -SecretName "redis-password" -SecretValue $newPassword
    
    # Update local env files
    Update-EnvFile -Key "REDIS_PASSWORD" -Value $newPassword -EnvPath "apps/api/.env.production"
    
    if ($awsSuccess) {
        Write-Log "Redis password rotated successfully" "SUCCESS"
        Send-Notification "Redis password rotated for $($config.Environment)"
    }
    
    return $awsSuccess
}

# Rotate API keys
function Rotate-ApiKeys {
    Write-Log "Rotating API keys..." "INFO"
    
    $keys = @{
        "STRIPE_SECRET_KEY" = "Contact Stripe dashboard to rotate"
        "OPENAI_API_KEY" = "Contact OpenAI dashboard to rotate"
        "AWS_SECRET_ACCESS_KEY" = "Use AWS IAM to rotate"
    }
    
    foreach ($key in $keys.Keys) {
        Write-Log "$key - $($keys[$key])" "WARN"
    }
    
    # Generate new internal API key
    $newApiKey = "gim_" + (New-SecureSecret -Length 40 -AlphanumericOnly)
    Update-AwsSecret -SecretName "internal-api-key" -SecretValue $newApiKey
    
    Write-Log "Internal API key rotated. External keys require manual rotation." "SUCCESS"
    Send-Notification "API keys rotation initiated. Check logs for manual steps."
    
    return $true
}

# Rotate encryption key
function Rotate-EncryptionKey {
    Write-Log "Rotating encryption key..." "INFO"
    
    # Generate new 256-bit key (32 bytes, base64 encoded = 44 chars)
    $bytes = New-Object byte[] 32
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($bytes)
    $newKey = [Convert]::ToBase64String($bytes)
    
    # Update AWS Secrets Manager
    $awsSuccess = Update-AwsSecret -SecretName "encryption-key" -SecretValue $newKey
    
    # Update local env files
    Update-EnvFile -Key "ENCRYPTION_KEY" -Value $newKey -EnvPath "apps/api/.env.production"
    
    if ($awsSuccess) {
        Write-Log "Encryption key rotated successfully" "SUCCESS"
        Write-Log "NOTE: Existing encrypted data will need to be re-encrypted with the new key" "WARN"
        Send-Notification "Encryption key rotated. Re-encryption of existing data may be required."
    }
    
    return $awsSuccess
}

# Update rotation log
function Update-RotationLog {
    param([string]$SecretType, [bool]$Success)
    
    $logEntry = @{
        SecretType = $SecretType
        RotatedAt = (Get-Date).ToString("o")
        Success = $Success
        Environment = $config.Environment
        RotatedBy = $env:USERNAME ?? "automation"
    }
    
    $logPath = Join-Path $PSScriptRoot "logs/rotation-history.json"
    
    if (Test-Path $logPath) {
        $history = Get-Content $logPath | ConvertFrom-Json
        if (-not $history) { $history = @() }
    }
    else {
        $history = @()
    }
    
    $history += $logEntry
    
    # Keep last 100 entries
    if ($history.Count -gt 100) {
        $history = $history | Select-Object -Last 100
    }
    
    $history | ConvertTo-Json -Depth 3 | Set-Content $logPath
}

# Main execution
function Main {
    Write-Log "Starting secret rotation - Type: $SecretType, DryRun: $DryRun" "INFO"
    
    $results = @{}
    
    switch ($SecretType) {
        "jwt" {
            $results["jwt"] = Rotate-JwtSecret
        }
        "database" {
            $results["database"] = Rotate-DatabasePassword
        }
        "redis" {
            $results["redis"] = Rotate-RedisPassword
        }
        "api" {
            $results["api"] = Rotate-ApiKeys
        }
        "encryption" {
            $results["encryption"] = Rotate-EncryptionKey
        }
        "all" {
            $results["jwt"] = Rotate-JwtSecret
            $results["database"] = Rotate-DatabasePassword
            $results["redis"] = Rotate-RedisPassword
            $results["api"] = Rotate-ApiKeys
            $results["encryption"] = Rotate-EncryptionKey
        }
    }
    
    # Log results
    foreach ($key in $results.Keys) {
        Update-RotationLog -SecretType $key -Success $results[$key]
    }
    
    # Summary
    $successCount = ($results.Values | Where-Object { $_ -eq $true }).Count
    $totalCount = $results.Count
    
    if ($DryRun) {
        Write-Log "Dry run completed. No changes were made." "INFO"
    }
    else {
        Write-Log "Rotation completed. Success: $successCount/$totalCount" "INFO"
        
        if ($successCount -lt $totalCount) {
            Write-Log "Some rotations failed. Check logs for details." "WARN"
            Send-Notification "Secret rotation partially failed. $successCount/$totalCount succeeded." -Color "#FF6600"
        }
    }
    
    return $results
}

# Run
$results = Main

# Exit code
$exitCode = if (($results.Values | Where-Object { $_ -eq $false }).Count -gt 0) { 1 } else { 0 }
exit $exitCode
