param(
    [string]$DatabaseSecretArn,
    [string]$AdminSecretArn,
    [string]$Region = 'ap-southeast-1'
)

$ErrorActionPreference = 'Stop'

if ([string]::IsNullOrWhiteSpace($DatabaseSecretArn)) {
    $DatabaseSecretArn = (& terraform -chdir=infra/terraform output -raw database_secret_arn).Trim()
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($DatabaseSecretArn)) {
        throw 'Run Terraform apply first, then provide the database_secret_arn output.'
    }
}
if ([string]::IsNullOrWhiteSpace($AdminSecretArn)) {
    $AdminSecretArn = (& terraform -chdir=infra/terraform output -raw admin_secret_arn).Trim()
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($AdminSecretArn)) {
        throw 'Run Terraform apply first, then provide the admin_secret_arn output.'
    }
}

function Convert-SecureStringToPlainText([Security.SecureString]$Value) {
    $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Value)
    try { [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer) }
    finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer) }
}

function Publish-JsonSecret([string]$SecretArn, [hashtable]$Value, [string]$Label) {
    $path = Join-Path $env:TEMP ('melodex-secret-' + [guid]::NewGuid().ToString('N') + '.json')
    try {
        $json = $Value | ConvertTo-Json -Compress
        [IO.File]::WriteAllText($path, $json, [Text.UTF8Encoding]::new($false))
        & aws secretsmanager put-secret-value --region $Region --secret-id $SecretArn --secret-string ("file://{0}" -f $path) | Out-Null
        if ($LASTEXITCODE -ne 0) { throw "AWS Secrets Manager did not accept the $Label secret update." }
        Write-Host "$Label secret updated in AWS Secrets Manager."
    }
    finally {
        Remove-Item -LiteralPath $path -Force -ErrorAction SilentlyContinue
    }
}

$pooledUrl = Convert-SecureStringToPlainText (Read-Host 'Neon pooled PostgreSQL URL' -AsSecureString)
$directUrl = Convert-SecureStringToPlainText (Read-Host 'Neon direct PostgreSQL URL' -AsSecureString)
foreach ($url in @($pooledUrl, $directUrl)) {
    if ($url -notmatch '^postgres(?:ql)?://[^/]+/.+') {
        throw 'Both Neon values must be PostgreSQL connection URLs copied from Neon Connect.'
    }
}

$adminUsername = Read-Host 'Admin page username'
$adminPassword = Convert-SecureStringToPlainText (Read-Host 'Admin page password (minimum 16 characters)' -AsSecureString)
if ([string]::IsNullOrWhiteSpace($adminUsername) -or $adminUsername.Length -gt 80) {
    throw 'Enter an admin username from 1 to 80 characters.'
}
if ($adminPassword.Length -lt 16) { throw 'Use an admin password of at least 16 characters.' }

try {
    Publish-JsonSecret $DatabaseSecretArn @{ pooled_url = $pooledUrl; direct_url = $directUrl } 'Neon database'
    Publish-JsonSecret $AdminSecretArn @{ username = $adminUsername; password = $adminPassword } 'Admin'
}
finally {
    Remove-Variable pooledUrl,directUrl,adminPassword -ErrorAction SilentlyContinue
}
