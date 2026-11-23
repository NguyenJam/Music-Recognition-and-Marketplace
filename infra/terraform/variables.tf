variable "project_name" {
  description = "Short project name used in AWS resource names and tags."
  type        = string
  default     = "melodex"
}

variable "aws_region" {
  description = "AWS region for the load balancer and ECS deployment."
  type        = string
  default     = "ap-southeast-2"
}

variable "admin_cidr" {
  description = "Your public IPv4 address with /32, allowed to reach the protected admin routes."
  type        = string

  validation {
    condition     = can(cidrhost(var.admin_cidr, 0)) && var.admin_cidr != "0.0.0.0/0"
    error_message = "Set admin_cidr to a specific trusted IPv4 CIDR, normally your address followed by /32."
  }
}

variable "vpc_cidr" {
  description = "IPv4 address range for the project VPC."
  type        = string
  default     = "10.40.0.0/16"
}

variable "image_tag" {
  description = "Immutable ECR image tag deployed by the release script."
  type        = string
  default     = "bootstrap"
}

variable "app_desired_count" {
  description = "Number of production Fargate tasks. Set to zero while provisioning secrets; use one for the live site."
  type        = number
  default     = 0

  validation {
    condition     = var.app_desired_count >= 0 && var.app_desired_count <= 2
    error_message = "app_desired_count must be between zero and two."
  }
}

variable "task_cpu" {
  description = "Fargate task CPU units. 512 is one half vCPU."
  type        = number
  default     = 512
}

variable "task_memory" {
  description = "Fargate task memory in MiB."
  type        = number
  default     = 2048
}

variable "certificate_arn" {
  description = "Optional ACM certificate ARN for application_domain in the selected region. When set, HTTP redirects to HTTPS."
  type        = string
  default     = ""
}

variable "application_domain" {
  description = "Optional DNS name covered by certificate_arn and pointed to the load balancer."
  type        = string
  default     = ""
}

variable "rapidapi_host" {
  description = "RapidAPI host used by the Shazam recognition integration."
  type        = string
  default     = "shazam.p.rapidapi.com"
}

variable "neon_project_id" {
  description = "Neon project identifier for resource tags and deployment notes."
  type        = string
  default     = "rapid-mud-44861187"
}
