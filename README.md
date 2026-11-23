# Melodex

Melodex is a Java music discovery and marketplace website. Visitors can identify a track from a short audio sample, search the catalogue, and browse physical and digital seller offers. The site adapts to desktop and mobile screens.

## How the project is deployed

GitHub stores the source code. Jenkins is available for local CI checks, and GitHub Actions verifies every pull request and deploys changes merged to `main`. The workflow builds the Spring Boot server, tests it against an isolated PostgreSQL test server, publishes an immutable container image to Amazon ECR, then updates Amazon ECS on Fargate behind the Application Load Balancer. AWS assumes a repository-and-branch-scoped IAM role through GitHub OIDC; no long-lived AWS access key is stored in GitHub. Neon hosts the shared PostgreSQL database; AWS does not create or copy a second database. Secrets Manager provides the Neon connection, Shazam key, and admin login to the running task. CloudWatch stores the application logs for seven days and provides the Melodex service dashboard.

The environments are kept simple:

- **Development:** Docker Compose on a team member’s computer, connected to the shared Neon database.
- **Continuous integration and test:** Jenkins can run the Gradle checks locally. GitHub Actions runs the same server checks, starts an isolated PostgreSQL instance and application test server, and verifies `/api/health` before a release.
- **Production:** one ECS Fargate service in AWS, reached through the load balancer. The deployment can be scaled to two tasks if needed.

Jenkins remains local so it does not need a continuously running AWS virtual machine. Jenkins, Docker, and Terraform have no software licence fee; AWS infrastructure has usage charges.

## Local development

Install Docker Desktop with its Linux container engine. Clone the project, open PowerShell in the repository, and run:

```powershell
.\scripts\run.ps1
```

On first use, the setup asks for the pooled PostgreSQL URL from Neon’s **Connect** panel. It saves the connection in the ignored `.env` file. Each teammate enters the same application-role connection on their own computer. Do not commit `.env`, `application-private.properties`, or any credentials.

Open <http://localhost:8080>. The database is in Neon, not in a local PostgreSQL container. Changes to catalogue metadata, seller listings, and purchase requests are shared by instances using the same Neon database. Browser-only cart, collection, wantlist, and saved-search data stays in that browser.

## Jenkins CI

Jenkins runs locally in Docker and is bound to `localhost:8081`. Start it with:

```powershell
docker compose --profile ci up -d jenkins
```

For first-time setup, get the initial password with:

```powershell
docker exec melodex-jenkins-1 cat /var/jenkins_home/secrets/initialAdminPassword
```

Create a Jenkins Pipeline job using **Pipeline script from SCM**, select Git, enter the repository URL and `main` branch, and use `Jenkinsfile` as the script path. The pipeline runs `:server:check` and `:server:bootJar`, then archives the JAR. This validates code independently of the production release workflow.

The GitHub Actions workflow at `.github/workflows/deploy.yml` runs on pull requests and pushes to `main`. Pull requests build and smoke-test the app against a temporary PostgreSQL test server. After a successful push to `main`, the workflow assumes the `melodex-github-actions-deploy` IAM role, pushes an immutable image to ECR, registers a new ECS task definition, waits for a healthy ECS rollout, and calls `/api/health`. The role is restricted to this repository's `main` branch. Configure it once with `scripts/setup-github-actions-deploy-role.ps1` using an AWS administrator profile. The workflow does not read or write catalogue records during a build; the deployed app continues using the shared Neon database through its runtime secret. Database schema changes must be expressed by the SQL initialization or an explicit migration. The manual `scripts/deploy-ecs.ps1` remains available for an initial or recovery release.

## AWS production deployment

The AWS configuration uses one public Application Load Balancer and one small Fargate service. The load balancer spans two availability zones and checks `/api/health`. The container runs in public subnets to avoid NAT gateway charges, but its security group accepts inbound traffic only from the load balancer. The tasks need outbound internet access for Neon and the recognition API. Only the admin routes are restricted to `admin_cidr`; the rest of the site is public.

The ALB can use HTTP for a short class demonstration. For a public production site, provide a domain and an ACM certificate in the selected region. Set both `application_domain` and `certificate_arn` in `terraform.tfvars`; HTTP will then redirect to HTTPS. Without TLS, do not enter admin credentials over an untrusted network.

### Requirements

- Docker Desktop, for building the Linux image.
- Terraform 1.6 or newer.
- AWS CLI authenticated as a dedicated deployment role or user with only the required project permissions. Do not deploy as the AWS root user.
- An AWS account and the Neon pooled database URL.
- For HTTPS: a domain you control and a validated ACM certificate in `ap-southeast-2`.

### First-time setup

1. Copy the example variables file and replace the sample admin IP with your current public IPv4 address and `/32`:

   ```powershell
   Copy-Item infra/terraform/terraform.tfvars.example infra/terraform/terraform.tfvars
   ```

   Keep `app_desired_count = 0` for the initial infrastructure setup. Set the certificate and domain values together if HTTPS is ready.

2. Create the AWS network, load balancer, ECR repository, ECS cluster and service shell, IAM task role, log group, and empty runtime secret:

   ```powershell
   terraform -chdir=infra/terraform init
   terraform -chdir=infra/terraform apply
   ```

   Terraform shows the resources and asks before applying. The load balancer is billable even while the service has zero tasks, so create it shortly before the demonstration.

