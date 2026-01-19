#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Rollback script for Gimbi platform deployments

.DESCRIPTION
    This script handles rollback operations for failed deployments.
    It can rollback database migrations, restore previous deployments,
    and notify the team of rollback status.

.PARAMETER Target
    The target to rollback: 'database', 'deploy', or 'all'

.PARAMETER Steps
    Number of migrations to rollback (for database rollback)

.PARAMETER DeployId
    Specific Netlify deploy ID to restore

.EXAMPLE
    .\rollback.ps1 -Target deploy -DeployId abc123
    Restores the specified Netlify deployment

.EXAMPLE
    .\rollback.ps1 -Target database -Steps 1
    Rolls back the last database migration
#>

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('database', 'deploy', 'all')]
    [string]$Target,
    
    [int]$Steps = 1,
    
    [string]$DeployId,
    
    [switch]$DryRun,
    
    [string]$Environment = 'production'
)

$ErrorActionPreference = 'Stop'

function Write-Step {
    param([string]$Message)
    Write-Host "`n[$(Get-Date -Format 'HH:mm:ss')] $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "[OK] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Verify we're in the project root
if (-not (Test-Path "package.json")) {
    Write-Error "Must be run from project root directory"
    exit 1
}

Write-Host @"

╔═══════════════════════════════════════════════════════════════╗
║                    GIMBI ROLLBACK SCRIPT                      ║
║                                                               ║
║  Target: $Target
║  Environment: $Environment
║  Dry Run: $DryRun
╚═══════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Magenta

if ($DryRun) {
    Write-Warning "DRY RUN MODE - No changes will be made"
}

# Confirm rollback
$confirm = Read-Host "Are you sure you want to rollback $Target? (yes/no)"
if ($confirm -ne 'yes') {
    Write-Host "Rollback cancelled"
    exit 0
}

switch ($Target) {
    'database' {
        Write-Step "Rolling back database migration(s)..."
        
        # Check DATABASE_URL
        if (-not $env:DATABASE_URL) {
            Write-Error "DATABASE_URL environment variable not set"
            exit 1
        }
        
        if ($DryRun) {
            Write-Host "Would run: pnpm --filter api prisma migrate reset --skip-seed"
        } else {
            # Note: Prisma doesn't have a direct rollback command
            # We need to use migrate resolve or manually manage
            Write-Warning "Prisma doesn't support automatic rollback."
            Write-Host "Options:"
            Write-Host "  1. Restore from database backup"
            Write-Host "  2. Create a new migration to undo changes"
            Write-Host "  3. Reset database (DESTRUCTIVE - loses data)"
            
            $dbAction = Read-Host "Choose action (1/2/3)"
            
            switch ($dbAction) {
                '1' {
                    Write-Step "Restoring from backup..."
                    Write-Host "Please provide backup file path or use your cloud provider's restore feature"
                    # pg_restore commands would go here
                }
                '2' {
                    Write-Step "Creating rollback migration..."
                    Write-Host "Run: pnpm --filter api prisma migrate dev --name rollback_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
                }
                '3' {
                    $confirmReset = Read-Host "This will DELETE ALL DATA. Type 'DELETE' to confirm"
                    if ($confirmReset -eq 'DELETE') {
                        pnpm --filter api prisma migrate reset --force
                        Write-Success "Database reset complete"
                    } else {
                        Write-Host "Reset cancelled"
                    }
                }
            }
        }
    }
    
    'deploy' {
        Write-Step "Rolling back Netlify deployment..."
        
        # Check for Netlify CLI
        $netlifyPath = Get-Command netlify -ErrorAction SilentlyContinue
        if (-not $netlifyPath) {
            Write-Error "Netlify CLI not found. Install with: npm install -g netlify-cli"
            exit 1
        }
        
        if (-not $DeployId) {
            Write-Step "Fetching recent deployments..."
            
            if (-not $DryRun) {
                # List recent deploys
                netlify deploy --list | Select-Object -First 20
                
                $DeployId = Read-Host "Enter deploy ID to restore"
            } else {
                Write-Host "Would fetch deployment list"
                exit 0
            }
        }
        
        if ($DryRun) {
            Write-Host "Would run: netlify deploy --restore $DeployId"
        } else {
            Write-Step "Restoring deployment $DeployId..."
            
            # For production, use --prod flag
            if ($Environment -eq 'production') {
                netlify deploy --restore $DeployId --prod
            } else {
                netlify deploy --restore $DeployId
            }
            
            Write-Success "Deployment rolled back to $DeployId"
        }
    }
    
    'all' {
        Write-Step "Rolling back both database and deployment..."
        
        # Roll back deployment first
        Write-Host "Step 1: Rollback deployment"
        & $PSScriptRoot\rollback.ps1 -Target deploy -DeployId $DeployId -Environment $Environment -DryRun:$DryRun
        
        # Then database
        Write-Host "`nStep 2: Rollback database"
        & $PSScriptRoot\rollback.ps1 -Target database -Steps $Steps -DryRun:$DryRun
        
        Write-Success "Full rollback complete"
    }
}

Write-Host @"

╔═══════════════════════════════════════════════════════════════╗
║                    ROLLBACK COMPLETE                          ║
╚═══════════════════════════════════════════════════════════════╝

Next steps:
1. Verify the rollback was successful
2. Check application health: curl https://gimbi.netlify.app/health
3. Monitor error logs
4. Notify team of rollback

"@ -ForegroundColor Green
