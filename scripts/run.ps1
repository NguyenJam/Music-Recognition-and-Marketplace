$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Push-Location $projectRoot
try {
    & (Join-Path $PSScriptRoot 'setup-neon.ps1')

    docker compose config --quiet
    if ($LASTEXITCODE -ne 0) {
        exit $LASTEXITCODE
    }

    docker compose up --build
    exit $LASTEXITCODE
} finally {
    Pop-Location
}
