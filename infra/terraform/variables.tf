variable "project_name" {
  description = "Short project name used in AWS resource names and tags."
  type        = string
  default     = "melodex"
}

variable "aws_region" {
  description = "AWS region for the EC2, RDS, ECR, and CloudWatch resources."
  type        = string
  default     = "ap-southeast-1"
}

variable "admin_cidr" {
  description = "Public IPv4 CIDR allowed to access Jenkins on port 8080 and the test site on port 80. Use your current address with /32."
  type        = string
}

variable "vpc_cidr" {
  description = "IPv4 address range for the project VPC."
  type        = string
  default     = "10.40.0.0/16"
}

variable "jenkins_instance_type" {
  description = "EC2 size for Jenkins and the Android build SDK."
  type        = string
  default     = "t3.large"
}

variable "app_instance_type" {
  description = "EC2 size for the test and production application servers."
  type        = string
  default     = "t3.small"
}

variable "db_instance_class" {
  description = "RDS PostgreSQL size for each environment."
  type        = string
  default     = "db.t4g.micro"
}
