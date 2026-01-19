<#
.SYNOPSIS
  Helper to trigger a safe dry-run of the update-snapshots workflow in a GitHub test repo.

DESCRIPTION
  This script will (optionally) set repository secrets TEST_NOTIFY, TEST_WEBHOOK and TEST_WEBHOOK_PLATFORM
  in the target repo using the GitHub CLI (gh), trigger the workflow_dispatch for update-snapshots.yml, and
  optionally remove the secrets afterwards. Use --dry-run to only print commands it would run.

  WARNING: This script requires the GitHub CLI (gh) installed and authenticated as a user with permission
  to set secrets / run workflows on the target repository. Only run in repositories you control or test repos.

USAGE
  .\trigger-ci-dryrun.ps1 -Repo owner/repo -Ref main -Webhook https://webhook.site/xxxxx -Platform slack

PARAMETERS
  -Repo        GitHub repository in owner/repo form (default uses current repo if you are inside a repo)
  -Ref         Branch ref to run against (default: main)
  -Webhook     Webhook URL to use for TEST_WEBHOOK (optional; if missing you'll be prompted)
  -Platform    Which payload platform to test: slack|teams|discord|all (default: slack)
  -KeepSecrets If present, do not delete the secrets after triggering (default: cleanup)
  -DryRun      Print what will run but do not make changes

#>

param(
  [string]$Repo = "",
  [string]$Ref = "main",
  [string]$Webhook = "",
  [ValidateSet('slack','teams','discord','all')]
  [string]$Platform = 'slack',
  [switch]$KeepSecrets,
  [switch]$DryRun
  ,
  [switch]$UseRepoVars
)

function Assert-GhAvailable {
  if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Error "GitHub CLI 'gh' not found. Install and authenticate first: https://cli.github.com/"
    exit 2
  }
}

if (-not $DryRun) { Assert-GhAvailable }

if (-not $Repo) {
  # try to infer from git remote
  try {
    $url = (git remote get-url origin) -replace '\.git$',''
    if ($url -match '[:/]([^/]+/[^/]+)$') { $Repo = $Matches[1] }
  } catch { }
}

if (-not $Repo) {
  $Repo = Read-Host 'Repository (owner/repo) to target (or press Enter to cancel)'
  if (-not $Repo) { Write-Host 'No repo provided, aborting'; exit 1 }
}

if (-not $Webhook) {
  $Webhook = Read-Host 'TEST_WEBHOOK URL (use a safe endpoint like https://webhook.site/<id>)'
}

Write-Host "Target repo: $Repo" -ForegroundColor Cyan
Write-Host "Ref: $Ref  platform: $Platform" -ForegroundColor Cyan
Write-Host "Webhook: $Webhook" -ForegroundColor Yellow

if ($DryRun) { Write-Host "DRY RUN — no changes will be made" -ForegroundColor Green }

function GhSecretSet($name, $value) {
  if ($DryRun) {
    Write-Host "DRY: gh secret set $name --body <value> --repo $Repo"
  } else {
    gh secret set $name --body $value --repo $Repo
  }
}

function GhSecretDelete($name) {
  if ($DryRun) {
    Write-Host "DRY: gh secret delete $name --repo $Repo"
  } else {
    gh secret delete $name --repo $Repo
  }
}

function GhVarSet($name, $value) {
  if ($DryRun) {
    Write-Host "DRY: gh variable set $name --body <value> --repo $Repo"
  } else {
    gh variable set $name --body $value --repo $Repo
  }
}

function GhVarDelete($name) {
  if ($DryRun) {
    Write-Host "DRY: gh variable delete $name --repo $Repo"
  } else {
    gh variable delete $name --repo $Repo
  }
}

# set secrets
if ($UseRepoVars) {
  Write-Host "Using repo variables mode (gh variable set / delete)" -ForegroundColor Cyan
  GhVarSet -name 'TEST_NOTIFY' -value '1'
  GhVarSet -name 'TEST_WEBHOOK' -value $Webhook
  GhVarSet -name 'TEST_WEBHOOK_PLATFORM' -value $Platform
} else {
  GhSecretSet -name 'TEST_NOTIFY' -value '1'
  GhSecretSet -name 'TEST_WEBHOOK' -value $Webhook
  GhSecretSet -name 'TEST_WEBHOOK_PLATFORM' -value $Platform
}

# run the workflow
$runCmd = "gh workflow run update-snapshots.yml --repo $Repo -f ref=$Ref"
if ($DryRun) {
  Write-Host "DRY: $runCmd"
} else {
  Write-Host "Triggering workflow_dispatch..." -ForegroundColor Green
  gh workflow run update-snapshots.yml --repo $Repo -f ref=$Ref
}

if (-not $KeepSecrets) {
  Write-Host "Cleaning up test values..." -ForegroundColor Green
  if ($UseRepoVars) {
    GhVarDelete -name 'TEST_NOTIFY'
    GhVarDelete -name 'TEST_WEBHOOK'
    GhVarDelete -name 'TEST_WEBHOOK_PLATFORM'
  } else {
    GhSecretDelete -name 'TEST_NOTIFY'
    GhSecretDelete -name 'TEST_WEBHOOK'
    GhSecretDelete -name 'TEST_WEBHOOK_PLATFORM'
  }
} else {
  Write-Host "Keeping repo values in place as requested (KeepSecrets set)" -ForegroundColor Yellow
}

Write-Host 'Done — watch the Actions UI and artifact list in the target repository for snapshot-merge-artifacts (audit files).'