3. Create the repository-scoped GitHub deployment role once, using an AWS administrator profile:

   ```powershell
   .\scripts\setup-github-actions-deploy-role.ps1
   ```

   The role trusts only the `main` branch of `NguyenJam/Music-Recognition-and-Marketplace` and can publish to the Melodex ECR repository and update the production ECS service. It does not contain database or Shazam credentials.

4. Publish the runtime values to Secrets Manager:

   ```powershell
   .\scripts\publish-runtime-secrets.ps1
   ```

   The script asks for the Neon pooled URL, Shazam RapidAPI key, and admin login. It reads the Shazam key from the ignored `application-private.properties` file when present; otherwise, it asks for it without echoing. The admin password must be at least 16 characters. Secret values are not stored in Terraform state or Git.

5. For the initial production release, commit the source and build, push, and deploy that commit:

   Before releasing, change `app_desired_count` to `1` in your ignored `terraform.tfvars` file. Keeping it at one prevents later Terraform updates from scaling the site back to zero.

   ```powershell
   .\scripts\deploy-ecs.ps1
   ```

   The script tags the Docker image with the Git commit, pushes it to ECR, and runs Terraform with one production task. Terraform displays the change and waits for confirmation. After the target passes its health check, get the site URL with:

   ```powershell
   terraform -chdir=infra/terraform output -raw application_url
   ```

The initial deployment keeps an immutable ECR image tag. After the GitHub Actions workflow is enabled on `main`, each successful push follows the same image, health-check, and rollback path automatically.

### Where to inspect the running services

In the AWS Console, select **Asia Pacific (Sydney) (`ap-southeast-2`)**. Open **ECS → Clusters → `melodex-cluster` → Services → `melodex-production`** to see task status and deployment events. Open **EC2 → Load Balancers → `melodex-web`** for the public endpoint and **Target Groups → `melodex-app`** for health checks. Open **CloudWatch → Dashboards → `Melodex-Service-Monitoring`** to inspect ECS CPU/memory, healthy targets, response time and server errors. The pushed container images are under **ECR → Repositories → `melodex`**; application logs are under **CloudWatch → Log groups → `/melodex/production`**. The Neon database remains visible in the Neon Console under project `rapid-mud-44861187`.

### Stopping AWS charges

Setting the service to zero stops Fargate task charges, but the load balancer and its public IP addresses continue to incur charges. To remove the project’s AWS resources when the demonstration is over, run:

```powershell
terraform -chdir=infra/terraform destroy
```

Terraform asks for confirmation before deletion. The runtime secret uses a seven-day recovery window, so AWS may retain that secret during its recovery period. Keep the local Terraform state file; it is ignored by Git and is needed to manage or remove the resources later.

## Cost estimate

The AWS Price List API for **Asia Pacific (Sydney)** returned Fargate rates of **US$0.04856 per vCPU-hour** and **US$0.00532 per GB-hour**. At the configured 0.5 vCPU and 2 GB, one task running continuously for 730 hours is about **US$25.49/month**. The current Application Load Balancer base rate is **US$0.0252/hour** (about **US$18.40/month**), plus **US$0.008 per LCU-hour**. One LCU used continuously would add **US$5.84/month**. Two load-balancer IPv4 addresses and one task IPv4 address at US$0.005/address-hour add about **US$10.95/month**. The runtime secret is about **US$0.40/month**. See the [AWS Fargate](https://aws.amazon.com/fargate/pricing/), [Elastic Load Balancing](https://aws.amazon.com/elasticloadbalancing/pricing/), [public IPv4](https://aws.amazon.com/vpc/pricing/), and [Secrets Manager](https://aws.amazon.com/secrets-manager/pricing/) price pages.

That is roughly **US$61/month before** log ingestion, image storage, data transfer, taxes, or higher request volume. Actual billing varies with use and region. The estimate assumes one task runs all month and the load balancer uses one LCU each hour. There is no NAT gateway or AWS-hosted Jenkins instance in this design. Review the Terraform plan and AWS billing before deployment; AWS budgets notify but do not automatically cap or stop spending.

## Project layout

- `server/` — Spring Boot website, API, database access, and Shazam integration.
- `compose.yaml`, `Dockerfile`, and `infra/nginx.conf` — local container development.
- `Jenkinsfile` — Jenkins continuous integration pipeline.
- `infra/terraform/` — AWS VPC, Application Load Balancer, ECS/Fargate, ECR, IAM, Secrets Manager, and CloudWatch resources, including the service dashboard.
- `.github/workflows/deploy.yml` — pull request verification and main-branch release to ECR/ECS.
- `scripts/setup-github-actions-deploy-role.ps1` — configures the repository-scoped GitHub OIDC deploy role.
- `scripts/publish-runtime-secrets.ps1` — stores the deployment credentials in Secrets Manager.
- `scripts/deploy-ecs.ps1` — builds, tags, pushes, and deploys an immutable application image.
- `scripts/` — local setup and Neon configuration utilities.

## Admin page

The separate `/admin` page uses the username and password provided to the runtime secret. The AWS load balancer also limits `/admin`, `/admin/login`, and `/api/admin` routes to the configured `admin_cidr`. Change that address if your public IP changes. Local development continues to use the values in `.env`.
