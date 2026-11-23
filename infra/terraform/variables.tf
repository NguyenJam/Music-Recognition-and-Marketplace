variable "project_name" {
  description = "Short project name used in AWS resource names and tags."
  type        = string
  default     = "melodex"
}

variable "aws_region" {
  description = "AWS region for EC2, ECR, Secrets Manager, and CloudWatch resources."
  type        = string
  default     = "ap-southeast-1"
}

variable "admin_cidr" {
  description = "Public IPv4 CIDR allowed to access Jenkins, the test site, and the admin dashboard. Use your current address with /32."
  type        = string
}

variable "vpc_cidr" {
  description = "IPv4 address range for the project VPC."
  type        = string
  default     = "10.40.0.0/16"
}

variable "jenkins_instance_type" {
  description = "EC2 size for the Jenkins controller."
  type        = string
  default     = "t3.large"
}

variable "app_instance_type" {
  description = "EC2 size for the test and production application servers."
  type        = string
  default     = "t3.small"
}

variable "neon_project_id" {
  description = "Neon project identifier used to describe the externally managed PostgreSQL project."
  type        = string
  default     = "rapid-mud-44861187"
}
