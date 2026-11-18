$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')
docker compose --profile full-catalogue run --build --rm catalogue-import
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}
