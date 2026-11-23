param(
    [string]$RuntimeSecretArn,
    [string]$Region
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$terraformDirectory = Join-Path $projectRoot 'infra/terraform'

if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
    throw 'Install the AWS CLI and configure a least-privilege Melodex deployment identity first.'
}

if ([string]::IsNullOrWhiteSpace($RuntimeSecretArn)) {
    $RuntimeSecretArn = (& terraform "-chdir=$terraformDirectory" output -raw runtime_secret_arn).Trim()
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($RuntimeSecretArn)) {
        throw 'Run the initial Terraform apply first, then provide the runtime_secret_arn output.'
    }
}
if ([string]::IsNullOrWhiteSpace($Region)) {
    $Region = (& terraform "-chdir=$terraformDirectory" output -raw aws_region).Trim()
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($Region)) {
        throw 'Could not read the AWS region from Terraform output. Pass -Region explicitly.'
    }
}

$callerArn = (& aws sts get-caller-identity --query Arn --output text).Trim()
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($callerArn)) {
    throw 'AWS CLI authentication failed. Configure a dedicated deployment identity.'
}
if ($callerArn -match ':root$') {
    throw 'Do not publish application secrets as the AWS root user. Use a dedicated least-privilege deployment identity.'
}

function Convert-SecureStringToPlainText([Security.SecureString]$Value) {
    $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Value)
    try { [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer) }
    finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer) }
}

function Convert-NeonUrlToDatabaseSettings([string]$ConnectionUrl) {
    if ($ConnectionUrl -notmatch '^postgres(?:ql)?://') {
        throw 'The Neon value must be a PostgreSQL URL copied from Neon Connect.'
    }

    $uri = [Uri]$ConnectionUrl
    $parts = $uri.UserInfo -split ':', 2
    if ($parts.Count -ne 2 -or [string]::IsNullOrWhiteSpace($parts[0])) {
        throw 'The Neon connection URL must contain its database role and password.'
    }

    $username = [Uri]::UnescapeDataString($parts[0])
    $password = [Uri]::UnescapeDataString($parts[1])
    $databasePath = [Uri]::UnescapeDataString($uri.AbsolutePath)
    $query = $uri.Query.TrimStart('?')
    $query = $query -replace '(^|&)channel_binding=', '$1channelBinding='
    if ($query -notmatch '(^|&)sslmode=') {
        if ([string]::IsNullOrWhiteSpace($query)) { $query = 'sslmode=require' }
        else { $query += '&sslmode=require' }
    }

    $port = if ($uri.Port -lt 0) { 5432 } else { $uri.Port }
    $jdbcUrl = "jdbc:postgresql://$($uri.Host):$port$databasePath"
    if (-not [string]::IsNullOrWhiteSpace($query)) { $jdbcUrl += "?$query" }

    return @{
        url      = $jdbcUrl
        username = $username
        password = $password
    }
}

$pooledUrl = Convert-SecureStringToPlainText (Read-Host 'Neon pooled PostgreSQL URL (the same shared database used by the team)' -AsSecureString)
$database = Convert-NeonUrlToDatabaseSettings $pooledUrl

$rapidApiKey = $null
$privateConfigPath = Join-Path $projectRoot 'application-private.properties'
if (Test-Path -LiteralPath $privateConfigPath) {
    $keyLine = Get-Content -LiteralPath $privateConfigPath | Where-Object { $_ -match '^music\.recognition\.rapidapi-key=' } | Select-Object -First 1
    if ($keyLine) { $rapidApiKey = $keyLine.Substring('music.recognition.rapidapi-key='.Length).Trim() }
}
if ([string]::IsNullOrWhiteSpace($rapidApiKey)) {
    $rapidApiKey = Convert-SecureStringToPlainText (Read-Host 'Shazam RapidAPI key' -AsSecureString)
}
if ([string]::IsNullOrWhiteSpace($rapidApiKey)) { throw 'The Shazam RapidAPI key cannot be blank.' }

$adminUsername = Read-Host 'Admin page username'
$adminPassword = Convert-SecureStringToPlainText (Read-Host 'Admin page password (minimum 16 characters)' -AsSecureString)
if ([string]::IsNullOrWhiteSpace($adminUsername) -or $adminUsername.Length -gt 80) {
    throw 'Enter an admin username from 1 to 80 characters.'
}
if ($adminPassword.Length -lt 16) { throw 'Use an admin password of at least 16 characters.' }

$secretValues = @{
    production_database_url      = $database.url
    production_database_username = $database.username
    production_database_password = $database.password
    rapidapi_key                 = $rapidApiKey
    admin_username               = $adminUsername
    admin_password               = $adminPassword
}

$secretPath = Join-Path $env:TEMP ('melodex-runtime-' + [guid]::NewGuid().ToString('N') + '.json')
try {
    $json = $secretValues | ConvertTo-Json -Compress
    [IO.File]::WriteAllText($secretPath, $json, [Text.UTF8Encoding]::new($false))
    & aws secretsmanager put-secret-value --region $Region --secret-id $RuntimeSecretArn --secret-string ("file://{0}" -f $secretPath) | Out-Null
    if ($LASTEXITCODE -ne 0) { throw 'AWS Secrets Manager did not accept the runtime secret update.' }
    'Runtime secret updated in AWS Secrets Manager.'
}
finally {
    Remove-Item -LiteralPath $secretPath -Force -ErrorAction SilentlyContinue
    Remove-Variable pooledUrl,rapidApiKey,adminPassword,secretValues,database -ErrorAction SilentlyContinue
}
