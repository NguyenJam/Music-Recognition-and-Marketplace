$ErrorActionPreference = 'Stop'

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$envPath = Join-Path $projectRoot '.env'
$requiredNames = @('DATABASE_URL', 'DATABASE_USERNAME', 'DATABASE_PASSWORD')
$existingLines = if (Test-Path -LiteralPath $envPath) {
    @(Get-Content -LiteralPath $envPath)
} else {
    @()
}

$existingValues = @{}
foreach ($line in $existingLines) {
    if ($line -match '^\s*(DATABASE_URL|DATABASE_USERNAME|DATABASE_PASSWORD)\s*=\s*(.*)\s*$') {
        $value = $Matches[2].Trim()
        if (($value.StartsWith("'") -and $value.EndsWith("'")) -or
            ($value.StartsWith('"') -and $value.EndsWith('"'))) {
            $value = $value.Substring(1, $value.Length - 2)
        }
        $existingValues[$Matches[1]] = $value
    }
}

$isConfigured = $true
foreach ($name in $requiredNames) {
    $value = [string]$existingValues[$name]
    if ([string]::IsNullOrWhiteSpace($value) -or
        $value -match 'YOUR_NEON|replace-with-your-neon-password') {
        $isConfigured = $false
    }
}

if ($isConfigured) {
    Write-Host 'Neon is already configured in the ignored .env file.'
    return
}

Write-Host 'Paste the pooled PostgreSQL connection string from Neon (Connect > Pooled connection).'
Write-Host 'The input is hidden. It will be saved locally in the ignored .env file.'
$secureConnectionString = Read-Host 'Neon pooled connection string' -AsSecureString
$pointer = [IntPtr]::Zero
$connectionString = $null

try {
    $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureConnectionString)
    $connectionString = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
} finally {
    if ($pointer -ne [IntPtr]::Zero) {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
    }
    $secureConnectionString.Dispose()
}

try {
    $connectionUri = [Uri]$connectionString
} catch {
    $connectionString = $null
    throw 'That connection string could not be read. Copy the pooled URI from Neon and try again.'
}

if ($connectionUri.Scheme -notin @('postgresql', 'postgres') -or
    -not $connectionUri.Host.EndsWith('.neon.tech', [StringComparison]::OrdinalIgnoreCase) -or
    $connectionUri.Host -notmatch '-pooler\.') {
    $connectionString = $null
    throw 'Use the pooled PostgreSQL URI from Neon (the hostname includes -pooler and ends with .neon.tech).'
}

$userInfo = $connectionUri.UserInfo
$separator = $userInfo.IndexOf(':')
$databaseName = [Uri]::UnescapeDataString($connectionUri.AbsolutePath.Trim('/'))
if ($separator -lt 1 -or [string]::IsNullOrWhiteSpace($databaseName)) {
    $connectionString = $null
    throw 'The Neon URI must include a database name, role, and password.'
}

$databaseUsername = [Uri]::UnescapeDataString($userInfo.Substring(0, $separator))
$databasePassword = [Uri]::UnescapeDataString($userInfo.Substring($separator + 1))
if ([string]::IsNullOrWhiteSpace($databaseUsername) -or [string]::IsNullOrWhiteSpace($databasePassword)) {
    $connectionString = $null
    throw 'The Neon URI must include a database role and password.'
}

$portPart = if ($connectionUri.Port -gt 0 -and $connectionUri.Port -ne 5432) {
    ":$($connectionUri.Port)"
} else {
    ''
}
$query = $connectionUri.Query.TrimStart('?')
if ($query.IndexOf('sslmode=', [StringComparison]::OrdinalIgnoreCase) -lt 0) {
    $query = if ($query) { "$query&sslmode=require" } else { 'sslmode=require' }
}
$jdbcUrl = "jdbc:postgresql://$($connectionUri.Host)$portPart/$databaseName`?$query"

function ConvertTo-ComposeEnvValue([string]$value) {
    $escaped = $value.Replace('\', '\\').Replace("'", "\'")
    return "'$escaped'"
}

$keptLines = @($existingLines | Where-Object {
    $_ -notmatch '^\s*(DATABASE_URL|DATABASE_USERNAME|DATABASE_PASSWORD)\s*='
})
$newLines = @($keptLines) + @(
    "DATABASE_URL=$(ConvertTo-ComposeEnvValue $jdbcUrl)",
    "DATABASE_USERNAME=$(ConvertTo-ComposeEnvValue $databaseUsername)",
    "DATABASE_PASSWORD=$(ConvertTo-ComposeEnvValue $databasePassword)"
)
[System.IO.File]::WriteAllLines($envPath, [string[]]$newLines, [System.Text.UTF8Encoding]::new($false))

$connectionString = $null
$databasePassword = $null
$databaseUsername = $null
Write-Host 'Neon connection saved in .env. This file is ignored by Git.'
Write-Host 'You can now run .\scripts\run.ps1; future runs reuse this connection.'
