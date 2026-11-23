locals {
  environments = {
    test = {
      subnet_index = 0
    }
    production = {
      subnet_index = 1
    }
  }
}

data "aws_caller_identity" "current" {}

data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }

  filter {
    name   = "architecture"
    values = ["x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = { Name = "${var.project_name}-vpc" }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags   = { Name = "${var.project_name}-internet-gateway" }
}

resource "aws_subnet" "public" {
  count                   = 2
  vpc_id                  = aws_vpc.main.id
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, count.index)
  map_public_ip_on_launch = true

  tags = { Name = "${var.project_name}-public-${count.index + 1}" }
}

resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  availability_zone = data.aws_availability_zones.available.names[count.index]
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + 10)

  tags = { Name = "${var.project_name}-private-${count.index + 1}" }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = { Name = "${var.project_name}-public-routes" }
}

resource "aws_route_table_association" "public" {
  count          = 2
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_security_group" "jenkins" {
  name        = "${var.project_name}-jenkins"
  description = "Jenkins administration restricted to the configured administrator CIDR."
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "Jenkins web console"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = [var.admin_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "application" {
  for_each    = local.environments
  name        = "${var.project_name}-${each.key}"
  description = "HTTP access for the ${each.key} application environment."
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTP website through NGINX"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = each.key == "production" ? ["0.0.0.0/0"] : [var.admin_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_ecr_repository" "app" {
  name                 = var.project_name
  image_tag_mutability = "IMMUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_lifecycle_policy" "app" {
  repository = aws_ecr_repository.app.name
  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep the ten newest commit-tagged images."
      selection = {
        tagStatus      = "tagged"
        tagPatternList = ["*"]
        countType      = "imageCountMoreThan"
        countNumber    = 10
      }
      action = { type = "expire" }
    }]
  })
}

resource "aws_secretsmanager_secret" "rapidapi" {
  name                    = "${var.project_name}/rapidapi-key"
  description             = "RapidAPI Shazam key. Add the value after Terraform creates this secret."
  recovery_window_in_days = 7
}

resource "aws_secretsmanager_secret" "neon_database" {
  name                    = "${var.project_name}/neon-database-connections"
  description             = "Neon pooled runtime and direct importer URLs for test and production branches in ${var.neon_project_id}."
  recovery_window_in_days = 7
}

resource "aws_secretsmanager_secret" "admin" {
  name                    = "${var.project_name}/admin-credentials"
  description             = "HTTP Basic credentials for the read-only Melodex admin dashboard."
  recovery_window_in_days = 7
}

data "aws_iam_policy_document" "ec2_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "jenkins" {
  name               = "${var.project_name}-jenkins-ec2"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume_role.json
}

resource "aws_iam_role_policy_attachment" "jenkins_ssm" {
  role       = aws_iam_role.jenkins.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_role_policy_attachment" "jenkins_cloudwatch" {
  role       = aws_iam_role.jenkins.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
}

resource "aws_iam_role_policy" "jenkins_deploy" {
  name = "${var.project_name}-jenkins-deploy"
  role = aws_iam_role.jenkins.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:CompleteLayerUpload",
          "ecr:InitiateLayerUpload",
          "ecr:PutImage",
          "ecr:UploadLayerPart"
        ]
        Resource = aws_ecr_repository.app.arn
      },
      {
        Effect   = "Allow"
        Action   = ["ec2:DescribeInstances", "ssm:SendCommand", "ssm:GetCommandInvocation"]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_instance_profile" "jenkins" {
  name = "${var.project_name}-jenkins"
  role = aws_iam_role.jenkins.name
}

resource "aws_iam_role" "application" {
  name               = "${var.project_name}-application-ec2"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume_role.json
}

resource "aws_iam_role_policy_attachment" "application_ssm" {
  role       = aws_iam_role.application.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_role_policy_attachment" "application_cloudwatch" {
  role       = aws_iam_role.application.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
}

resource "aws_iam_role_policy_attachment" "application_ecr" {
  role       = aws_iam_role.application.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_iam_role_policy" "application_secrets" {
  name = "${var.project_name}-read-runtime-secrets"
  role = aws_iam_role.application.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = ["secretsmanager:GetSecretValue"]
      Resource = [
        aws_secretsmanager_secret.rapidapi.arn,
        aws_secretsmanager_secret.neon_database.arn,
        aws_secretsmanager_secret.admin.arn
      ]
    }]
  })
}

resource "aws_iam_instance_profile" "application" {
  name = "${var.project_name}-application"
  role = aws_iam_role.application.name
}

resource "aws_instance" "jenkins" {
  ami                         = data.aws_ami.ubuntu.id
  instance_type               = var.jenkins_instance_type
  subnet_id                   = aws_subnet.public[0].id
  vpc_security_group_ids      = [aws_security_group.jenkins.id]
  iam_instance_profile        = aws_iam_instance_profile.jenkins.name
  associate_public_ip_address = true
  user_data                   = file("${path.module}/bootstrap-jenkins.sh")
  user_data_replace_on_change = true

  root_block_device {
    volume_size           = 60
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true
  }

  tags = {
    Name        = "${var.project_name}-jenkins"
    Environment = "ci"
  }
}

resource "aws_instance" "application" {
  for_each = local.environments

  ami                         = data.aws_ami.ubuntu.id
  instance_type               = var.app_instance_type
  subnet_id                   = aws_subnet.public[each.value.subnet_index].id
  vpc_security_group_ids      = [aws_security_group.application[each.key].id]
  iam_instance_profile        = aws_iam_instance_profile.application.name
  associate_public_ip_address = true
  user_data = templatefile("${path.module}/bootstrap-app.sh.tftpl", {
    aws_region            = var.aws_region
    ecr_registry          = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.aws_region}.amazonaws.com"
    db_secret_arn         = aws_secretsmanager_secret.neon_database.arn
    admin_secret_arn      = aws_secretsmanager_secret.admin.arn
    environment           = each.key
    neon_project_id       = var.neon_project_id
    rapidapi_secret_arn   = aws_secretsmanager_secret.rapidapi.arn
    rapidapi_host         = "shazam.p.rapidapi.com"
    deploy_script_b64     = base64encode(file("${path.module}/../../scripts/deploy-ec2.sh"))
    compose_file_b64      = base64encode(file("${path.module}/../../compose.aws.yaml"))
    nginx_config_b64      = base64encode(templatefile("${path.module}/../nginx.aws.conf.tftpl", {
      admin_cidr = var.admin_cidr
    }))
    cloudwatch_config_b64 = base64encode(file("${path.module}/../cloudwatch-agent.json"))
  })
  user_data_replace_on_change = true

  root_block_device {
    volume_size           = 24
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true
  }

  depends_on = [aws_iam_role_policy.application_secrets]

  tags = {
    Name        = "${var.project_name}-${each.key}"
    Environment = each.key
  }
}

resource "aws_cloudwatch_metric_alarm" "production_cpu" {
  alarm_name          = "${var.project_name}-production-high-cpu"
  alarm_description   = "Production EC2 CPU is above 80 percent for two five-minute periods."
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  treat_missing_data  = "notBreaching"

  dimensions = {
    InstanceId = aws_instance.application["production"].id
  }
}
