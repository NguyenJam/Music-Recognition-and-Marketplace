output "application_url" {
  description = "Public endpoint for the Melodex website. HTTPS is enabled when certificate_arn is configured."
  value       = var.certificate_arn == "" ? "http://${aws_lb.application.dns_name}" : "https://${var.application_domain}"
}

output "load_balancer_dns_name" {
  description = "AWS DNS name for the Application Load Balancer."
  value       = aws_lb.application.dns_name
}

output "ecr_repository_url" {
  description = "Private Amazon ECR repository used for immutable application image tags."
  value       = aws_ecr_repository.app.repository_url
}

output "runtime_secret_arn" {
  description = "Secrets Manager secret populated by scripts/publish-runtime-secrets.ps1."
  value       = aws_secretsmanager_secret.runtime.arn
}

output "ecs_cluster_name" {
  description = "ECS cluster name for the production service."
  value       = aws_ecs_cluster.application.name
}

output "ecs_service_name" {
  description = "ECS production service name."
  value       = aws_ecs_service.application.name
}

output "aws_region" {
  description = "AWS region used by this deployment."
  value       = var.aws_region
}

output "neon_project_id" {
  description = "External Neon PostgreSQL project connected to this application."
  value       = var.neon_project_id
}
