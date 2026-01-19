param(
  [Parameter(Mandatory = $true, Position = 0)]
  [ValidateSet('start','stop','remove','cleanup','status','logs')]
  [string]$Command,

  [string]$Name = 'gimbi-livekit',
  [string]$ConfigPath = "$PSScriptRoot\..\livekit.yaml"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-RepoRoot {
  return (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
}

function Ensure-Docker {
  $docker = Get-Command docker -ErrorAction SilentlyContinue
  if (-not $docker) {
    throw 'Docker is not installed or not on PATH.'
  }
}

function Start-LiveKit {
  Ensure-Docker

  $root = Get-RepoRoot
  $cfg = (Resolve-Path (Join-Path $root 'livekit.yaml')).Path

  if (-not (Test-Path $cfg)) {
    throw "Missing LiveKit config: $cfg"
  }

  # Idempotent: remove container if it exists.
  docker rm -f $Name *> $null 2>&1

  docker run -d --name $Name `
    -p 7880:7880 `
    -p 7881:7881 `
    -p 50000-50010:50000-50010/udp `
    -v "${cfg}:/etc/livekit.yaml" `
    livekit/livekit-server --config /etc/livekit.yaml | Out-Null

  Write-Output "LiveKit started: container=$Name"
}

function Stop-LiveKit {
  Ensure-Docker
  docker stop $Name | Out-Null
  Write-Output "LiveKit stopped: container=$Name"
}

function Remove-LiveKit {
  Ensure-Docker
  docker rm -f $Name | Out-Null
  Write-Output "LiveKit removed: container=$Name"
}

function Status-LiveKit {
  Ensure-Docker
  docker ps -a --filter "name=$Name" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

function Logs-LiveKit {
  Ensure-Docker
  docker logs -f $Name
}

switch ($Command) {
  'start'   { Start-LiveKit }
  'stop'    { Stop-LiveKit }
  'remove'  { Remove-LiveKit }
  'cleanup' { Remove-LiveKit }
  'status'  { Status-LiveKit }
  'logs'    { Logs-LiveKit }
}
