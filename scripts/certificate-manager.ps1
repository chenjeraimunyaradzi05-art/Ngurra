<#
.SYNOPSIS
    Certificate monitoring and renewal automation script (Step 100)

.DESCRIPTION
    Monitors SSL/TLS certificates and handles renewal:
    - Checks certificate expiration dates
    - Sends alerts before expiration
    - Integrates with Let's Encrypt for auto-renewal
    - Updates load balancers/reverse proxies

.PARAMETER CheckOnly
    Only check certificates without renewing

.PARAMETER Domain
    Specific domain to check (default: all configured domains)

.PARAMETER AlertDays
    Days before expiration to send alert (default: 30)

.EXAMPLE
    .\certificate-manager.ps1 -CheckOnly
    .\certificate-manager.ps1 -Domain "api.ngurrapathways.com.au"
#>

param(
    [switch]$CheckOnly,
    [string]$Domain = "",
    [int]$AlertDays = 30
)

$ErrorActionPreference = "Stop"

# Configuration
$config = @{
    Domains = @(
        "ngurrapathways.com.au",
        "www.ngurrapathways.com.au",
        "api.ngurrapathways.com.au",
        "app.ngurrapathways.com.au"
    )
    SlackWebhook = $env:SLACK_WEBHOOK
    EmailRecipients = $env:CERT_ALERT_EMAILS
    NginxConfigPath = "/etc/nginx/nginx.conf"
    CertPath = "/etc/letsencrypt/live"
}

# Log function
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    Write-Host $logMessage
    
    # Also write to log file
    $logPath = Join-Path $PSScriptRoot "logs/certificate-manager.log"
    if (-not (Test-Path (Split-Path $logPath -Parent))) {
        New-Item -ItemType Directory -Path (Split-Path $logPath -Parent) -Force | Out-Null
    }
    Add-Content -Path $logPath -Value $logMessage
}

# Check single certificate expiration
function Get-CertificateExpiry {
    param([string]$DomainName)
    
    try {
        # Use OpenSSL to check remote certificate
        $result = & openssl s_client -servername $DomainName -connect "${DomainName}:443" 2>$null | 
                  & openssl x509 -noout -enddate 2>$null
        
        if ($result -match "notAfter=(.+)") {
            $expiryDate = [DateTime]::Parse($Matches[1])
            $daysUntilExpiry = ($expiryDate - (Get-Date)).Days
            
            return @{
                Domain = $DomainName
                ExpiryDate = $expiryDate
                DaysUntilExpiry = $daysUntilExpiry
                Status = if ($daysUntilExpiry -lt 0) { "EXPIRED" }
                         elseif ($daysUntilExpiry -lt 7) { "CRITICAL" }
                         elseif ($daysUntilExpiry -lt 30) { "WARNING" }
                         else { "OK" }
            }
        }
    }
    catch {
        Write-Log "Failed to check certificate for ${DomainName}: $($_.Exception.Message)" "ERROR"
        return @{
            Domain = $DomainName
            ExpiryDate = $null
            DaysUntilExpiry = -1
            Status = "ERROR"
            Error = $_.Exception.Message
        }
    }
    
    return $null
}

# Send Slack notification
function Send-SlackNotification {
    param(
        [string]$Message,
        [string]$Color = "#FF0000"
    )
    
    if (-not $config.SlackWebhook) {
        Write-Log "Slack webhook not configured, skipping notification" "WARN"
        return
    }
    
    $payload = @{
        attachments = @(
            @{
                color = $Color
                title = "Certificate Alert"
                text = $Message
                footer = "Gimbi Certificate Manager"
                ts = [int][double]::Parse((Get-Date -UFormat %s))
            }
        )
    } | ConvertTo-Json -Depth 3
    
    try {
        Invoke-RestMethod -Uri $config.SlackWebhook -Method Post -Body $payload -ContentType "application/json"
        Write-Log "Slack notification sent" "INFO"
    }
    catch {
        Write-Log "Failed to send Slack notification: $($_.Exception.Message)" "ERROR"
    }
}

