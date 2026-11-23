$ErrorActionPreference = 'Stop'

if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
    throw 'Install AWS CLI v2 and configure an administrator profile before creating the GitHub Actions deployment role.'
}

$accountId = (& aws sts get-caller-identity --query Account --output text).Trim()
if ($LASTEXITCODE -ne 0 -or $accountId -notmatch '^\d{12}$') {
    throw 'AWS authentication failed or did not return a valid account ID.'
}

$providerArn = "arn:aws:iam::$accountId`:oidc-provider/token.actions.githubusercontent.com"
$knownProvider = (& aws iam list-open-id-connect-providers --query "OpenIDConnectProviderList[?Arn=='$providerArn'].Arn | [0]" --output text).Trim()
if ($LASTEXITCODE -ne 0) { throw 'Could not check for the GitHub Actions OIDC provider.' }
if ([string]::IsNullOrWhiteSpace($knownProvider) -or $knownProvider -eq 'None') {
    & aws iam create-open-id-connect-provider `
        --url 'https://token.actions.githubusercontent.com' `
        --client-id-list 'sts.amazonaws.com' `
        --tags Key=Project,Value=Melodex Key=Purpose,Value=GitHubActionsDeployment | Out-Null
    if ($LASTEXITCODE -ne 0) { throw 'Could not create the GitHub Actions OIDC provider.' }
}

$roleName = 'melodex-github-actions-deploy'
$region = 'ap-southeast-2'
$trustPolicy = @{
    Version = '2012-10-17'
    Statement = @(@{
        Effect = 'Allow'
        Principal = @{ Federated = $providerArn }
        Action = 'sts:AssumeRoleWithWebIdentity'
        Condition = @{ StringEquals = @{
            'token.actions.githubusercontent.com:aud' = 'sts.amazonaws.com'
            'token.actions.githubusercontent.com:sub' = 'repo:NguyenJam@128838768/Music-Recognition-and-Marketplace@1442864783:ref:refs/heads/main'
        } }
    })
} | ConvertTo-Json -Depth 8 -Compress

$policy = @{
    Version = '2012-10-17'
    Statement = @(
        @{ Sid = 'EcrToken'; Effect = 'Allow'; Action = @('ecr:GetAuthorizationToken'); Resource = '*' },
        @{ Sid = 'PushMelodexImage'; Effect = 'Allow'; Action = @('ecr:BatchCheckLayerAvailability','ecr:BatchGetImage','ecr:InitiateLayerUpload','ecr:UploadLayerPart','ecr:CompleteLayerUpload','ecr:PutImage'); Resource = "arn:aws:ecr:$region`:$accountId`:repository/melodex" },
        @{ Sid = 'DescribeTaskDefinition'; Effect = 'Allow'; Action = @('ecs:DescribeTaskDefinition'); Resource = '*' },
        @{ Sid = 'RegisterMelodexTaskDefinition'; Effect = 'Allow'; Action = @('ecs:RegisterTaskDefinition'); Resource = "arn:aws:ecs:$region`:$accountId`:task-definition/melodex-production:*" },
        @{ Sid = 'UpdateProductionService'; Effect = 'Allow'; Action = @('ecs:DescribeServices','ecs:UpdateService'); Resource = "arn:aws:ecs:$region`:$accountId`:service/melodex-cluster/melodex-production" },
        @{ Sid = 'PassEcsExecutionRole'; Effect = 'Allow'; Action = @('iam:PassRole'); Resource = "arn:aws:iam::$accountId`:role/melodex-task-execution"; Condition = @{ StringEquals = @{ 'iam:PassedToService' = 'ecs-tasks.amazonaws.com' } } }
    )
} | ConvertTo-Json -Depth 10 -Compress

$trustFile = Join-Path $env:TEMP 'melodex-github-trust.json'
$policyFile = Join-Path $env:TEMP 'melodex-github-deploy-policy.json'
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($trustFile, $trustPolicy, $utf8NoBom)
[System.IO.File]::WriteAllText($policyFile, $policy, $utf8NoBom)

try {
    & aws iam get-role --role-name $roleName --query 'Role.Arn' --output text *> $null
    if ($LASTEXITCODE -eq 0) {
        & aws iam update-assume-role-policy --role-name $roleName --policy-document "file://$trustFile" | Out-Null
        if ($LASTEXITCODE -ne 0) { throw 'Could not update the deployment role trust policy.' }
    } else {
        & aws iam create-role --role-name $roleName --description 'GitHub Actions deployment role for Melodex main' --assume-role-policy-document "file://$trustFile" --tags Key=Project,Value=Melodex Key=Purpose,Value=GitHubActionsDeployment | Out-Null
        if ($LASTEXITCODE -ne 0) { throw 'Could not create the GitHub Actions deployment role.' }
    }
    & aws iam put-role-policy --role-name $roleName --policy-name MelodexEcrEcsDeploy --policy-document "file://$policyFile" | Out-Null
    if ($LASTEXITCODE -ne 0) { throw 'Could not apply the scoped ECR/ECS deployment policy.' }
    Write-Host "GitHub Actions can now deploy main using arn:aws:iam::$accountId`:role/$roleName"
} finally {
    Remove-Item -LiteralPath $trustFile,$policyFile -Force -ErrorAction SilentlyContinue
}
