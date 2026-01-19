<#
.SYNOPSIS
  Download the most recent 'snapshot-merge-artifacts' artifact from the last run of update-snapshots.yml using gh

.DESCRIPTION
  Requires the GitHub CLI (gh) available and authenticated. The script will locate the most recent workflow run for
  update-snapshots.yml in the target repo and attempt to download the artifact named 'snapshot-merge-artifacts' to the
  local working directory.

USAGE
  .\fetch-last-artifact.ps1 -Repo owner/repo -ArtifactName snapshot-merge-artifacts

OPTIONS
  -Repo        Target repo (owner/repo). If not provided attempts to infer from git remote.
  -ArtifactName Artifact name to fetch (default: snapshot-merge-artifacts)
  -DryRun      Print gh commands that would run without executing them

#>
param(
  [string]$Repo = '',
  [string]$ArtifactName = 'snapshot-merge-artifacts',
  [switch]$DryRun
)

function Assert-GhAvailable {
  if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Error "GitHub CLI 'gh' not found. Install and authenticate first: https://cli.github.com/"
    exit 2
  }
}

# Accept common command-line dry-run flags as boolean too
if (-not $DryRun) {
  if ($args -and ($args -contains '--dry-run' -or $args -contains '-DryRun' -or $args -contains '--dryrun' -or $args -contains '-dryrun')) {
    $DryRun = $true
  }
}

if (-not $DryRun) { Assert-GhAvailable }

if (-not $Repo) {
  try { $url = (git remote get-url origin) -replace '\.git$','' ; if ($url -match '[:/]([^/]+/[^/]+)$') { $Repo = $Matches[1] } }
  catch { }
}

if (-not $Repo) {
  $Repo = Read-Host 'Repository (owner/repo) to target (or press Enter to cancel)'
  if (-not $Repo) { Write-Host 'No repo provided, aborting'; exit 1 }
}

Write-Host "Repo: $Repo  artifact: $ArtifactName" -ForegroundColor Cyan

if ($DryRun) {
  Write-Host "DRY: gh run list --repo $Repo --workflow update-snapshots.yml --limit 10"
  Write-Host "DRY: gh run view <run-id> --repo $Repo --log --output json"
  Write-Host "DRY: gh run download <run-id> --name $ArtifactName --repo $Repo --dir ./" 
  exit 0
}

# list runs and pick the most recent completed/finished run
$runs = gh run list --repo $Repo --workflow update-snapshots.yml --limit 20 --json databaseId,headSha,status,conclusion,createdAt -q '.[] | select(.conclusion == "success" or .conclusion == "neutral" or .conclusion == "skipped") | .databaseId' || ''
if (-not $runs) { Write-Error 'No successful/complete workflow runs found for update-snapshots.yml'; exit 2 }

$runId = ($runs | Select-Object -First 1).Trim()
Write-Host "Found run id: $runId" -ForegroundColor Green

Write-Host "Downloading artifact: $ArtifactName from run $runId"
gh run download $runId --name $ArtifactName --repo $Repo --dir ./ || { Write-Error 'Failed to download artifact — maybe it is not present in the run.'; exit 3 }

Write-Host "Artifact downloaded to ./ (inspect files like snapshot-merge-*.json)" -ForegroundColor Green
