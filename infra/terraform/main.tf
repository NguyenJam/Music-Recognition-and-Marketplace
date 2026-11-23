locals {
  admin_paths = [
    "/admin",
    "/admin/*",
    "/api/admin",
    "/api/admin/*",
  ]
}

data "aws_availability_zones" "available" {
  state = "available"
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

resource "aws_security_group" "load_balancer" {
  name        = "${var.project_name}-load-balancer"
  description = "Public web ingress; application traffic is forwarded to the ECS task."
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTP web traffic"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  dynamic "ingress" {
    for_each = var.certificate_arn == "" ? [] : [var.certificate_arn]
    content {
      description = "HTTPS web traffic"
      from_port   = 443
      to_port     = 443
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "application" {
  name        = "${var.project_name}-application"
  description = "Only the Melodex load balancer can reach the application container."
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "Spring Boot application traffic from the load balancer"
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.load_balancer.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "terraform_data" "tls_configuration" {
  input = {
    certificate_arn   = var.certificate_arn
    application_domain = var.application_domain
  }

  lifecycle {
    precondition {
      condition     = var.certificate_arn == "" || var.application_domain != ""
      error_message = "Set application_domain to the DNS name covered by certificate_arn so the HTTPS URL uses a matching certificate."
    }
  }
}

resource "aws_lb" "application" {
  name               = "${var.project_name}-web"
  internal           = false
  load_balancer_type = "application"
  ip_address_type    = "ipv4"
  subnets            = aws_subnet.public[*].id
  security_groups    = [aws_security_group.load_balancer.id]

  enable_deletion_protection = false

  tags = { Name = "${var.project_name}-web" }

  depends_on = [terraform_data.tls_configuration]
}

resource "aws_lb_target_group" "application" {
  name        = "${var.project_name}-app"
  port        = 8080
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_vpc.main.id

  health_check {
    enabled             = true
    path                = "/api/health"
    protocol            = "HTTP"
    matcher             = "200"
    interval            = 30
    timeout             = 10
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }

  tags = { Name = "${var.project_name}-app" }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.application.arn
  port              = 80
  protocol          = "HTTP"

  dynamic "default_action" {
    for_each = var.certificate_arn == "" ? [1] : []
    content {
      type             = "forward"
      target_group_arn = aws_lb_target_group.application.arn
    }
  }

  dynamic "default_action" {
    for_each = var.certificate_arn == "" ? [] : [1]
    content {
      type = "redirect"
      redirect {
        port        = "443"
        protocol    = "HTTPS"
        status_code = "HTTP_301"
      }
    }
  }
}

resource "aws_lb_listener" "https" {
  count             = var.certificate_arn == "" ? 0 : 1
  load_balancer_arn = aws_lb.application.arn
  port              = 443
  protocol          = "HTTPS"
  certificate_arn   = var.certificate_arn
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.application.arn
  }
}

locals {
  application_listener_arn = var.certificate_arn == "" ? aws_lb_listener.http.arn : aws_lb_listener.https[0].arn
}

resource "aws_lb_listener_rule" "admin_allowed" {
  listener_arn = local.application_listener_arn
  priority     = 10

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.application.arn
  }

  condition {
    path_pattern {
      values = local.admin_paths
    }
  }

  condition {
    source_ip {
      values = [var.admin_cidr]
    }
  }
}

resource "aws_lb_listener_rule" "admin_denied" {
  listener_arn = local.application_listener_arn
  priority     = 20

  action {
    type = "fixed-response"
    fixed_response {
      content_type = "text/plain"
      message_body = "Not found"
      status_code  = "404"
    }
  }

  condition {
    path_pattern {
      values = local.admin_paths
    }
  }

  condition {
    source_ip {
      values = ["0.0.0.0/0"]
    }
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
      description  = "Keep the ten newest immutable deployment images."
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

resource "aws_secretsmanager_secret" "runtime" {
  name                    = "${var.project_name}/runtime"
  description             = "Neon connection details, Shazam RapidAPI key, and protected admin login."
  recovery_window_in_days = 7
}

data "aws_iam_policy_document" "ecs_tasks_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "task_execution" {
  name               = "${var.project_name}-task-execution"
  assume_role_policy = data.aws_iam_policy_document.ecs_tasks_assume_role.json
}

resource "aws_iam_role_policy_attachment" "task_execution_managed" {
  role       = aws_iam_role.task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy" "task_secrets" {
  name = "${var.project_name}-read-runtime-secret"
  role = aws_iam_role.task_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["secretsmanager:GetSecretValue"]
      Resource = aws_secretsmanager_secret.runtime.arn
    }]
  })
}

resource "aws_ecs_cluster" "application" {
  name = "${var.project_name}-cluster"

  setting {
    name  = "containerInsights"
    value = "disabled"
  }
}

resource "aws_cloudwatch_log_group" "application" {
  name              = "/${var.project_name}/production"
  retention_in_days = 7
}

resource "aws_ecs_task_definition" "application" {
  family                   = "${var.project_name}-production"
  cpu                      = var.task_cpu
  memory                   = var.task_memory
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  execution_role_arn        = aws_iam_role.task_execution.arn

  container_definitions = jsonencode([{
    name      = "web"
    image     = "${aws_ecr_repository.app.repository_url}:${var.image_tag}"
    essential = true
    cpu       = var.task_cpu
    memory    = var.task_memory
    portMappings = [{
      name          = "http"
      containerPort = 8080
      hostPort      = 8080
      protocol      = "tcp"
      appProtocol   = "http"
    }]
    environment = [
      { name = "SHAZAM_RAPIDAPI_HOST", value = var.rapidapi_host },
    ]
    secrets = [
      { name = "DATABASE_URL", valueFrom = "${aws_secretsmanager_secret.runtime.arn}:production_database_url::" },
      { name = "DATABASE_USERNAME", valueFrom = "${aws_secretsmanager_secret.runtime.arn}:production_database_username::" },
      { name = "DATABASE_PASSWORD", valueFrom = "${aws_secretsmanager_secret.runtime.arn}:production_database_password::" },
      { name = "SHAZAM_RAPIDAPI_KEY", valueFrom = "${aws_secretsmanager_secret.runtime.arn}:rapidapi_key::" },
      { name = "ADMIN_USERNAME", valueFrom = "${aws_secretsmanager_secret.runtime.arn}:admin_username::" },
      { name = "ADMIN_PASSWORD", valueFrom = "${aws_secretsmanager_secret.runtime.arn}:admin_password::" },
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.application.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "web"
      }
    }
  }])

  depends_on = [aws_iam_role_policy_attachment.task_execution_managed, aws_iam_role_policy.task_secrets]
}

resource "aws_ecs_service" "application" {
  name            = "${var.project_name}-production"
  cluster         = aws_ecs_cluster.application.id
  task_definition = aws_ecs_task_definition.application.arn
  desired_count   = var.app_desired_count
  launch_type     = "FARGATE"

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200
  health_check_grace_period_seconds = 120
  enable_execute_command             = false

  network_configuration {
    subnets          = aws_subnet.public[*].id
    security_groups  = [aws_security_group.application.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.application.arn
    container_name   = "web"
    container_port   = 8080
  }

  depends_on = [
    aws_lb_listener_rule.admin_allowed,
    aws_lb_listener_rule.admin_denied,
  ]
}
