param([string]$ImageTag)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$terraformDirectory = Join-Path $projectRoot 'infra/terraform'

foreach ($tool in @('terraform', 'docker', 'aws')) {
    if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) {
        throw "Install $tool and add it to PATH before running this release script."
    }
}
if ([string]::IsNullOrWhiteSpace($ImageTag) -and -not (Get-Command git -ErrorAction SilentlyContinue)) {
    throw 'Install Git or pass -ImageTag explicitly.'
}

Push-Location $projectRoot
try {
    $callerArn = (& aws sts get-caller-identity --query Arn --output text).Trim()
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($callerArn)) {
        throw 'AWS CLI authentication failed. Configure a dedicated deployment identity.'
    }
    if ($callerArn -match ':root$') {
        throw 'Do not deploy as the AWS root user. Use a dedicated least-privilege deployment identity.'
    }

    if ([string]::IsNullOrWhiteSpace($ImageTag)) {
        $dirtyFiles = & git status --porcelain
        if ($LASTEXITCODE -ne 0) { throw 'Run this from a Git checkout or pass -ImageTag explicitly.' }
        if ($dirtyFiles) { throw 'Commit the release source before deployment so the ECR image has a reproducible commit tag.' }
        $ImageTag = (& git rev-parse --short=12 HEAD).Trim()
        if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($ImageTag)) {
            throw 'Could not determine the current Git commit for the deployment image tag.'
        }
    }
    if ($ImageTag -notmatch '^[A-Za-z0-9_][A-Za-z0-9_.-]{0,127}$') {
        throw 'ImageTag must use valid Docker tag characters and be no longer than 128 characters.'
    }

    $region = (& terraform -chdir=$terraformDirectory output -raw aws_region).Trim()
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($region)) {
        throw 'Apply the initial Terraform configuration before deploying the website.'
    }
    $repository = (& terraform -chdir=$terraformDirectory output -raw ecr_repository_url).Trim()
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($repository)) {
        throw 'Terraform did not return the ECR repository URL.'
    }
    $runtimeSecretArn = (& terraform -chdir=$terraformDirectory output -raw runtime_secret_arn).Trim()
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($runtimeSecretArn)) {
        throw 'Terraform did not return the runtime secret ARN.'
    }

    & aws secretsmanager get-secret-value --region $region --secret-id $runtimeSecretArn --version-stage AWSCURRENT --query VersionId --output text | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw 'Publish the Neon, Shazam, and admin values with scripts/publish-runtime-secrets.ps1 before deploying.'
    }

    $image = "${repository}:$ImageTag"
    Write-Host "Building immutable release image $image"
    & docker build --platform linux/amd64 --tag $image .
    if ($LASTEXITCODE -ne 0) { throw 'Docker image build failed.' }

    $registry = $repository.Split('/')[0]
    & aws ecr get-login-password --region $region | & docker login --username AWS --password-stdin $registry
    if ($LASTEXITCODE -ne 0) { throw 'Could not authenticate Docker to Amazon ECR.' }
    & docker push $image
    if ($LASTEXITCODE -ne 0) { throw 'Could not push the release image to Amazon ECR.' }

    Write-Host 'Terraform will now show the proposed production changes and ask for confirmation.'
    & terraform -chdir=$terraformDirectory apply "-var=image_tag=$ImageTag" -var=app_desired_count=1
    if ($LASTEXITCODE -ne 0) { throw 'Terraform did not complete the production deployment.' }

    $url = (& terraform -chdir=$terraformDirectory output -raw application_url).Trim()
    Write-Host "Release completed: $url"
}
finally {
    Pop-Location
}
