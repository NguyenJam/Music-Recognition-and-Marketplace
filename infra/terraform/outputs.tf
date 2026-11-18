output "jenkins_url" {
  description = "Jenkins URL; access is restricted to admin_cidr."
  value       = "http://${aws_instance.jenkins.public_ip}:8080"
}

output "jenkins_instance_id" {
  description = "Instance ID for an interactive Systems Manager session to accept Android SDK licenses and install build packages."
  value       = aws_instance.jenkins.id
}

output "test_url" {
  description = "Test site URL; access is restricted to admin_cidr."
  value       = "http://${aws_instance.application["test"].public_ip}"
}

output "production_url" {
  description = "Production site URL. Add a DNS name and TLS before public release."
  value       = "http://${aws_instance.application["production"].public_ip}"
}

output "ecr_repository_url" {
  description = "Private ECR repository used for the immutable application images."
  value       = aws_ecr_repository.app.repository_url
}

output "rapidapi_secret_name" {
  description = "Secrets Manager name to populate with scripts/publish-shazam-secret.ps1."
  value       = aws_secretsmanager_secret.rapidapi.name
}

output "database_secret_arns" {
  description = "AWS-managed RDS administrator secret ARNs for test and production."
  value = {
    for environment, database in aws_db_instance.databases :
    environment => database.master_user_secret[0].secret_arn
  }
}
