$ErrorActionPreference = 'Stop'

$privateConfigPath = Join-Path (Get-Location) 'application-private.properties'
if (-not (Test-Path -LiteralPath $privateConfigPath)) {
    throw 'Create application-private.properties from the example before publishing the secret.'
}

$keyLine = Get-Content -LiteralPath $privateConfigPath | Where-Object { $_ -match '^music\.recognition\.rapidapi-key=' } | Select-Object -First 1
if (-not $keyLine) { throw 'No RapidAPI key was found in application-private.properties.' }
$keyValue = $keyLine.Substring('music.recognition.rapidapi-key='.Length).Trim()
if ([string]::IsNullOrWhiteSpace($keyValue)) { throw 'The RapidAPI key is blank.' }

$secretName = (& terraform -chdir=infra/terraform output -raw rapidapi_secret_name).Trim()
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($secretName)) {
    throw 'Run Terraform and confirm the rapidapi_secret_name output before publishing the secret.'
}

$tempSecretPath = Join-Path $env:TEMP ('melodex-rapidapi-' + [guid]::NewGuid().ToString('N') + '.json')
try {
    @{ rapidapi_key = $keyValue } | ConvertTo-Json -Compress | Set-Content -LiteralPath $tempSecretPath -Encoding ascii
    aws secretsmanager put-secret-value --secret-id $secretName --secret-string ("file://{0}" -f $tempSecretPath) | Out-Null
    if ($LASTEXITCODE -ne 0) { throw 'AWS Secrets Manager did not accept the secret update.' }
    'RapidAPI secret updated in AWS Secrets Manager.'
}
finally {
    Remove-Item -LiteralPath $tempSecretPath -Force -ErrorAction SilentlyContinue
    Remove-Variable keyValue,keyLine -ErrorAction SilentlyContinue
}