# Renew certificate using certbot
function Invoke-CertificateRenewal {
    param([string]$DomainName)
    
    Write-Log "Attempting to renew certificate for $DomainName" "INFO"
    
    try {
        # Check if certbot is available
        $certbot = Get-Command certbot -ErrorAction SilentlyContinue
        if (-not $certbot) {
            Write-Log "certbot not found, using Docker" "INFO"
            
            # Use certbot via Docker
            $result = & docker run --rm -v "/etc/letsencrypt:/etc/letsencrypt" `
                                        -v "/var/www/html:/var/www/html" `
                                        certbot/certbot renew `
                                        --cert-name $DomainName `
                                        --non-interactive 2>&1
        }
        else {
            $result = & certbot renew --cert-name $DomainName --non-interactive 2>&1
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Log "Certificate renewed successfully for $DomainName" "INFO"
            return $true
        }
        else {
            Write-Log "Certificate renewal failed: $result" "ERROR"
            return $false
        }
    }
    catch {
        Write-Log "Certificate renewal error: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# Reload nginx after certificate renewal
function Invoke-NginxReload {
    Write-Log "Reloading Nginx configuration" "INFO"
    
    try {
        # Test config first
        & nginx -t 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Log "Nginx configuration test failed" "ERROR"
            return $false
        }
        
        # Reload
        & nginx -s reload 2>&1
        Write-Log "Nginx reloaded successfully" "INFO"
        return $true
    }
    catch {
        Write-Log "Failed to reload Nginx: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# Main execution
function Main {
    Write-Log "Starting certificate check" "INFO"
    
    $domainsToCheck = if ($Domain) { @($Domain) } else { $config.Domains }
    $results = @()
    $needsRenewal = @()
    
    foreach ($d in $domainsToCheck) {
        Write-Log "Checking certificate for $d" "INFO"
        $certInfo = Get-CertificateExpiry -DomainName $d
        
        if ($certInfo) {
            $results += $certInfo
            
            if ($certInfo.DaysUntilExpiry -lt $AlertDays) {
                $needsRenewal += $certInfo
                
                $color = switch ($certInfo.Status) {
                    "EXPIRED" { "#FF0000" }
                    "CRITICAL" { "#FF6600" }
                    "WARNING" { "#FFCC00" }
                    default { "#00FF00" }
                }
                
                $message = "Certificate for $($certInfo.Domain) expires in $($certInfo.DaysUntilExpiry) days"
                if ($certInfo.DaysUntilExpiry -lt 0) {
                    $message = "Certificate for $($certInfo.Domain) has EXPIRED!"
                }
                
                Send-SlackNotification -Message $message -Color $color
            }
            
            Write-Log "$d - Status: $($certInfo.Status), Expires: $($certInfo.ExpiryDate), Days: $($certInfo.DaysUntilExpiry)" "INFO"
        }
    }
    
    # Renew certificates if needed and not check-only mode
    if (-not $CheckOnly -and $needsRenewal.Count -gt 0) {
        Write-Log "Found $($needsRenewal.Count) certificates needing renewal" "INFO"
        
        $renewed = $false
        foreach ($cert in $needsRenewal) {
            if ($cert.DaysUntilExpiry -lt 30) {
                $success = Invoke-CertificateRenewal -DomainName $cert.Domain
                if ($success) {
                    $renewed = $true
                    Send-SlackNotification -Message "Certificate renewed successfully for $($cert.Domain)" -Color "#00FF00"
                }
                else {
                    Send-SlackNotification -Message "Certificate renewal FAILED for $($cert.Domain). Manual intervention required!" -Color "#FF0000"
                }
            }
        }
        
        # Reload nginx if any certificates were renewed
        if ($renewed) {
            Invoke-NginxReload
        }
    }
    
    # Summary
    Write-Log "Certificate check completed. Total: $($results.Count), Needs attention: $($needsRenewal.Count)" "INFO"
    
    # Output results
    return $results
}

# Run main function
$results = Main

# Output as table if running interactively
if ($Host.UI.RawUI.WindowSize) {
    $results | Format-Table -AutoSize
}

# Exit with appropriate code
$exitCode = 0
foreach ($r in $results) {
    if ($r.Status -eq "EXPIRED" -or $r.Status -eq "ERROR") {
        $exitCode = 1
        break
    }
}

exit $exitCode
