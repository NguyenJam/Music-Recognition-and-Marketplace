output "jenkins_url" {
  description = "Jenkins URL; access is restricted to admin_cidr."
  value       = "http://${aws_instance.jenkins.public_ip}:8080"
}

output "jenkins_instance_id" {
  description = "Instance ID for Systems Manager access to the Jenkins controller."
  value       = aws_instance.jenkins.id
}

output "test_url" {
  description = "Test site URL; access is restricted to admin_cidr."
  value       = "http://${aws_instance.application["test"].public_ip}"
}

output "test_instance_id" {
  description = "Test application instance ID for Systems Manager sessions."
  value       = aws_instance.application["test"].id
}

output "production_url" {
  description = "Production site URL. Add a DNS name and TLS before public release."
  value       = "http://${aws_instance.application["production"].public_ip}"
}

output "production_instance_id" {
  description = "Production application instance ID for Systems Manager sessions."
  value       = aws_instance.application["production"].id
}

output "ecr_repository_url" {
  description = "Private ECR repository used for the immutable application images."
  value       = aws_ecr_repository.app.repository_url
}

output "rapidapi_secret_name" {
  description = "Secrets Manager name to populate with scripts/publish-shazam-secret.ps1."
  value       = aws_secretsmanager_secret.rapidapi.name
}

output "database_secret_arn" {
  description = "Secrets Manager secret to populate with Neon pooled and direct branch URLs."
  value       = aws_secretsmanager_secret.neon_database.arn
}

output "admin_secret_arn" {
  description = "Secrets Manager secret for the protected catalogue monitoring page."
  value       = aws_secretsmanager_secret.admin.arn
}
